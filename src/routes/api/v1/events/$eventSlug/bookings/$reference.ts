// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Space, Booking } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";

export const Route = createFileRoute(
  "/api/v1/events/$eventSlug/bookings/$reference",
)({
  server: {
    handlers: {
      GET: async ({ params }: { request: Request; params: Record<string, string> }) =>
        handle(async () => {
          await connectDB();

          const event = await Event.findOne({ slug: params["eventSlug"] }).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");

          const booking = await Booking.findOne({
            reference: params["reference"],
            eventId: event._id,
          }).lean();
          if (!booking) return apiError(404, "BOOKING_NOT_FOUND", "Booking not found.");

          const space = await Space.findById(booking.spaceId).select("spaceNumber zone").lean();

          return apiOk({
            reference: booking.reference,
            spaceNumber: space?.spaceNumber ?? "",
            zone: space?.zone ?? "",
            customerName: booking.customerName,
            companyName: booking.companyName,
            amount: booking.amount,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            expiresAt: booking.expiresAt?.toISOString() ?? null,
            confirmedAt: booking.confirmedAt?.toISOString() ?? null,
            createdAt: booking.createdAt.toISOString(),
          });
        }),
    },
  },
});
