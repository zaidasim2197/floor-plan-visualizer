// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Booking } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { audit, notify } from "@/server/lib/notify";
import { z } from "zod";

const EvidenceSchema = z.object({
  paymentReference: z.string().trim().max(100).optional(),
  proofStorageKey: z.string().trim().max(500).optional(),
}).refine((v) => v.paymentReference || v.proofStorageKey, {
  message: "Provide either a payment reference or a proof storage key.",
});

export const Route = createFileRoute(
  "/api/v1/events/$eventSlug/bookings/$reference/payment/evidence",
)({
  server: {
    handlers: {
      POST: async ({ request, params }: { request: Request; params: Record<string, string> }) =>
        handle(async () => {
          await connectDB();

          const event = await Event.findOne({ slug: params["eventSlug"] }).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");

          let body: z.infer<typeof EvidenceSchema>;
          try {
            body = EvidenceSchema.parse(await request.json());
          } catch {
            return apiError(400, "VALIDATION_ERROR", "Provide a payment reference or receipt image.");
          }

          const booking = await Booking.findOne({
            reference: params["reference"],
            eventId: event._id,
          });
          if (!booking) return apiError(404, "BOOKING_NOT_FOUND", "Booking not found.");

          if (booking.status === "PAYMENT_REVIEW") {
            return apiError(400, "ALREADY_IN_REVIEW",
              "Payment evidence has already been submitted for this booking.");
          }

          if (booking.status === "PAYMENT_PENDING") {
            booking.status = "PAYMENT_REVIEW";
            booking.paymentStatus = "EVIDENCE_SUBMITTED";
            booking.paymentSubmittedAt = new Date();
            if (body.paymentReference) booking.paymentReference = body.paymentReference;
            if (body.proofStorageKey) booking.proofStorageKey = body.proofStorageKey;
            await booking.save();

            void audit("PAYMENT_SUBMITTED", "customer",
              `Evidence submitted for ${booking.reference}.`,
              String(booking._id), booking.reference, String(event._id));
            void notify("ADMIN", event.contact.email,
              `Payment proof submitted — ${booking.reference}`,
              `${booking.customerName} (${booking.companyName}) submitted payment proof for space ${String(booking.spaceId)}.`,
              String(booking._id), booking.reference, String(event._id));
            void notify("CUSTOMER", booking.email,
              `Payment proof received — ${booking.reference}`,
              "Your payment proof is under review. Your space is protected while we verify.",
              String(booking._id), booking.reference, String(event._id));

            return apiOk({
              reference: booking.reference,
              status: booking.status,
              paymentStatus: booking.paymentStatus,
              message: "Payment proof submitted. Admin has been notified.",
            });
          }

          if (booking.status === "EXPIRED" || booking.status === "CANCELLED") {
            booking.status = "CONFLICT";
            booking.paymentStatus = "EVIDENCE_SUBMITTED";
            booking.paymentSubmittedAt = new Date();
            booking.conflictReason = "Payment evidence received after the hold expired.";
            if (body.paymentReference) booking.paymentReference = body.paymentReference;
            if (body.proofStorageKey) booking.proofStorageKey = body.proofStorageKey;
            await booking.save();

            void audit("CONFLICT_CREATED", "system",
              `Late payment on ${String(booking.spaceId)} for ${booking.companyName}.`,
              String(booking._id), booking.reference, String(event._id));
            void notify("ADMIN", event.contact.email,
              `Payment conflict — ${booking.reference}`,
              `Payment evidence arrived after booking ${booking.reference} expired. Manual resolution required.`,
              String(booking._id), booking.reference, String(event._id));
            void notify("CUSTOMER", booking.email,
              `We are reviewing your payment — ${booking.reference}`,
              "Your payment arrived after the reservation window closed. Our team will contact you shortly.",
              String(booking._id), booking.reference, String(event._id));

            return apiOk({
              reference: booking.reference,
              status: booking.status,
              paymentStatus: booking.paymentStatus,
              message: "Your payment was received after the hold expired. Admin is reviewing your case.",
            });
          }

          return apiError(409, "INVALID_TRANSITION",
            `Cannot submit evidence for a booking in status ${booking.status}.`);
        }),
    },
  },
});
