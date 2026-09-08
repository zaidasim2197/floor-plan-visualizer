// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Space, Booking } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";

export const Route = createFileRoute("/api/v1/events/$eventSlug/attendees")({
  server: {
    handlers: {
      GET: ({ params }) =>
        handle(async () => {
          await connectDB();
          const event = await Event.findOne({ slug: params.eventSlug, isPublished: true }).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");

          const confirmedBookings = await Booking.find({
            eventId: event._id,
            status: "CONFIRMED",
          })
            .select("spaceId companyName productService")
            .lean();

          const spaceIds = confirmedBookings.map((b) => b.spaceId);
          const spaces = await Space.find({ _id: { $in: spaceIds } })
            .select("spaceNumber zone category")
            .lean();

          const spaceMap = new Map(spaces.map((s) => [String(s._id), s]));

          const attendees = confirmedBookings.map((b) => {
            const s = spaceMap.get(String(b.spaceId));
            return {
              spaceNumber: s?.spaceNumber ?? "",
              zone: s?.zone ?? "",
              companyName: b.companyName,
              productService: b.productService ?? "",
              category: s?.category ?? "",
            };
          });

          return apiOk({ attendees });
        }),
    },
  },
});
