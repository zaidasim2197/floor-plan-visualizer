// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Booking, Space, AdminUser, Event, ACTIVE_BOOKING_STATUSES } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";
import { audit, notify } from "@/server/lib/notify";
import { z } from "zod";

const Schema = z.object({ targetSpaceId: z.string().min(1) });

export const Route = createFileRoute("/api/v1/admin/bookings/$reference/reassign")({
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
            return apiError(422, "VALIDATION_ERROR", "targetSpaceId is required.");
          }

          const targetSpace = await Space.findOne({ _id: body.targetSpaceId, eventId: event._id }).lean();
          if (!targetSpace) return apiError(404, "SPACE_NOT_FOUND", "Target space not found.");

          const holder = await Booking.findOne({
            spaceId: targetSpace._id,
            eventId: event._id,
            status: { $in: ACTIVE_BOOKING_STATUSES },
            _id: { $ne: booking._id },
          }).lean();
          if (holder)
            return apiError(409, "SPACE_NO_LONGER_AVAILABLE",
              `Space ${targetSpace.spaceNumber} is held by booking ${holder.reference}.`);

          const fromSpaceId = booking.spaceId;
          booking.spaceId = targetSpace._id;
          booking.amount = targetSpace.price;
          if (booking.status === "CONFLICT" || booking.status === "EXPIRED")
            booking.status = "PAYMENT_REVIEW";
          await booking.save();

          void audit("BOOKING_REASSIGNED", payload.username,
            `Moved ${booking.companyName} from ${String(fromSpaceId)} to ${targetSpace.spaceNumber}.`,
            String(booking._id), booking.reference, String(event._id));
          void notify("CUSTOMER", booking.email,
            `Your space has been updated — ${booking.reference}`,
            `Your exhibition space has been moved to ${targetSpace.spaceNumber}. Amount: ${event.currency} ${targetSpace.price.toLocaleString()}.`,
            String(booking._id), booking.reference, String(event._id));

          return apiOk({ reference: booking.reference, spaceNumber: targetSpace.spaceNumber, amount: booking.amount });
        }),
    },
  },
});
