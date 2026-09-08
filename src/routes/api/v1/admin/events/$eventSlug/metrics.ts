// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Space, Booking, AdminUser } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";
import { sweepExpiredBookings } from "@/server/lib/expiry";

export const Route = createFileRoute("/api/v1/admin/events/$eventSlug/metrics")({
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

          await sweepExpiredBookings(String(event._id));

          const [total, bookings] = await Promise.all([
            Space.countDocuments({ eventId: event._id, isActive: true }),
            Booking.find({ eventId: event._id }).select("status").lean(),
          ]);

          const count = (s: string) => bookings.filter((b) => b.status === s).length;

          const paymentPending = count("PAYMENT_PENDING");
          const paymentReview = count("PAYMENT_REVIEW");
          const confirmed = count("CONFIRMED");
          const expired = count("EXPIRED");
          const cancelled = count("CANCELLED");
          const conflicts = count("CONFLICT");
          const available = Math.max(0, total - paymentPending - paymentReview - confirmed);

          return apiOk({
            total,
            available,
            paymentPending,
            paymentReview,
            confirmed,
            expired,
            cancelled,
            conflicts,
            currency: event.currency,
          });
        }),
    },
  },
});
