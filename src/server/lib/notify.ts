// @ts-nocheck
import { AuditEvent, Notification } from "../models/index";
import type { Types } from "mongoose";

/**
 * Append an immutable audit log entry.
 */
export async function audit(
  action: string,
  actor: string,
  details: string,
  bookingId?: string,
  bookingRef?: string,
  eventId?: string,
): Promise<void> {
  try {
    await AuditEvent.create({
      action,
      actor,
      details,
      bookingId: bookingId ?? undefined,
      bookingRef: bookingRef ?? undefined,
      eventId: eventId ?? undefined,
    });
  } catch (err) {
    console.error("[audit] failed to write audit event", err);
  }
}

/**
 * Record an outbound notification.
 * In this sprint notifications are logged in TEST_MODE — no real email is sent.
 * Replace the body of this function with a real email provider call when ready.
 */
export async function notify(
  audience: "ADMIN" | "CUSTOMER",
  recipient: string,
  subject: string,
  body: string,
  bookingId?: string,
  bookingRef?: string,
  eventId?: string,
): Promise<void> {
  try {
    await Notification.create({
      audience,
      recipient,
      subject,
      body,
      bookingId: bookingId ?? undefined,
      bookingRef: bookingRef ?? undefined,
      eventId: eventId ?? undefined,
      status: "TEST_MODE",
    });
  } catch (err) {
    console.error("[notify] failed to record notification", err);
  }
}
