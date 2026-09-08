// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, AdminUser } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";
import { z } from "zod";

const PatchSchema = z.object({
  name: z.string().trim().min(3).max(120).optional(),
  tagline: z.string().trim().max(300).optional(),
  description: z.string().trim().max(2000).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  dateLabel: z.string().trim().max(100).optional(),
  timeLabel: z.string().trim().max(100).optional(),
  venue: z.object({
    name: z.string().trim().min(2),
    city: z.string().trim().min(2),
    address: z.string().trim().min(5),
  }).optional(),
  contact: z.object({
    email: z.string().trim().email(),
    phone: z.string().trim().min(7),
    whatsapp: z.array(z.string().trim()),
  }).optional(),
  booking: z.object({
    paymentPendingMinutes: z.number().int().min(5).max(1440),
    paymentReviewGraceHours: z.number().int().min(1).max(168),
  }).optional(),
  floorPlanLabel: z.string().trim().max(200).optional(),
  paymentProviders: z.array(z.string()).optional(),
  payfastMerchantId: z.string().trim().optional(),
  safepayPublicKey: z.string().trim().optional(),
  isPublished: z.boolean().optional(),
});

export const Route = createFileRoute("/api/v1/admin/events/$eventSlug/")({
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
          return apiOk({ ...event, id: String(event._id), _id: undefined });
        }),

      PATCH: async ({ request, params }) =>
        handle(async () => {
          await connectDB();
          const payload = requireAuth(request);
          const event = await Event.findOne({ slug: params.eventSlug });
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
            const msg = e instanceof Error ? e.message : "Invalid request body.";
            return apiError(422, "VALIDATION_ERROR", msg);
          }

          Object.assign(event, body);
          await event.save();
          return apiOk({ id: String(event._id), slug: event.slug, name: event.name });
        }),

      DELETE: async ({ request, params }) =>
        handle(async () => {
          await connectDB();
          const payload = requireAuth(request);
          if (!payload.isSuperAdmin)
            return apiError(403, "FORBIDDEN", "Only SUPER_ADMIN can delete events.");

          const event = await Event.findOne({ slug: params.eventSlug });
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");

          event.isPublished = false; // soft-delete
          await event.save();
          return apiOk({ ok: true, message: "Event unpublished (soft-deleted)." });
        }),
    },
  },
});
