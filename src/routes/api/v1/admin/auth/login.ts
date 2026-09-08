// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { AdminUser } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import {
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  hashPassword,
} from "@/server/lib/auth";
import { z } from "zod";

const LoginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

// Simple in-memory rate-limiter keyed by IP — resets on process restart.
// Replace with Redis-backed limiter for multi-instance deployments.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 min

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  rec.count += 1;
  if (rec.count > MAX_ATTEMPTS) return false;
  return true;
}

export const Route = createFileRoute("/api/v1/admin/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request; params: Record<string, string> }) =>
        handle(async () => {
          const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
          if (!checkRateLimit(ip))
            return apiError(429, "TOO_MANY_REQUESTS",
              "Too many login attempts. Try again in 15 minutes.");

          await connectDB();

          let body: z.infer<typeof LoginSchema>;
          try {
            body = LoginSchema.parse(await request.json());
          } catch {
            return apiError(400, "VALIDATION_ERROR", "username and password are required.");
          }

          const user = await AdminUser.findOne({
            username: body.username.toLowerCase(),
            isActive: true,
          });
          if (!user) return apiError(401, "INVALID_CREDENTIALS", "Invalid credentials.");

          const ok = await verifyPassword(body.password, user.passwordHash);
          if (!ok) return apiError(401, "INVALID_CREDENTIALS", "Invalid credentials.");

          const accessToken = signAccessToken(user);
          const refreshToken = signRefreshToken(String(user._id));
          // Store hash of refresh token for rotation/revocation
          user.refreshTokenHash = await hashPassword(refreshToken);
          await user.save();

          return apiOk({
            accessToken,
            expiresIn: 900,
            refreshToken,
            user: {
              id: String(user._id),
              username: user.username,
              displayName: user.displayName,
              isSuperAdmin: user.isSuperAdmin,
              eventRoles: user.eventRoles.map((r) => ({
                eventId: String(r.eventId),
                role: r.role,
              })),
            },
          });
        }),
    },
  },
});
