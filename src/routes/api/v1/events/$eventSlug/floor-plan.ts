// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Space, FloorPlan, Booking, ACTIVE_BOOKING_STATUSES } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { toDisplayStatus } from "@/server/lib/displayStatus";
import { sweepExpiredBookings } from "@/server/lib/expiry";

export const Route = createFileRoute("/api/v1/events/$eventSlug/floor-plan")({
  server: {
    handlers: {
      GET: ({ params }) =>
        handle(async () => {
          await connectDB();
          const event = await Event.findOne({ slug: params.eventSlug, isPublished: true }).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");

          // Lazy expiry sweep before serving availability data
          await sweepExpiredBookings(String(event._id));

          const [floorPlan, spaces, activeBookings] = await Promise.all([
            FloorPlan.findOne({ eventId: event._id }).lean(),
            Space.find({ eventId: event._id, isActive: true }).lean(),
            Booking.find({
              eventId: event._id,
              status: { $in: ACTIVE_BOOKING_STATUSES },
            })
              .select("spaceId status")
              .lean(),
          ]);

          if (!floorPlan) return apiError(404, "FLOOR_PLAN_NOT_FOUND", "Floor plan not configured.");

          // Build a spaceId → displayStatus map
          const statusMap = new Map(
            activeBookings.map((b) => [String(b.spaceId), toDisplayStatus(b.status)]),
          );

          const spacesWithStatus = spaces.map((s) => ({
            id: String(s._id),
            stallId: s.spaceNumber,
            spaceNumber: s.spaceNumber,
            zone: s.zone,
            category: s.category,
            sizeLabel: s.sizeLabel,
            price: s.price,
            x: s.x,
            y: s.y,
            w: s.w,
            h: s.h,
            displayStatus: statusMap.get(String(s._id)) ?? "AVAILABLE",
          }));

          const facilities = floorPlan.elements
            .filter((e) => e.elementType === "facility")
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map(({ label, sublabel, x, y, w, h, tone }) => ({
              label, sublabel, x, y, w, h, tone,
            }));

          const aisles = floorPlan.elements
            .filter((e) => e.elementType === "aisle")
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map(({ x, y, w, h, isVertical }) => ({ x, y, w, h, isVertical: isVertical ?? false }));

          return apiOk({
            floorPlan: {
              id: String(floorPlan._id),
              label: floorPlan.label,
              canvasWidth: floorPlan.canvasWidth,
              canvasHeight: floorPlan.canvasHeight,
            },
            spaces: spacesWithStatus,
            facilities,
            aisles,
          });
        }),
    },
  },
});
