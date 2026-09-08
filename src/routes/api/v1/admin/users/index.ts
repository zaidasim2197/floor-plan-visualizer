// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { AdminUser } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireSuperAdmin, hashPassword } from "@/server/lib/auth";
import { z } from "zod";

const CreateUserSchema = z.object({
  username: z.string().trim().min(3).max(60).toLowerCase(),
  password: z.string().min(8).max(100),
  displayName: z.string().trim().min(1).max(100),
  isSuperAdmin: z.boolean().default(false),
  eventRoles: z.array(z.object({
    eventId: z.string().min(1),
    role: z.enum(["ORGANISER", "VIEWER"]),
  })).default([]),
});

export const Route = createFileRoute("/api/v1/admin/users/")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          await connectDB();
          const payload = requireAuth(request);
          requireSuperAdmin(payload);

          const users = await AdminUser.find({}).select("-passwordHash -refreshTokenHash").lean();
          return apiOk(users.map((u) => ({
            id: String(u._id),
            username: u.username,
            displayName: u.displayName,
            isSuperAdmin: u.isSuperAdmin,
            isActive: u.isActive,
            eventRoles: u.eventRoles.map((r) => ({ eventId: String(r.eventId), role: r.role })),
            createdAt: u.createdAt.toISOString(),
          })));
        }),

      POST: async ({ request }) =>
        handle(async () => {
          await connectDB();
          const payload = requireAuth(request);
          requireSuperAdmin(payload);

          let body: z.infer<typeof CreateUserSchema>;
          try {
            body = CreateUserSchema.parse(await request.json());
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Invalid request body.";
            return apiError(422, "VALIDATION_ERROR", msg);
          }

          const existing = await AdminUser.findOne({ username: body.username }).lean();
          if (existing) return apiError(409, "DUPLICATE_USERNAME", `Username "${body.username}" is already taken.`);

          const hash = await hashPassword(body.password);
          const user = await AdminUser.create({
            username: body.username,
            passwordHash: hash,
            displayName: body.displayName,
            isSuperAdmin: body.isSuperAdmin,
            eventRoles: body.eventRoles,
            isActive: true,
          });

          return apiOk({ id: String(user._id), username: user.username }, 201);
        }),
    },
  },
});
