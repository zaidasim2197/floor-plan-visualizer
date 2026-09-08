import type { BookingStatus } from "../models/index";

export type DisplayStatus = "AVAILABLE" | "ON_HOLD" | "CONFIRMED";

/**
 * Map internal BookingStatus to the public-facing displayStatus.
 * EXPIRED and CANCELLED free the space, so they map to AVAILABLE.
 */
export function toDisplayStatus(status: BookingStatus): DisplayStatus {
  if (status === "CONFIRMED") return "CONFIRMED";
  if (status === "PAYMENT_PENDING" || status === "PAYMENT_REVIEW") return "ON_HOLD";
  return "AVAILABLE"; // EXPIRED, CANCELLED, CONFLICT
}
