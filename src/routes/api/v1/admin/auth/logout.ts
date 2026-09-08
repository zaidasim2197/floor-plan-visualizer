// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { AdminUser } from "@/server/models/index";
import { apiOk, handle } from "@/server/lib/errors";
import { requireAuth } from "@/server/lib/auth";

export const Route = createFileRoute("/api/v1/admin/auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request; params: Record<string, string> }) =>
        handle(async () => {
          await connectDB();
          try {
            const payload = requireAuth(request);
            await AdminUser.findByIdAndUpdate(payload.sub, {
              $unset: { refreshTokenHash: 1 },
            });
          } catch {
            // Even on bad token, return 200 — the client is logging out
          }
          return apiOk({ ok: true });
        }),
    },
  },
});
