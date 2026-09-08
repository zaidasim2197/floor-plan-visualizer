// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Booking, AdminUser, Event, ACTIVE_BOOKING_STATUSES } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";
import { assertCanApprove } from "@/server/lib/bookingStateMachine";
import { audit, notify } from "@/server/lib/notify";

export const Route = createFileRoute("/api/v1/admin/bookings/$reference/approve")({
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

          assertCanApprove(booking);

          // Ensure no other active booking exists for this space (re-check atomically)
          const holder = await Booking.findOne({
            spaceId: booking.spaceId,
            eventId: booking.eventId,
            status: { $in: ACTIVE_BOOKING_STATUSES },
            _id: { $ne: booking._id },
          }).lean();
          if (holder)
            return apiError(409, "SPACE_NO_LONGER_AVAILABLE",
              `Space is held by booking ${holder.reference}. Release it first.`);

          booking.status = "CONFIRMED";
          booking.paymentStatus = "VERIFIED";
          booking.confirmedAt = new Date();
          await booking.save();

          void audit("BOOKING_APPROVED", payload.username,
            `Payment verified and space confirmed for ${booking.companyName}.`,
            String(booking._id), booking.reference, String(event._id));
          void notify("CUSTOMER", booking.email,
            `Booking confirmed — ${booking.reference}`,
            `Your payment has been verified and your exhibition space is confirmed.`,
            String(booking._id), booking.reference, String(event._id));

          return apiOk({ reference: booking.reference, status: booking.status, paymentStatus: booking.paymentStatus });
        }),
    },
  },
});
