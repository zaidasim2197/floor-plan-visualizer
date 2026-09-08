// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { AdminUser } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireSuperAdmin, hashPassword } from "@/server/lib/auth";
import { z } from "zod";

const PatchUserSchema = z.object({
  displayName: z.string().trim().min(1).max(100).optional(),
  password: z.string().min(8).max(100).optional(),
  isSuperAdmin: z.boolean().optional(),
  isActive: z.boolean().optional(),
  eventRoles: z.array(z.object({
    eventId: z.string().min(1),
    role: z.enum(["ORGANISER", "VIEWER"]),
  })).optional(),
});

export const Route = createFileRoute("/api/v1/admin/users/$userId")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) =>
        handle(async () => {
          await connectDB();
          const payload = requireAuth(request);
          requireSuperAdmin(payload);

          const user = await AdminUser.findById(params.userId);
          if (!user) return apiError(404, "USER_NOT_FOUND", "Admin user not found.");

          let body: z.infer<typeof PatchUserSchema>;
          try {
            body = PatchUserSchema.parse(await request.json());
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Invalid request body.";
            return apiError(422, "VALIDATION_ERROR", msg);
          }

          if (body.displayName !== undefined) user.displayName = body.displayName;
          if (body.isSuperAdmin !== undefined) user.isSuperAdmin = body.isSuperAdmin;
          if (body.isActive !== undefined) user.isActive = body.isActive;
          if (body.eventRoles !== undefined) {
            user.eventRoles = body.eventRoles as typeof user.eventRoles;
          }
          if (body.password) {
            user.passwordHash = await hashPassword(body.password);
            user.refreshTokenHash = undefined; // invalidate all sessions on password change
          }

          await user.save();
          return apiOk({ id: String(user._id), username: user.username, isActive: user.isActive });
        }),

      DELETE: async ({ request, params }) =>
        handle(async () => {
          await connectDB();
          const payload = requireAuth(request);
          requireSuperAdmin(payload);

          // Prevent self-deactivation
          if (params.userId === payload.sub)
            return apiError(409, "CANNOT_DEACTIVATE_SELF", "You cannot deactivate your own account.");

          const user = await AdminUser.findById(params.userId);
          if (!user) return apiError(404, "USER_NOT_FOUND", "Admin user not found.");

          user.isActive = false;
          user.refreshTokenHash = undefined; // revoke all active sessions
          await user.save();

          return apiOk({ ok: true, message: "User deactivated." });
        }),
    },
  },
});
