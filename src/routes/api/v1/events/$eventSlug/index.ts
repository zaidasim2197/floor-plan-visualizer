// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";

export const Route = createFileRoute("/api/v1/events/$eventSlug/")({
  server: {
    handlers: {
      GET: ({ params }) =>
        handle(async () => {
          await connectDB();
          const event = await Event.findOne({ slug: params.eventSlug, isPublished: true }).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");

          return apiOk({
            id: String(event._id),
            slug: event.slug,
            name: event.name,
            tagline: event.tagline,
            description: event.description,
            edition: event.edition,
            startDate: event.startDate,
            endDate: event.endDate,
            dateLabel: event.dateLabel,
            timeLabel: event.timeLabel,
            venue: event.venue,
            currency: event.currency,
            contact: event.contact,
            booking: { paymentPendingMinutes: event.booking.paymentPendingMinutes },
            floorPlanLabel: event.floorPlanLabel,
            paymentProviders: event.paymentProviders,
            // Non-secret public identifiers only
            payfastMerchantId: event.payfastMerchantId ?? null,
            safepayPublicKey: event.safepayPublicKey ?? null,
          });
        }),
    },
  },
});
