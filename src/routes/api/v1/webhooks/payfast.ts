// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event } from "@/server/models/index";
import { verifyPayfastWebhook } from "@/server/lib/webhooks";
import { processVerifiedWebhook } from "@/server/lib/webhookProcessor";

export const Route = createFileRoute("/api/v1/webhooks/payfast")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await connectDB();
        const rawBody = await request.text();

        // Determine which event this belongs to via m_payment_id (= booking reference)
        // The passphrase is event-scoped — we try each event's config
        const params = new URLSearchParams(rawBody);
        const bookingRef = params.get("m_payment_id") ?? "";
        // Use a simple lookup to find the event slug from the booking reference prefix
        const slugGuess = bookingRef.split("-")[0]?.toLowerCase() ?? "";
        const event = await Event.findOne({ slug: slugGuess }).lean()
          ?? await Event.findOne({}).lean(); // fallback for single-event setups

        const passphrase = event
          ? (process.env[`PAYFAST_PASSPHRASE_${event.slug}`] ?? "")
          : "";

        const result = verifyPayfastWebhook(rawBody, passphrase);
        const { status, body } = await processVerifiedWebhook(
          result,
          "PAYFAST",
          rawBody,
          event?.contact.email ?? "",
          event ? String(event._id) : "",
        );
        return new Response(body, { status, headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
