// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Space, FloorPlan, Booking, ACTIVE_BOOKING_STATUSES, AdminUser } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";
import { z } from "zod";

const PatchSchema = z.object({
  label: z.string().trim().min(1).max(200).optional(),
  canvasWidth: z.number().int().min(400).optional(),
  canvasHeight: z.number().int().min(300).optional(),
  elements: z.array(z.object({
    elementType: z.enum(["facility", "aisle"]),
    label: z.string().optional(),
    sublabel: z.string().optional(),
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
    tone: z.enum(["stage", "service", "amenity", "access"]).optional(),
    isVertical: z.boolean().optional(),
    sortOrder: z.number().optional(),
  })).optional(),
});

export const Route = createFileRoute("/api/v1/admin/events/$eventSlug/floor-plan")({
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

          const [floorPlan, spaces, activeBookings] = await Promise.all([
            FloorPlan.findOne({ eventId: event._id }).lean(),
            Space.find({ eventId: event._id }).lean(),
            Booking.find({ eventId: event._id, status: { $in: ACTIVE_BOOKING_STATUSES } })
              .select("spaceId status").lean(),
          ]);
          if (!floorPlan) return apiError(404, "FLOOR_PLAN_NOT_FOUND", "Floor plan not found.");

          const statusMap = new Map(activeBookings.map((b) => [String(b.spaceId), b.status]));

          return apiOk({
            floorPlan: {
              id: String(floorPlan._id),
              label: floorPlan.label,
              canvasWidth: floorPlan.canvasWidth,
              canvasHeight: floorPlan.canvasHeight,
              elements: floorPlan.elements,
            },
            spaces: spaces.map((s) => ({
              id: String(s._id),
              spaceNumber: s.spaceNumber,
              zone: s.zone,
              category: s.category,
              sizeLabel: s.sizeLabel,
              price: s.price,
              x: s.x, y: s.y, w: s.w, h: s.h,
              isActive: s.isActive,
              bookingStatus: statusMap.get(String(s._id)) ?? "AVAILABLE",
            })),
          });
        }),

      PATCH: async ({ request, params }) =>
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

          let body: z.infer<typeof PatchSchema>;
          try {
            body = PatchSchema.parse(await request.json());
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Validation failed.";
            return apiError(422, "VALIDATION_ERROR", msg);
          }

          const fp = await FloorPlan.findOne({ eventId: event._id });
          if (!fp) return apiError(404, "FLOOR_PLAN_NOT_FOUND", "Floor plan not found.");

          if (body.label !== undefined) fp.label = body.label;
          if (body.canvasWidth !== undefined) fp.canvasWidth = body.canvasWidth;
          if (body.canvasHeight !== undefined) fp.canvasHeight = body.canvasHeight;
          if (body.elements !== undefined) fp.elements = body.elements as typeof fp.elements;
          await fp.save();

          return apiOk({ id: String(fp._id), label: fp.label });
        }),
    },
  },
});
