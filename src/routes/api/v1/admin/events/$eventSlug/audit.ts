// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, AuditEvent, AdminUser } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";

export const Route = createFileRoute("/api/v1/admin/events/$eventSlug/audit")({
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

          const url = new URL(request.url);
          const bookingRef = url.searchParams.get("bookingRef") ?? undefined;
          const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
          const pageSize = Math.min(200, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "50")));

          const filter: Record<string, unknown> = { eventId: event._id };
          if (bookingRef) filter["bookingRef"] = bookingRef;

          const [total, entries] = await Promise.all([
            AuditEvent.countDocuments(filter),
            AuditEvent.find(filter)
              .sort({ createdAt: -1 })
              .skip((page - 1) * pageSize)
              .limit(pageSize)
              .lean(),
          ]);

          return apiOk({
            entries: entries.map((a) => ({
              id: String(a._id),
              action: a.action,
              actor: a.actor,
              details: a.details,
              bookingRef: a.bookingRef ?? null,
              createdAt: a.createdAt.toISOString(),
            })),
            total,
            page,
            pageSize,
          });
        }),
    },
  },
});
