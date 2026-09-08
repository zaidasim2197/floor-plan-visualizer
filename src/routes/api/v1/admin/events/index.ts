// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, AdminUser } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth } from "@/server/lib/auth";
import { z } from "zod";

const EventSchema = z.object({
  slug: z.string().trim().min(2).max(60).regex(/^[a-z0-9-]+$/, "slug must be lowercase alphanumeric with hyphens"),
  name: z.string().trim().min(3).max(120),
  tagline: z.string().trim().max(300).default(""),
  description: z.string().trim().min(10).max(2000),
  edition: z.string().trim().max(60).default(""),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  dateLabel: z.string().trim().max(100).default(""),
  timeLabel: z.string().trim().max(100).default(""),
  venue: z.object({
    name: z.string().trim().min(2),
    city: z.string().trim().min(2),
    address: z.string().trim().min(5),
  }),
  currency: z.string().trim().length(3).default("PKR"),
  contact: z.object({
    email: z.string().trim().email(),
    phone: z.string().trim().min(7),
    whatsapp: z.array(z.string().trim()).default([]),
  }),
  booking: z.object({
    paymentPendingMinutes: z.number().int().min(5).max(1440).default(30),
    paymentReviewGraceHours: z.number().int().min(1).max(168).default(24),
  }),
  floorPlanLabel: z.string().trim().max(200).default(""),
  paymentProviders: z.array(z.string()).default(["MANUAL"]),
  payfastMerchantId: z.string().trim().optional(),
  safepayPublicKey: z.string().trim().optional(),
  isPublished: z.boolean().default(true),
}).refine(
  (v) => Date.parse(v.endDate) > Date.parse(v.startDate),
  { message: "endDate must be after startDate", path: ["endDate"] },
);

export const Route = createFileRoute("/api/v1/admin/events/")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          await connectDB();
          const payload = requireAuth(request);
          const user = await AdminUser.findById(payload.sub).lean();
          if (!user) return apiError(401, "UNAUTHORIZED", "User not found.");

          // SUPER_ADMIN sees all events; others see only their assigned events
          let events;
          if (payload.isSuperAdmin) {
            events = await Event.find({}).sort({ createdAt: -1 }).lean();
          } else {
            const eventIds = user.eventRoles.map((r) => r.eventId);
            events = await Event.find({ _id: { $in: eventIds } }).sort({ createdAt: -1 }).lean();
          }

          return apiOk(events.map((e) => ({
            id: String(e._id),
            slug: e.slug,
            name: e.name,
            dateLabel: e.dateLabel,
            venue: e.venue,
            currency: e.currency,
            isPublished: e.isPublished,
            paymentProviders: e.paymentProviders,
            booking: e.booking,
          })));
        }),

      POST: async ({ request }) =>
        handle(async () => {
          await connectDB();
          requireAuth(request); // ORGANISER or SUPER_ADMIN — presence of valid token is sufficient

          let body: z.infer<typeof EventSchema>;
          try {
            body = EventSchema.parse(await request.json());
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Invalid request body.";
            return apiError(422, "VALIDATION_ERROR", msg);
          }

          const existing = await Event.findOne({ slug: body.slug }).lean();
          if (existing) return apiError(409, "DUPLICATE_SLUG", `Slug "${body.slug}" is already in use.`);

          const event = await Event.create(body);
          return apiOk({ id: String(event._id), slug: event.slug, name: event.name }, 201);
        }),
    },
  },
});
