import crypto from "crypto";

export interface WebhookVerificationResult {
  valid: boolean;
  event?: "PAYMENT_COMPLETE" | "PAYMENT_FAILED" | "REFUND_COMPLETE";
  providerRef?: string;
  amount?: number;
  reason?: string;
}

// ─── PayFast ──────────────────────────────────────────────────────────────────

/**
 * PayFast: reconstruct the parameter string, append passphrase, compare MD5.
 * https://developers.payfast.co.za/docs#step_3_verify_the_signature
 */
export function verifyPayfastWebhook(
  body: string,
  passphrase: string,
): WebhookVerificationResult {
  const params = new URLSearchParams(body);
  const incomingSig = params.get("signature") ?? "";
  params.delete("signature");

  const sortedParts: string[] = [];
  for (const [key, value] of [...params.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    sortedParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  }
  if (passphrase) sortedParts.push(`passphrase=${encodeURIComponent(passphrase)}`);

  const sigString = sortedParts.join("&");
  const expected = crypto.createHash("md5").update(sigString).digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(incomingSig), Buffer.from(expected))) {
    return { valid: false, reason: "Signature mismatch" };
  }

  const status = params.get("payment_status") ?? "";
  const providerRef = params.get("pf_payment_id") ?? params.get("m_payment_id") ?? "";
  const amount = parseFloat(params.get("amount_gross") ?? "0");

  return {
    valid: true,
    event: status === "COMPLETE" ? "PAYMENT_COMPLETE" : "PAYMENT_FAILED",
    providerRef,
    amount,
  };
}

// ─── Safepay ──────────────────────────────────────────────────────────────────

/**
 * Safepay: HMAC-SHA256 of raw body, compared with X-SFPY-SIGNATURE header.
 */
export function verifySafepayWebhook(
  rawBody: string,
  signatureHeader: string,
  secretKey: string,
): WebhookVerificationResult {
  const expected = crypto
    .createHmac("sha256", secretKey)
    .update(rawBody)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected))) {
    return { valid: false, reason: "Signature mismatch" };
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return { valid: false, reason: "Invalid JSON body" };
  }

  const type = (payload["type"] as string | undefined) ?? "";
  const tracker = (payload["data"] as Record<string, unknown> | undefined) ?? {};
  const providerRef = (tracker["tracker"] as string | undefined) ?? "";
  const amount = parseFloat((tracker["amount"] as string | undefined) ?? "0") / 100;

  return {
    valid: true,
    event: type === "payment:created" ? "PAYMENT_COMPLETE" : "PAYMENT_FAILED",
    providerRef,
    amount,
  };
}

// ─── Simulated (dev/test only) ────────────────────────────────────────────────

export function verifySimulatedWebhook(
  rawBody: string,
  signatureHeader: string,
): WebhookVerificationResult {
  const secret = process.env["SIMULATED_WEBHOOK_SECRET"] ?? "simulated-secret";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected))) {
    return { valid: false, reason: "Simulated signature mismatch" };
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return { valid: false, reason: "Invalid JSON body" };
  }

  return {
    valid: true,
    event: (payload["event"] as WebhookVerificationResult["event"]) ?? "PAYMENT_COMPLETE",
    providerRef: (payload["providerRef"] as string | undefined) ?? "",
    amount: (payload["amount"] as number | undefined) ?? 0,
  };
}
