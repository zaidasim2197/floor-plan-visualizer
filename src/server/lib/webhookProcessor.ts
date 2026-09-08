// @ts-nocheck
/**
 * Shared webhook processing logic used by all three webhook endpoints
 * (PayFast, Safepay, Simulated).  Handles replay protection, state transitions,
 * and audit/notification dispatch.
 */
import { Booking, PaymentWebhookEvent } from "../models/index";
import { audit, notify } from "./notify";
import type { WebhookVerificationResult } from "./webhooks";

export async function processVerifiedWebhook(
  result: WebhookVerificationResult,
  provider: string,
  rawBody: string,
  eventContactEmail: string,
  eventId: string,
): Promise<{ status: number; body: string }> {
  if (!result.valid) {
    console.warn(`[webhook:${provider}] invalid signature:`, result.reason);
    return { status: 400, body: JSON.stringify({ error: "INVALID_SIGNATURE", message: result.reason }) };
  }

  const { event: webhookEvent, providerRef = "", amount = 0 } = result;

  // Replay protection — acknowledge duplicate without state change
  const existing = await PaymentWebhookEvent.findOne({ gatewayRef: providerRef }).lean();
  if (existing) {
    return { status: 200, body: JSON.stringify({ ok: true, duplicate: true }) };
  }

  // Find booking by provider reference (m_payment_id / tracker)
  const booking = await Booking.findOne({ reference: providerRef }).exec()
    ?? await Booking.findOne({ paymentReference: providerRef }).exec();

  if (!booking) {
    // Record the unmatched event so it doesn't replay, then ack
    await PaymentWebhookEvent.create({
      gatewayRef: providerRef,
      provider,
      eventType: webhookEvent ?? "UNKNOWN",
      rawPayload: rawBody,
      processedAt: new Date(),
    }).catch(() => null);
    return { status: 200, body: JSON.stringify({ ok: true, note: "booking not found" }) };
  }

  // Record the webhook event before mutating state (replay-safe)
  await PaymentWebhookEvent.create({
    gatewayRef: providerRef,
    provider,
    bookingId: booking._id,
    eventType: webhookEvent ?? "UNKNOWN",
    rawPayload: rawBody,
    processedAt: new Date(),
  }).catch(() => null);

  if (webhookEvent === "PAYMENT_COMPLETE") {
    if (booking.status === "CONFIRMED") {
      // Already confirmed — idempotent ack
      return { status: 200, body: JSON.stringify({ ok: true }) };
    }
    if (booking.status !== "PAYMENT_PENDING") {
      return { status: 200, body: JSON.stringify({ ok: true, note: `status=${booking.status}` }) };
    }

    booking.status = "CONFIRMED";
    booking.paymentStatus = "VERIFIED";
    booking.paymentReference = providerRef;
    booking.paymentSubmittedAt = new Date();
    booking.confirmedAt = new Date();
    await booking.save();

    void audit("CARD_PAYMENT_SUCCESSFUL", "system",
      `${provider} payment ${providerRef} confirmed. Space ${String(booking.spaceId)} confirmed.`,
      String(booking._id), booking.reference, eventId);
    void notify("CUSTOMER", booking.email,
      `Payment confirmed — ${booking.reference}`,
      `Your payment has been processed and your space is confirmed. Ref: ${providerRef}`,
      String(booking._id), booking.reference, eventId);
    void notify("ADMIN", eventContactEmail,
      `Online payment confirmed — ${booking.reference}`,
      `${provider} payment ${providerRef} received for ${booking.companyName}.`,
      String(booking._id), booking.reference, eventId);

  } else if (webhookEvent === "PAYMENT_FAILED") {
    // bookingStatus intentionally unchanged per §4.2 — only audit + notify
    void audit("PAYMENT_FAILED", "system",
      `${provider} payment failed for ${booking.reference}. Booking remains ${booking.status}.`,
      String(booking._id), booking.reference, eventId);
    void notify("CUSTOMER", booking.email,
      `Payment attempt failed — ${booking.reference}`,
      `Your payment attempt was unsuccessful. Your hold is still active — please retry before it expires.`,
      String(booking._id), booking.reference, eventId);

  } else if (webhookEvent === "REFUND_COMPLETE") {
    if (booking.paymentStatus === "REFUND_PENDING") {
      booking.paymentStatus = "REFUNDED";
      booking.refundReference = providerRef;
      await booking.save();
      void audit("REFUND_COMPLETED", "system",
        `Refund ${providerRef} completed for ${booking.reference}.`,
        String(booking._id), booking.reference, eventId);
    }
  }

  return { status: 200, body: JSON.stringify({ ok: true }) };
}
