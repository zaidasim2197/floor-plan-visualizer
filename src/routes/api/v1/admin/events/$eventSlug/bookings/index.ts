// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Space, Booking, AdminUser, ACTIVE_BOOKING_STATUSES } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";
import { generateReference } from "@/server/lib/reference";
import { audit, notify } from "@/server/lib/notify";
import { sweepExpiredBookings } from "@/server/lib/expiry";
import { z } from "zod";

const ManualBookingSchema = z.object({
  spaceId: z.string().min(1),
  customerName: z.string().trim().min(1).max(120),
  companyName: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(30),
  productService: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(1000).optional(),
  initialStatus: z.enum(["PAYMENT_PENDING", "CONFIRMED"]).default("CONFIRMED"),
});

export const Route = createFileRoute("/api/v1/admin/events/$eventSlug/bookings/")({
  server: {
    handlers: {
      GET: async ({ request, params }) =>
        handle(async () => {
          await connectDB();
          const payload = requireAuth(request);
          const event = await Event.findOne({ slug: params.eventSlug }).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");
          if (!payload.isSuperAdmin) {
            const user = await AdminUser.findById(payload.sub).lean();
            if (!user) return apiError(401, "UNAUTHORIZED", "User not found.");
            requireEventRole(payload, user as Parameters<typeof requireEventRole>[1], String(event._id), "VIEWER");
          }

          const url = new URL(request.url);
          const statusFilter = url.searchParams.get("status") ?? "ALL";
          const paymentFilter = url.searchParams.get("paymentStatus") ?? "ALL";
          const search = (url.searchParams.get("search") ?? "").trim().toLowerCase();
          const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
          const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "25")));

          const filter: Record<string, unknown> = { eventId: event._id };
          if (statusFilter !== "ALL") filter["status"] = statusFilter;
          if (paymentFilter !== "ALL") filter["paymentStatus"] = paymentFilter;
          if (search) {
            filter["$or"] = [
              { reference: { $regex: search, $options: "i" } },
              { customerName: { $regex: search, $options: "i" } },
              { companyName: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { paymentReference: { $regex: search, $options: "i" } },
            ];
          }

          const [total, bookings] = await Promise.all([
            Booking.countDocuments(filter),
            Booking.find(filter)
              .sort({ createdAt: -1 })
              .skip((page - 1) * pageSize)
              .limit(pageSize)
              .lean(),
          ]);

          // Attach spaceNumber for convenience
          const spaceIds = [...new Set(bookings.map((b) => String(b.spaceId)))];
          const spaces = await Space.find({ _id: { $in: spaceIds } }).select("spaceNumber zone").lean();
          const spaceMap = new Map(spaces.map((s) => [String(s._id), s]));

          return apiOk({
            bookings: bookings.map((b) => {
              const sp = spaceMap.get(String(b.spaceId));
              return {
                id: String(b._id),
                reference: b.reference,
                spaceId: String(b.spaceId),
                spaceNumber: sp?.spaceNumber ?? "",
                zone: sp?.zone ?? "",
                customerName: b.customerName,
                companyName: b.companyName,
                email: b.email,
                phone: b.phone,
                productService: b.productService,
                notes: b.notes,
                amount: b.amount,
                status: b.status,
                paymentStatus: b.paymentStatus,
                paymentReference: b.paymentReference ?? null,
                proofStorageKey: b.proofStorageKey ?? null,
                expiresAt: b.expiresAt?.toISOString() ?? null,
                paymentSubmittedAt: b.paymentSubmittedAt?.toISOString() ?? null,
                confirmedAt: b.confirmedAt?.toISOString() ?? null,
                cancelledAt: b.cancelledAt?.toISOString() ?? null,
                conflictReason: b.conflictReason ?? null,
                source: b.source,
                createdAt: b.createdAt.toISOString(),
              };
            }),
            total,
            page,
            pageSize,
          });
        }),

      POST: async ({ request, params }) =>
        handle(async () => {
          await connectDB();
          const payload = requireAuth(request);
          const event = await Event.findOne({ slug: params.eventSlug }).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");
          if (!payload.isSuperAdmin) {
            const user = await AdminUser.findById(payload.sub).lean();
            if (!user) return apiError(401, "UNAUTHORIZED", "User not found.");
            requireEventRole(payload, user as Parameters<typeof requireEventRole>[1], String(event._id), "ORGANISER");
          }

          let body: z.infer<typeof ManualBookingSchema>;
          try {
            body = ManualBookingSchema.parse(await request.json());
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Invalid request body.";
            return apiError(422, "VALIDATION_ERROR", msg);
          }

          await sweepExpiredBookings(String(event._id));

          const space = await Space.findOne({ _id: body.spaceId, eventId: event._id }).lean();
          if (!space) return apiError(404, "SPACE_NOT_FOUND", "Space not found.");

          const holdMs = event.booking.paymentPendingMinutes * 60 * 1000;
          const expiresAt = new Date(Date.now() + holdMs);
          const reference = generateReference(event.slug);

          let booking;
          try {
            [booking] = await Booking.create([{
              eventId: event._id,
              spaceId: space._id,
              reference,
              customerName: body.customerName,
              companyName: body.companyName,
              email: body.email,
              phone: body.phone,
              productService: body.productService ?? "",
              notes: body.notes ?? "Manually created via Admin Panel",
              amount: space.price,
              status: body.initialStatus,
              paymentStatus: body.initialStatus === "CONFIRMED" ? "VERIFIED" : "UNPAID",
              expiresAt,
              confirmedAt: body.initialStatus === "CONFIRMED" ? new Date() : undefined,
              source: "ADMIN",
            }]);
          } catch (err: unknown) {
            const mongoErr = err as { code?: number };
            if (mongoErr.code === 11000)
              return apiError(409, "SPACE_NO_LONGER_AVAILABLE",
                "This space is already booked.");
            throw err;
          }

          void audit("MANUAL_BOOKING_CREATED", payload.username,
            `Admin created booking for ${space.spaceNumber} (${body.companyName}).`,
            String(booking._id), reference, String(event._id));

          return apiOk({ reference: booking.reference, id: String(booking._id) }, 201);
        }),
    },
  },
});
