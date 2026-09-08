// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Space, Booking, ACTIVE_BOOKING_STATUSES } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { sweepExpiredBookings } from "@/server/lib/expiry";
import { generateReference } from "@/server/lib/reference";
import { audit, notify } from "@/server/lib/notify";
import { z } from "zod";

const CreateBookingSchema = z.object({
  spaceId: z.string().min(1),
  customerName: z.string().trim().min(1).max(120),
  companyName: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(30),
  productService: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const Route = createFileRoute("/api/v1/events/$eventSlug/bookings/")({
  server: {
    handlers: {
      POST: async ({ request, params }) =>
        handle(async () => {
          await connectDB();

          const event = await Event.findOne({ slug: params.eventSlug, isPublished: true }).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");

          // Validate body
          let body: z.infer<typeof CreateBookingSchema>;
          try {
            body = CreateBookingSchema.parse(await request.json());
          } catch {
            return apiError(400, "VALIDATION_ERROR", "Invalid request body.");
          }

          // Lazy expiry sweep before availability check
          await sweepExpiredBookings(String(event._id));

          const space = await Space.findOne({
            _id: body.spaceId,
            eventId: event._id,
            isActive: true,
          }).lean();
          if (!space) return apiError(404, "SPACE_NOT_FOUND", "Space not found.");

          const holdMs = event.booking.paymentPendingMinutes * 60 * 1000;
          const expiresAt = new Date(Date.now() + holdMs);
          const reference = generateReference(event.slug);

          // Atomic insert — the partial unique index rejects a duplicate active booking
          let booking;
          try {
            [booking] = await Booking.create([
              {
                eventId: event._id,
                spaceId: space._id,
                reference,
                customerName: body.customerName,
                companyName: body.companyName,
                email: body.email,
                phone: body.phone,
                productService: body.productService ?? "",
                notes: body.notes ?? "",
                amount: space.price,
                status: "PAYMENT_PENDING",
                paymentStatus: "UNPAID",
                expiresAt,
                source: "PUBLIC",
              },
            ]);
          } catch (err: unknown) {
            const mongoErr = err as { code?: number };
            if (mongoErr.code === 11000) {
              return apiError(409, "SPACE_NO_LONGER_AVAILABLE",
                "This space was just taken by another customer. Please choose another space.");
            }
            throw err;
          }

          // Async audit + notifications — don't block the response
          void audit("BOOKING_CREATED", "customer",
            `${space.spaceNumber} held for ${body.companyName}.`,
            String(booking._id), reference, String(event._id));
          void notify("ADMIN", event.contact.email,
            `New booking — ${space.spaceNumber} (${reference})`,
            `${body.customerName} of ${body.companyName} requested space ${space.spaceNumber}. Amount: ${event.currency} ${space.price.toLocaleString()}.`,
            String(booking._id), reference, String(event._id));
          void notify("CUSTOMER", body.email,
            `Booking received — ${reference}`,
            `Your space ${space.spaceNumber} is temporarily reserved for ${event.booking.paymentPendingMinutes} minutes. Please complete payment.`,
            String(booking._id), reference, String(event._id));

          return apiOk({
            reference: booking.reference,
            bookingId: String(booking._id),
            spaceId: String(booking.spaceId),
            spaceNumber: space.spaceNumber,
            customerName: booking.customerName,
            companyName: booking.companyName,
            amount: booking.amount,
            currency: event.currency,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            expiresAt: booking.expiresAt.toISOString(),
            createdAt: booking.createdAt.toISOString(),
          }, 201);
        }),
    },
  },
});
