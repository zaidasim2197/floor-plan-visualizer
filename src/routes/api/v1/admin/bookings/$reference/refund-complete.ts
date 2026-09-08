// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Booking, AdminUser, Event } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";
import { assertCanCompleteRefund } from "@/server/lib/bookingStateMachine";
import { audit, notify } from "@/server/lib/notify";
import { z } from "zod";

const Schema = z.object({ refundReference: z.string().trim().min(1).max(100) });

export const Route = createFileRoute("/api/v1/admin/bookings/$reference/refund-complete")({
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

          let body: z.infer<typeof Schema>;
          try {
            body = Schema.parse(await request.json());
          } catch {
            return apiError(422, "VALIDATION_ERROR", "refundReference is required.");
          }

          assertCanCompleteRefund(booking);

          booking.paymentStatus = "REFUNDED";
          booking.refundReference = body.refundReference;
          await booking.save();

          void audit("REFUND_COMPLETED", payload.username,
            `Refund ${body.refundReference} recorded for ${booking.reference}.`,
            String(booking._id), booking.reference, String(event._id));
          void notify("CUSTOMER", booking.email,
            `Refund completed — ${booking.reference}`,
            `Your refund (ref: ${body.refundReference}) has been processed.`,
            String(booking._id), booking.reference, String(event._id));

          return apiOk({ reference: booking.reference, paymentStatus: booking.paymentStatus, refundReference: booking.refundReference });
        }),
    },
  },
});
