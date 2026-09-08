// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Booking, Space, AdminUser, Event, ACTIVE_BOOKING_STATUSES } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";
import { assertCanResolveConflict } from "@/server/lib/bookingStateMachine";
import { audit, notify } from "@/server/lib/notify";
import { z } from "zod";

const Schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("reassign"), targetSpaceId: z.string().min(1) }),
  z.object({ action: z.literal("refund_cancel") }),
]);

export const Route = createFileRoute(
  "/api/v1/admin/bookings/$reference/resolve-conflict",
)({
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
        return apiError(422, "VALIDATION_ERROR", "action must be approve | reassign | refund_cancel.");
      }

      assertCanResolveConflict(booking);

      if (body.action === "approve") {
        const holder = await Booking.findOne({
          spaceId: booking.spaceId, eventId: booking.eventId,
          status: { $in: ACTIVE_BOOKING_STATUSES }, _id: { $ne: booking._id },
        }).lean();
        if (holder)
          return apiError(409, "SPACE_NO_LONGER_AVAILABLE",
            "Space is now occupied by another booking.");

        booking.status = "CONFIRMED";
        booking.paymentStatus = "VERIFIED";
        booking.confirmedAt = new Date();
        await booking.save();
        void audit("CONFLICT_RESOLVED_APPROVE", payload.username,
          `Conflict resolved — space confirmed.`, String(booking._id), booking.reference, String(event._id));
        void notify("CUSTOMER", booking.email,
          `Your space is confirmed — ${booking.reference}`,
          `After review, your payment has been accepted and your space is confirmed.`,
          String(booking._id), booking.reference, String(event._id));

      } else if (body.action === "reassign") {
        const target = await Space.findOne({ _id: body.targetSpaceId, eventId: event._id }).lean();
        if (!target) return apiError(404, "SPACE_NOT_FOUND", "Target space not found.");
        const holder = await Booking.findOne({
          spaceId: target._id, eventId: booking.eventId,
          status: { $in: ACTIVE_BOOKING_STATUSES }, _id: { $ne: booking._id },
        }).lean();
        if (holder)
          return apiError(409, "SPACE_NO_LONGER_AVAILABLE", "Target space is occupied.");

        booking.spaceId = target._id;
        booking.amount = target.price;
        booking.status = "CONFIRMED";
        booking.paymentStatus = "VERIFIED";
        booking.confirmedAt = new Date();
        await booking.save();
        void audit("CONFLICT_RESOLVED_REASSIGN", payload.username,
          `Conflict resolved — reassigned to ${target.spaceNumber}.`,
          String(booking._id), booking.reference, String(event._id));
        void notify("CUSTOMER", booking.email,
          `Your space has been assigned — ${booking.reference}`,
          `Your payment has been accepted and you have been assigned space ${target.spaceNumber}.`,
          String(booking._id), booking.reference, String(event._id));

      } else {
        booking.status = "CANCELLED";
        booking.paymentStatus = "REFUND_PENDING";
        booking.cancelledAt = new Date();
        await booking.save();
        void audit("CONFLICT_RESOLVED_REFUND", payload.username,
          `Conflict resolved — refund pending.`, String(booking._id), booking.reference, String(event._id));
        void notify("CUSTOMER", booking.email,
          `Refund initiated — ${booking.reference}`,
          `We were unable to accommodate your booking. A refund has been initiated.`,
          String(booking._id), booking.reference, String(event._id));
      }

      return apiOk({ reference: booking.reference, status: booking.status, paymentStatus: booking.paymentStatus });
        }),
    },
  },
});
