// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event } from "@/server/models/index";
import { verifySafepayWebhook } from "@/server/lib/webhooks";
import { processVerifiedWebhook } from "@/server/lib/webhookProcessor";

export const Route = createFileRoute("/api/v1/webhooks/safepay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await connectDB();
        const rawBody = await request.text();
        const signature = request.headers.get("x-sfpy-signature") ?? "";

        // Parse event slug from tracker to look up the correct secret
        let slugGuess = "";
        try {
          const payload = JSON.parse(rawBody) as Record<string, unknown>;
          const tracker = (payload["data"] as Record<string, unknown> | undefined)?.["tracker"];
          if (typeof tracker === "string") slugGuess = tracker.split("-")[0]?.toLowerCase() ?? "";
        } catch { /* ignore */ }

        const event = await Event.findOne({ slug: slugGuess }).lean()
          ?? await Event.findOne({}).lean();

        const secretKey = event
          ? (process.env[`SAFEPAY_SECRET_KEY_${event.slug}`] ?? "")
          : "";

        const result = verifySafepayWebhook(rawBody, signature, secretKey);
        const { status, body } = await processVerifiedWebhook(
          result,
          "SAFEPAY",
          rawBody,
          event?.contact.email ?? "",
          event ? String(event._id) : "",
        );
        return new Response(body, { status, headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
