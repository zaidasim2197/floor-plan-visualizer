// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Space, Booking, AdminUser } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";

export const Route = createFileRoute("/api/v1/admin/events/$eventSlug/summary")({
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

          const [totalSpaces, bookings] = await Promise.all([
            Space.countDocuments({ eventId: event._id, isActive: true }),
            Booking.find({ eventId: event._id })
              .select("spaceId status paymentStatus amount")
              .lean(),
          ]);

          // Mirrors summarizeBookings() in src/lib/admin-data.ts exactly
          const activeStatuses = ["PAYMENT_PENDING", "PAYMENT_REVIEW", "CONFIRMED"];
          const occupied = new Set(
            bookings
              .filter((b) => activeStatuses.includes(b.status))
              .map((b) => String(b.spaceId)),
          ).size;

          const sum = (pred: (b: typeof bookings[number]) => boolean) =>
            bookings.filter(pred).reduce((acc, b) => acc + b.amount, 0);

          const revenue = sum((b) => b.status === "CONFIRMED" && b.paymentStatus === "VERIFIED");
          const pending = sum((b) => b.status === "PAYMENT_PENDING" || b.status === "PAYMENT_REVIEW");
          const refunds = sum((b) => b.paymentStatus === "REFUND_PENDING");

          return apiOk({
            occupied,
            occupancy: totalSpaces ? Math.round((occupied / totalSpaces) * 100) : 0,
            revenue,
            pending,
            refunds,
            currency: event.currency,
            totalSpaces,
            serverTime: new Date().toISOString(),
          });
        }),
    },
  },
});
