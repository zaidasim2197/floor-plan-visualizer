// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Space, Booking, ACTIVE_BOOKING_STATUSES } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { toDisplayStatus } from "@/server/lib/displayStatus";
import { sweepExpiredBookings } from "@/server/lib/expiry";

export const Route = createFileRoute("/api/v1/events/$eventSlug/spaces/$spaceId")({
  server: {
    handlers: {
      GET: ({ params }) =>
        handle(async () => {
          await connectDB();
          const event = await Event.findOne({ slug: params.eventSlug, isPublished: true }).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");

          await sweepExpiredBookings(String(event._id));

          const space = await Space.findOne({
            _id: params.spaceId,
            eventId: event._id,
            isActive: true,
          }).lean();
          if (!space) return apiError(404, "SPACE_NOT_FOUND", "Space not found.");

          const activeBooking = await Booking.findOne({
            spaceId: space._id,
            eventId: event._id,
            status: { $in: ACTIVE_BOOKING_STATUSES },
          })
            .select("status")
            .lean();

          return apiOk({
            id: String(space._id),
            spaceNumber: space.spaceNumber,
            zone: space.zone,
            category: space.category,
            sizeLabel: space.sizeLabel,
            price: space.price,
            x: space.x,
            y: space.y,
            w: space.w,
            h: space.h,
            displayStatus: activeBooking ? toDisplayStatus(activeBooking.status) : "AVAILABLE",
          });
        }),
    },
  },
});
