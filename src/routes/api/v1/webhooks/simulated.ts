// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event } from "@/server/models/index";
import { verifySimulatedWebhook } from "@/server/lib/webhooks";
import { processVerifiedWebhook } from "@/server/lib/webhookProcessor";

export const Route = createFileRoute("/api/v1/webhooks/simulated")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Block in production
        if (process.env["NODE_ENV"] === "production") {
          return new Response(
            JSON.stringify({ error: "PROVIDER_NOT_AVAILABLE", message: "Not available in production." }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        await connectDB();
        const rawBody = await request.text();
        const signature = request.headers.get("x-simulated-signature") ?? "";

        let slugGuess = "";
        try {
          const payload = JSON.parse(rawBody) as Record<string, unknown>;
          const ref = payload["providerRef"] as string | undefined;
          if (ref) slugGuess = ref.split("-")[0]?.toLowerCase() ?? "";
        } catch { /* ignore */ }

        const event = await Event.findOne({ slug: slugGuess }).lean()
          ?? await Event.findOne({}).lean();

        const result = verifySimulatedWebhook(rawBody, signature);
        const { status, body } = await processVerifiedWebhook(
          result,
          "SIMULATED",
          rawBody,
          event?.contact.email ?? "",
          event ? String(event._id) : "",
        );
        return new Response(body, { status, headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
