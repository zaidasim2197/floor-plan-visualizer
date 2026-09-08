// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Space } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth } from "@/server/lib/auth";
import { checkPlacement } from "@/server/lib/placement";
import { z } from "zod";

const Schema = z.object({
  id: z.string().default("draft"),
  x: z.number().min(0),
  y: z.number().min(0),
  w: z.number().min(20),
  h: z.number().min(20),
  excludeSpaceId: z.string().optional(),
});

export const Route = createFileRoute(
  "/api/v1/admin/events/$eventSlug/spaces/validate-placement",
)({
  server: {
    handlers: {
      POST: async ({ request, params }: { request: Request; params: Record<string, string> }) =>
        handle(async () => {
          await connectDB();
          requireAuth(request);

          const event = await Event.findOne({ slug: params["eventSlug"] }).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");

          let body: z.infer<typeof Schema>;
          try {
            body = Schema.parse(await request.json());
          } catch {
            return apiError(400, "VALIDATION_ERROR", "x, y, w, h are required.");
          }

          const spaces = await Space.find({ eventId: event._id }).lean();
          const filtered = spaces.filter((s) =>
            body.excludeSpaceId ? String(s._id) !== body.excludeSpaceId : true,
          );

          const result = checkPlacement(
            { id: body.id, x: body.x, y: body.y, w: body.w, h: body.h },
            filtered.map((s) => ({ id: String(s._id), spaceNumber: s.spaceNumber, ...s })),
          );

          return apiOk(result);
        }),
    },
  },
});
