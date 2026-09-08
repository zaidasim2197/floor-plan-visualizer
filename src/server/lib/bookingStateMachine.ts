/**
 * All booking state transition guards live here — a single authoritative place.
 * Every mutation checks these before touching the database.
 */

import type { IBooking, BookingStatus } from "../models/index";
import { apiError } from "./errors";

export const ACTIVE_STATUSES: BookingStatus[] = [
  "PAYMENT_PENDING",
  "PAYMENT_REVIEW",
  "CONFIRMED",
];

/** Throw a 409 Response if the transition is not permitted. */
export function assertCanApprove(booking: IBooking): void {
  if (!["PAYMENT_PENDING", "PAYMENT_REVIEW", "CONFLICT"].includes(booking.status))
    throw apiError(409, "INVALID_TRANSITION", `Cannot approve a booking in status ${booking.status}.`);
}

export function assertCanRelease(booking: IBooking): void {
  if (!["PAYMENT_PENDING", "PAYMENT_REVIEW"].includes(booking.status))
    throw apiError(409, "INVALID_TRANSITION", `Cannot release a booking in status ${booking.status}.`);
}

export function assertCanReturnForCorrection(booking: IBooking): void {
  if (booking.status !== "PAYMENT_REVIEW")
    throw apiError(409, "INVALID_TRANSITION", `Return-for-correction requires PAYMENT_REVIEW status; got ${booking.status}.`);
}

export function assertCanSubmitEvidence(booking: IBooking): void {
  if (!["PAYMENT_PENDING", "EXPIRED", "CANCELLED"].includes(booking.status))
    throw apiError(409, "INVALID_TRANSITION", `Cannot submit evidence for a booking in status ${booking.status}.`);
}

export function assertCanConfirmOnline(booking: IBooking): void {
  if (!["PAYMENT_PENDING"].includes(booking.status))
    throw apiError(409, "INVALID_TRANSITION", `Online confirmation requires PAYMENT_PENDING status; got ${booking.status}.`);
}

export function assertCanResolveConflict(booking: IBooking): void {
  if (booking.status !== "CONFLICT")
    throw apiError(409, "INVALID_TRANSITION", `Resolve-conflict requires CONFLICT status; got ${booking.status}.`);
}

export function assertCanInitiateRefund(booking: IBooking): void {
  if (!["CONFIRMED", "CANCELLED"].includes(booking.status))
    throw apiError(409, "INVALID_TRANSITION", `Refund initiation requires CONFIRMED or CANCELLED status; got ${booking.status}.`);
  if (!["VERIFIED", "EVIDENCE_SUBMITTED"].includes(booking.paymentStatus))
    throw apiError(409, "INVALID_TRANSITION", `Refund requires VERIFIED or EVIDENCE_SUBMITTED payment; got ${booking.paymentStatus}.`);
}

export function assertCanCompleteRefund(booking: IBooking): void {
  if (booking.paymentStatus !== "REFUND_PENDING")
    throw apiError(409, "INVALID_TRANSITION", `Refund completion requires REFUND_PENDING payment status; got ${booking.paymentStatus}.`);
}
