// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Space, Booking, AuditEvent, AdminUser } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";
import { z } from "zod";

const UpdateSchema = z.object({
  customerName: z.string().trim().min(1).max(120).optional(),
  companyName: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(7).max(30).optional(),
  productService: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const Route = createFileRoute(
  "/api/v1/admin/events/$eventSlug/bookings/$reference",
)({
  server: {
    handlers: {
      GET: async ({ request, params }: { request: Request; params: Record<string, string> }) =>
        handle(async () => {
          await connectDB();
          const payload = requireAuth(request);
          const event = await Event.findOne({ slug: params["eventSlug"] }).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");
          if (!payload.isSuperAdmin) {
            const user = await AdminUser.findById(payload.sub).lean();
            if (!user) return apiError(401, "UNAUTHORIZED", "User not found.");
            requireEventRole(payload, user as Parameters<typeof requireEventRole>[1], String(event._id), "VIEWER");
          }

          const booking = await Booking.findOne({ reference: params["reference"], eventId: event._id }).lean();
          if (!booking) return apiError(404, "BOOKING_NOT_FOUND", "Booking not found.");

          const [space, auditLog] = await Promise.all([
            Space.findById(booking.spaceId).select("spaceNumber zone category sizeLabel price").lean(),
            AuditEvent.find({ bookingRef: booking.reference }).sort({ createdAt: -1 }).limit(50).lean(),
          ]);

          return apiOk({
            id: String(booking._id),
            reference: booking.reference,
            spaceId: String(booking.spaceId),
            spaceNumber: space?.spaceNumber ?? "",
            zone: space?.zone ?? "",
            category: space?.category ?? "",
            sizeLabel: space?.sizeLabel ?? "",
            amount: booking.amount,
            customerName: booking.customerName,
            companyName: booking.companyName,
            email: booking.email,
            phone: booking.phone,
            productService: booking.productService,
            notes: booking.notes,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            paymentReference: booking.paymentReference ?? null,
            refundReference: booking.refundReference ?? null,
            proofStorageKey: booking.proofStorageKey ?? null,
            conflictReason: booking.conflictReason ?? null,
            correctionReason: booking.correctionReason ?? null,
            source: booking.source,
            expiresAt: booking.expiresAt?.toISOString() ?? null,
            paymentSubmittedAt: booking.paymentSubmittedAt?.toISOString() ?? null,
            confirmedAt: booking.confirmedAt?.toISOString() ?? null,
            cancelledAt: booking.cancelledAt?.toISOString() ?? null,
            createdAt: booking.createdAt.toISOString(),
            auditLog: auditLog.map((a) => ({
              action: a.action,
              actor: a.actor,
              details: a.details,
              createdAt: a.createdAt.toISOString(),
            })),
          });
        }),

      PATCH: async ({ request, params }: { request: Request; params: Record<string, string> }) =>
        handle(async () => {
          await connectDB();
          const payload = requireAuth(request);
          const event = await Event.findOne({ slug: params["eventSlug"] }).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");
          if (!payload.isSuperAdmin) {
            const user = await AdminUser.findById(payload.sub).lean();
            if (!user) return apiError(401, "UNAUTHORIZED", "User not found.");
            requireEventRole(payload, user as Parameters<typeof requireEventRole>[1], String(event._id), "ORGANISER");
          }

          let body: z.infer<typeof UpdateSchema>;
          try {
            body = UpdateSchema.parse(await request.json());
          } catch {
            return apiError(422, "VALIDATION_ERROR", "Invalid update fields.");
          }

          const booking = await Booking.findOne({ reference: params["reference"], eventId: event._id });
          if (!booking) return apiError(404, "BOOKING_NOT_FOUND", "Booking not found.");

          Object.assign(booking, body);
          await booking.save();

          await AuditEvent.create({
            eventId: event._id,
            bookingId: booking._id,
            bookingRef: booking.reference,
            action: "BOOKING_UPDATED",
            actor: payload.username,
            details: "Booking details updated by admin.",
          });

          return apiOk({ reference: booking.reference, status: booking.status });
        }),
    },
  },
});
