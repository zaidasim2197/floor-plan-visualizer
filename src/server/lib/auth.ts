import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { IAdminUser, AdminRole } from "../models/index";
import { apiError } from "./errors";

const ACCESS_SECRET = () => {
  const s = process.env["JWT_ACCESS_SECRET"];
  if (!s) throw new Error("JWT_ACCESS_SECRET is not set");
  return s;
};
const REFRESH_SECRET = () => {
  const s = process.env["JWT_REFRESH_SECRET"];
  if (!s) throw new Error("JWT_REFRESH_SECRET is not set");
  return s;
};

const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";

export interface AccessTokenPayload {
  sub: string; // AdminUser _id
  username: string;
  isSuperAdmin: boolean;
}

export function signAccessToken(user: IAdminUser): string {
  const payload: AccessTokenPayload = {
    sub: String(user._id),
    username: user.username,
    isSuperAdmin: user.isSuperAdmin,
  };
  return jwt.sign(payload, ACCESS_SECRET(), { expiresIn: ACCESS_TTL });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, REFRESH_SECRET(), { expiresIn: REFRESH_TTL });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET()) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, REFRESH_SECRET()) as { sub: string };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Extract and verify the Bearer token from a request. Returns the payload or throws a Response. */
export function requireAuth(request: Request): AccessTokenPayload {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw apiError(401, "UNAUTHORIZED", "Authentication required.");
  try {
    return verifyAccessToken(token);
  } catch {
    throw apiError(401, "TOKEN_INVALID", "Access token is invalid or expired.");
  }
}

/** Require the caller to be a SUPER_ADMIN. */
export function requireSuperAdmin(payload: AccessTokenPayload): void {
  if (!payload.isSuperAdmin)
    throw apiError(403, "FORBIDDEN", "Super-admin access required.");
}

/**
 * Require the caller to have at least the given role on a specific event,
 * OR be a SUPER_ADMIN (which overrides all per-event checks).
 */
export function requireEventRole(
  payload: AccessTokenPayload,
  user: IAdminUser,
  eventId: string,
  minimumRole: AdminRole,
): void {
  if (payload.isSuperAdmin) return;

  const ROLE_ORDER: AdminRole[] = ["VIEWER", "ORGANISER", "SUPER_ADMIN"];
  const roleEntry = user.eventRoles.find((r) => String(r.eventId) === eventId);
  if (!roleEntry) throw apiError(403, "FORBIDDEN", "You do not have access to this event.");

  const callerLevel = ROLE_ORDER.indexOf(roleEntry.role);
  const requiredLevel = ROLE_ORDER.indexOf(minimumRole);
  if (callerLevel < requiredLevel)
    throw apiError(403, "FORBIDDEN", `Requires ${minimumRole} role or higher.`);
}
