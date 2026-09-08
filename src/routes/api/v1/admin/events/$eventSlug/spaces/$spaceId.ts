// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Space, Booking, AdminUser } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";
import { checkPlacement } from "@/server/lib/placement";
import { SPACE_CATEGORIES } from "@/server/models/Space";
import { z } from "zod";

const PatchSchema = z.object({
  spaceNumber: z.string().trim().min(1).max(20).optional(),
  zone: z.string().trim().min(2).max(100).optional(),
  category: z.enum(SPACE_CATEGORIES).optional(),
  sizeLabel: z.string().trim().min(2).max(60).optional(),
  price: z.number().finite().min(0).max(100_000_000).optional(),
  x: z.number().min(0).optional(),
  y: z.number().min(0).optional(),
  w: z.number().min(20).optional(),
  h: z.number().min(20).optional(),
  isActive: z.boolean().optional(),
});

export const Route = createFileRoute("/api/v1/admin/events/$eventSlug/spaces/$spaceId")({
  server: {
    handlers: {
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

          const space = await Space.findOne({ _id: params.spaceId, eventId: event._id });
          if (!space) return apiError(404, "SPACE_NOT_FOUND", "Space not found.");

          let body: z.infer<typeof PatchSchema>;
          try {
            body = PatchSchema.parse(await request.json());
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Validation failed.";
            return apiError(422, "VALIDATION_ERROR", msg);
          }

          // If geometry changed, re-run placement check
          const newGeo = {
            x: body.x ?? space.x, y: body.y ?? space.y,
            w: body.w ?? space.w, h: body.h ?? space.h,
          };
          const boundaryOk = newGeo.x + newGeo.w <= 1200 && newGeo.y + newGeo.h <= 800;
          if (!boundaryOk) return apiError(422, "INVALID_SPACE_PLACEMENT",
            "Space must fit inside the 1200 × 800 map.");

          const geometryChanged =
            newGeo.x !== space.x || newGeo.y !== space.y ||
            newGeo.w !== space.w || newGeo.h !== space.h;

          if (geometryChanged) {
            const siblings = await Space.find({ eventId: event._id }).lean();
            const result = checkPlacement(
              { id: String(space._id), ...newGeo },
              siblings.map((s) => ({ id: String(s._id), spaceNumber: s.spaceNumber, ...s })),
            );
            if (!result.valid) return apiError(422, "INVALID_SPACE_PLACEMENT", result.message);
          }

          // Uniqueness check for spaceNumber if changed
          if (body.spaceNumber && body.spaceNumber.toLowerCase() !== space.spaceNumber.toLowerCase()) {
            const dup = await Space.findOne({
              eventId: event._id,
              spaceNumber: { $regex: new RegExp(`^${body.spaceNumber}$`, "i") },
            }).lean();
            if (dup) return apiError(422, "DUPLICATE_SPACE_NUMBER",
              `Space number "${body.spaceNumber}" already exists.`);
          }

          // Price change does NOT cascade to existing bookings (§6.3)
          Object.assign(space, body);
          await space.save();
          return apiOk({ id: String(space._id), spaceNumber: space.spaceNumber });
        }),

      DELETE: async ({ request, params }) =>
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

          const space = await Space.findOne({ _id: params.spaceId, eventId: event._id }).lean();
          if (!space) return apiError(404, "SPACE_NOT_FOUND", "Space not found.");

          const hasHistory = await Booking.exists({ spaceId: space._id });
          if (hasHistory) return apiError(409, "SPACE_HAS_BOOKING_HISTORY",
            "This space has booking history and cannot be deleted. Set isActive=false to hide it.");

          await Space.deleteOne({ _id: space._id });
          return apiOk({ ok: true });
        }),
    },
  },
});
