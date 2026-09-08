// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Booking, AdminUser, Event } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";
import { audit } from "@/server/lib/notify";

export const Route = createFileRoute("/api/v1/admin/bookings/$reference/expire")({
  server: {
    handlers: {
      POST: async ({ request, params }: { request: Request; params: Record<string, string> }) =>
        handle(async () => {
          await connectDB();
          const payload = requireAuth(request);
          const booking = await Booking.findOne({ reference: params.reference });
          if (!booking) return apiError(404, "BOOKING_NOT_FOUND", "Booking not found.");

          const event = await Event.findById(booking.eventId).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");
          if (!payload.isSuperAdmin) {
            const user = await AdminUser.findById(payload.sub).lean();
            if (!user) return apiError(401, "UNAUTHORIZED", "User not found.");
            requireEventRole(payload, user as Parameters<typeof requireEventRole>[1], String(event._id), "ORGANISER");
          }

          if (booking.status !== "PAYMENT_PENDING")
            return apiError(409, "INVALID_TRANSITION",
              `Only PAYMENT_PENDING bookings can be manually expired; got ${booking.status}.`);

          booking.status = "EXPIRED";
          await booking.save();

          void audit("BOOKING_MANUALLY_EXPIRED", payload.username,
            `Admin manually expired hold for ${booking.companyName}.`,
            String(booking._id), booking.reference, String(event._id));

          return apiOk({ reference: booking.reference, status: booking.status });
        }),
    },
  },
});
