// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Booking, AdminUser, Event } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";
import { assertCanReturnForCorrection } from "@/server/lib/bookingStateMachine";
import { audit, notify } from "@/server/lib/notify";
import { z } from "zod";

const Schema = z.object({
  correctionReason: z.string().trim().min(5).max(500),
});

export const Route = createFileRoute(
  "/api/v1/admin/bookings/$reference/return-for-correction",
)({
  server: {
    handlers: {
      POST: async ({ request, params }: { request: Request; params: Record<string, string> }) =>
        handle(async () => {
          await connectDB();
          const payload = requireAuth(request);
          const booking = await Booking.findOne({ reference: params["reference"] });
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
            return apiError(422, "VALIDATION_ERROR", "correctionReason is required (min 5 chars).");
          }

          assertCanReturnForCorrection(booking);

          booking.status = "PAYMENT_PENDING";
          booking.paymentStatus = "UNPAID";
          booking.correctionReason = body.correctionReason;
          booking.paymentReference = undefined;
          booking.proofStorageKey = undefined;
          booking.paymentSubmittedAt = undefined;
          booking.expiresAt = new Date(Date.now() + event.booking.paymentPendingMinutes * 60 * 1000);
          await booking.save();

          void audit("EVIDENCE_RETURNED_FOR_CORRECTION", payload.username,
            `Evidence returned: ${body.correctionReason}`,
            String(booking._id), booking.reference, String(event._id));
          void notify("CUSTOMER", booking.email,
            `Payment evidence requires correction — ${booking.reference}`,
            `Our team needs additional information: ${body.correctionReason}. Please resubmit within ${event.booking.paymentPendingMinutes} minutes.`,
            String(booking._id), booking.reference, String(event._id));

          return apiOk({
            reference: booking.reference,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            expiresAt: booking.expiresAt.toISOString(),
          });
        }),
    },
  },
});
