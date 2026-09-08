// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Space, FloorPlan, Booking, AdminUser } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";
import { checkPlacement } from "@/server/lib/placement";
import { SPACE_CATEGORIES } from "@/server/models/Space";
import { z } from "zod";

const SpaceSchema = z.object({
  spaceNumber: z.string().trim().min(1).max(20),
  zone: z.string().trim().min(2).max(100),
  category: z.enum(SPACE_CATEGORIES),
  sizeLabel: z.string().trim().min(2).max(60),
  price: z.number().finite().min(0).max(100_000_000),
  x: z.number().min(0),
  y: z.number().min(0),
  w: z.number().min(20),
  h: z.number().min(20),
}).refine((s) => s.x + s.w <= 1200 && s.y + s.h <= 800, {
  message: "Space must fit inside the 1200 × 800 map.",
});

export const Route = createFileRoute("/api/v1/admin/events/$eventSlug/spaces/")({
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

          const spaces = await Space.find({ eventId: event._id }).sort({ spaceNumber: 1 }).lean();
          const activeBookings = await Booking.find({
            eventId: event._id,
            status: { $in: ["PAYMENT_PENDING", "PAYMENT_REVIEW", "CONFIRMED"] },
          }).select("spaceId status").lean();
          const statusMap = new Map(activeBookings.map((b) => [String(b.spaceId), b.status]));

          return apiOk(spaces.map((s) => ({
            id: String(s._id),
            spaceNumber: s.spaceNumber,
            zone: s.zone,
            category: s.category,
            sizeLabel: s.sizeLabel,
            price: s.price,
            x: s.x, y: s.y, w: s.w, h: s.h,
            isActive: s.isActive,
            bookingStatus: statusMap.get(String(s._id)) ?? "AVAILABLE",
          })));
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

          let body: z.infer<typeof SpaceSchema>;
          try {
            body = SpaceSchema.parse(await request.json());
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Validation failed.";
            return apiError(422, "VALIDATION_ERROR", msg);
          }

          // Uniqueness checks
          const dupNumber = await Space.findOne({
            eventId: event._id,
            spaceNumber: { $regex: new RegExp(`^${body.spaceNumber}$`, "i") },
          }).lean();
          if (dupNumber) return apiError(422, "DUPLICATE_SPACE_NUMBER",
            `Space number "${body.spaceNumber}" already exists in this event.`);

          // Placement collision check
          const existing = await Space.find({ eventId: event._id }).lean();
          const placementResult = checkPlacement(
            { id: "new", ...body },
            existing.map((s) => ({ id: String(s._id), spaceNumber: s.spaceNumber, ...s })),
          );
          if (!placementResult.valid) {
            return apiError(422, "INVALID_SPACE_PLACEMENT", placementResult.message);
          }

          const floorPlan = await FloorPlan.findOne({ eventId: event._id }).lean();
          if (!floorPlan) return apiError(404, "FLOOR_PLAN_NOT_FOUND", "Create a floor plan first.");

          const space = await Space.create({
            ...body,
            eventId: event._id,
            floorPlanId: floorPlan._id,
            isActive: true,
          });

          return apiOk({ id: String(space._id), spaceNumber: space.spaceNumber }, 201);
        }),
    },
  },
});
