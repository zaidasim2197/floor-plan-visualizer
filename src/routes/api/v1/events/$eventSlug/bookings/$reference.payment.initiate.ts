// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Booking } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { z } from "zod";

const InitiateSchema = z.object({
  provider: z.enum(["PAYFAST", "SAFEPAY", "SIMULATED"]),
  simulateOutcome: z.enum(["SUCCESS", "FAILURE", "CANCEL", "DELAYED"]).optional(),
});

export const Route = createFileRoute(
  "/api/v1/events/$eventSlug/bookings/$reference/payment/initiate",
)({
  server: {
    handlers: {
      POST: async ({ request, params }: { request: Request; params: Record<string, string> }) =>
        handle(async () => {
          await connectDB();

          const event = await Event.findOne({ slug: params["eventSlug"] }).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");

          let body: z.infer<typeof InitiateSchema>;
          try {
            body = InitiateSchema.parse(await request.json());
          } catch {
            return apiError(400, "VALIDATION_ERROR", "Invalid request body.");
          }

          if (body.provider === "SIMULATED" && process.env["NODE_ENV"] === "production") {
            return apiError(400, "PROVIDER_NOT_AVAILABLE",
              "The SIMULATED provider is not available in production.");
          }

          const booking = await Booking.findOne({
            reference: params["reference"],
            eventId: event._id,
          }).lean();
          if (!booking) return apiError(404, "BOOKING_NOT_FOUND", "Booking not found.");
          if (booking.status === "EXPIRED")
            return apiError(400, "BOOKING_EXPIRED", "Hold expired. Please start a new booking.");
          if (booking.status !== "PAYMENT_PENDING")
            return apiError(400, "BOOKING_NOT_PAYMENT_PENDING",
              `Booking is in status ${booking.status}; cannot initiate payment.`);

          const origin = request.headers.get("origin") ?? process.env["APP_URL"] ?? "";
          const returnUrl = `${origin}/confirm?ref=${booking.reference}`;
          const cancelUrl = `${origin}/book/${String(booking.spaceId)}?cancelled=true&ref=${booking.reference}`;
          const notifyUrl = `${origin}/api/v1/webhooks/${body.provider.toLowerCase()}`;

          if (body.provider === "PAYFAST") {
            const merchantId = process.env[`PAYFAST_MERCHANT_ID_${event.slug}`] ?? event.payfastMerchantId ?? "";
            const merchantKey = process.env[`PAYFAST_MERCHANT_KEY_${event.slug}`] ?? "";
            const passphrase = process.env[`PAYFAST_PASSPHRASE_${event.slug}`] ?? "";
            const sandboxUrl = process.env["PAYFAST_SANDBOX_URL"] ?? "https://sandbox.payfast.co.za/eng/process";

            const params_pf: Record<string, string> = {
              merchant_id: merchantId,
              merchant_key: merchantKey,
              return_url: returnUrl,
              cancel_url: cancelUrl,
              notify_url: notifyUrl,
              name_first: booking.customerName.split(" ")[0] ?? booking.customerName,
              email_address: booking.email,
              m_payment_id: booking.reference,
              amount: booking.amount.toFixed(2),
              item_name: `Space ${String(booking.spaceId)} booking`,
            };
            if (passphrase) params_pf["passphrase"] = passphrase;

            const query = new URLSearchParams(
              Object.entries(params_pf).sort(([a], [b]) => a.localeCompare(b)),
            ).toString();

            return apiOk({ checkoutUrl: `${sandboxUrl}?${query}`, providerSessionId: booking.reference });
          }

          if (body.provider === "SAFEPAY") {
            const publicKey = process.env[`SAFEPAY_PUBLIC_KEY_${event.slug}`] ?? event.safepayPublicKey ?? "";
            const sandboxUrl = process.env["SAFEPAY_SANDBOX_URL"] ?? "https://sandbox.api.getsafepay.com/checkout/pay";

            try {
              const res = await fetch("https://sandbox.api.getsafepay.com/order/v1/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ client: publicKey, amount: booking.amount, currency: event.currency, environment: "sandbox", redirect_url: returnUrl, cancel_url: cancelUrl }),
              });
              if (res.ok) {
                const data = (await res.json()) as { data?: { token?: string }; token?: string };
                const token = data.data?.token ?? data.token;
                if (token) {
                  return apiOk({
                    checkoutUrl: `${sandboxUrl}?beacon=${token}&env=sandbox&redirect_url=${encodeURIComponent(returnUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`,
                    providerSessionId: token,
                  });
                }
              }
            } catch { /* fall through */ }
            return apiOk({ checkoutUrl: returnUrl, providerSessionId: booking.reference });
          }

          // SIMULATED
          const outcome = body.simulateOutcome ?? "SUCCESS";
          const delay = outcome === "DELAYED" ? 35 : 0;
          return apiOk({
            checkoutUrl: `${origin}/test/mock-gateway/${booking.reference}?outcome=${outcome}&delay=${delay}`,
            providerSessionId: booking.reference,
          });
        }),
    },
  },
});
