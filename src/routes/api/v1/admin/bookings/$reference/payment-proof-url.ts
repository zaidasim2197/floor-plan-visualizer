// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Booking, AdminUser, Event } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { requireAuth, requireEventRole } from "@/server/lib/auth";

export const Route = createFileRoute(
  "/api/v1/admin/bookings/$reference/payment-proof-url",
)({
  server: {
    handlers: {
      GET: async ({ request, params }: { request: Request; params: Record<string, string> }) =>
        handle(async () => {
          await connectDB();
          const payload = requireAuth(request);
          const booking = await Booking.findOne({ reference: params.reference }).lean();
          if (!booking) return apiError(404, "BOOKING_NOT_FOUND", "Booking not found.");

          const event = await Event.findById(booking.eventId).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");
          if (!payload.isSuperAdmin) {
            const user = await AdminUser.findById(payload.sub).lean();
            if (!user) return apiError(401, "UNAUTHORIZED", "User not found.");
            requireEventRole(payload, user as Parameters<typeof requireEventRole>[1], String(event._id), "VIEWER");
          }

          if (!booking.proofStorageKey)
            return apiError(404, "NO_PROOF_IMAGE", "No payment proof image on this booking.");

          // Real implementation: generate a pre-signed GET URL from object storage (TTL 15 min).
          // For now, return the storage key — replace with AWS SDK / R2 presigned URL call.
          const objectStorageUrl = process.env["OBJECT_STORAGE_URL"];
          const url = objectStorageUrl
            ? `${objectStorageUrl}/${booking.proofStorageKey}`
            : `/api/v1/admin/proof-placeholder?key=${encodeURIComponent(booking.proofStorageKey)}`;

          return apiOk({ url, expiresIn: 900 });
        }),
    },
  },
});
