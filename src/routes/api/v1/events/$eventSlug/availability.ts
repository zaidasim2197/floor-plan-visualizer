// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Space, Booking, ACTIVE_BOOKING_STATUSES } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { sweepExpiredBookings } from "@/server/lib/expiry";

export const Route = createFileRoute("/api/v1/events/$eventSlug/availability")({
  server: {
    handlers: {
      GET: ({ params }) =>
        handle(async () => {
          await connectDB();
          const event = await Event.findOne({ slug: params.eventSlug, isPublished: true }).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");

          await sweepExpiredBookings(String(event._id));

          const [total, activeBookings] = await Promise.all([
            Space.countDocuments({ eventId: event._id, isActive: true }),
            Booking.find({ eventId: event._id, status: { $in: ACTIVE_BOOKING_STATUSES } })
              .select("status")
              .lean(),
          ]);

          const confirmed = activeBookings.filter((b) => b.status === "CONFIRMED").length;
          const onHold = activeBookings.filter(
            (b) => b.status === "PAYMENT_PENDING" || b.status === "PAYMENT_REVIEW",
          ).length;
          const available = total - confirmed - onHold;

          return apiOk({ total, available: Math.max(0, available), onHold, confirmed });
        }),
    },
  },
});
