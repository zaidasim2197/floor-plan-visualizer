// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { AdminUser } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyPassword,
  hashPassword,
} from "@/server/lib/auth";
import { z } from "zod";

const RefreshSchema = z.object({ refreshToken: z.string().min(1) });

export const Route = createFileRoute("/api/v1/admin/auth/refresh")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request; params: Record<string, string> }) =>
        handle(async () => {
          await connectDB();
          let body: z.infer<typeof RefreshSchema>;
          try {
            body = RefreshSchema.parse(await request.json());
          } catch {
            return apiError(400, "VALIDATION_ERROR", "refreshToken is required.");
          }

          let payload: { sub: string };
          try {
            payload = verifyRefreshToken(body.refreshToken);
          } catch {
            return apiError(401, "TOKEN_INVALID", "Refresh token is invalid or expired.");
          }

          const user = await AdminUser.findById(payload.sub);
          if (!user || !user.isActive || !user.refreshTokenHash)
            return apiError(401, "TOKEN_REVOKED", "Session has been revoked.");

          const valid = await verifyPassword(body.refreshToken, user.refreshTokenHash);
          if (!valid) return apiError(401, "TOKEN_REVOKED", "Refresh token does not match.");

          const accessToken = signAccessToken(user);
          const newRefreshToken = signRefreshToken(String(user._id));
          user.refreshTokenHash = await hashPassword(newRefreshToken);
          await user.save();

          return apiOk({ accessToken, expiresIn: 900, refreshToken: newRefreshToken });
        }),
    },
  },
});
