// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Notification, AdminUser } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";

export const Route = createFileRoute("/api/v1/admin/events/$eventSlug/notifications")({
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
          const audience = url.searchParams.get("audience") ?? undefined;
          const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
          const pageSize = Math.min(200, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "50")));

          const filter: Record<string, unknown> = { eventId: event._id };
          if (audience === "ADMIN" || audience === "CUSTOMER") filter["audience"] = audience;

          const [total, records] = await Promise.all([
            Notification.countDocuments(filter),
            Notification.find(filter)
              .sort({ createdAt: -1 })
              .skip((page - 1) * pageSize)
              .limit(pageSize)
              .lean(),
          ]);

          return apiOk({
            notifications: records.map((n) => ({
              id: String(n._id),
              audience: n.audience,
              recipient: n.recipient,
              subject: n.subject,
              body: n.body,
              status: n.status,
              bookingRef: n.bookingRef ?? null,
              createdAt: n.createdAt.toISOString(),
            })),
            total,
            page,
            pageSize,
          });
        }),
    },
  },
});
