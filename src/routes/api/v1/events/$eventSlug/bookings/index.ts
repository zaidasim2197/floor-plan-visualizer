import mongoose from "mongoose";
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
  holdToken: z.string().trim().optional(),
  reference: z.string().trim().optional(),
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

          // Allow spaceId to match either MongoDB ObjectId or spaceNumber (e.g. "A02", "B01")
          const isObjectId = mongoose.Types.ObjectId.isValid(body.spaceId);
          const space = await Space.findOne({
            eventId: event._id,
            isActive: true,
            ...(isObjectId
              ? { $or: [{ _id: body.spaceId }, { spaceNumber: body.spaceId }] }
              : { spaceNumber: body.spaceId }),
          }).lean();
          if (!space) return apiError(404, "SPACE_NOT_FOUND", "Space not found.");

          const holdMs = event.booking.paymentPendingMinutes * 60 * 1000;
          const expiresAt = new Date(Date.now() + holdMs);
          const incomingHoldToken = body.holdToken || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36));

          // Check if there is already an active booking for this space
          const existingActiveBooking = await Booking.findOne({
            eventId: event._id,
            spaceId: space._id,
            status: { $in: ACTIVE_BOOKING_STATUSES },
          });

          if (existingActiveBooking) {
            // Check if this is the SAME user trying to resume or update their existing hold
            const isSameUser =
              existingActiveBooking.status === "PAYMENT_PENDING" &&
              ((body.holdToken && existingActiveBooking.holdToken === body.holdToken) ||
                (body.reference && existingActiveBooking.reference === body.reference) ||
                existingActiveBooking.email.toLowerCase() === body.email.toLowerCase());

            if (isSameUser) {
              // Update customer details, refresh hold expiry, and preserve/set holdToken
              existingActiveBooking.customerName = body.customerName;
              existingActiveBooking.companyName = body.companyName;
              existingActiveBooking.email = body.email.toLowerCase();
              existingActiveBooking.phone = body.phone;
              if (body.productService !== undefined) existingActiveBooking.productService = body.productService;
              if (body.notes !== undefined) existingActiveBooking.notes = body.notes;
              existingActiveBooking.expiresAt = expiresAt;
              if (!existingActiveBooking.holdToken) {
                existingActiveBooking.holdToken = incomingHoldToken;
              }
              await existingActiveBooking.save();

              return apiOk({
                reference: existingActiveBooking.reference,
                holdToken: existingActiveBooking.holdToken,
                bookingId: String(existingActiveBooking._id),
                spaceId: String(existingActiveBooking.spaceId),
                spaceNumber: space.spaceNumber,
                customerName: existingActiveBooking.customerName,
                companyName: existingActiveBooking.companyName,
                amount: existingActiveBooking.amount,
                currency: event.currency,
                status: existingActiveBooking.status,
                paymentStatus: existingActiveBooking.paymentStatus,
                expiresAt: existingActiveBooking.expiresAt.toISOString(),
                createdAt: existingActiveBooking.createdAt.toISOString(),
                resumed: true,
              }, 200);
            }

            // Conflicting active booking held by someone else
            return apiError(409, "SPACE_NO_LONGER_AVAILABLE",
              "This space is currently on hold or booked by another customer. Please choose another space.");
          }

          const reference = generateReference(event.slug);

          // Atomic insert — the partial unique index rejects a duplicate active booking
          let booking;
          try {
            [booking] = await Booking.create([
              {
                eventId: event._id,
                spaceId: space._id,
                reference,
                holdToken: incomingHoldToken,
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
            holdToken: booking.holdToken,
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
            resumed: false,
          }, 201);
        }),
    },
  },
});
