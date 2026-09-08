// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { z } from "zod";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const UploadIntentSchema = z.object({
  fileName: z.string().min(1).max(200),
  contentType: z.string().min(1),
  bookingReference: z.string().min(1),
});

export const Route = createFileRoute("/api/v1/uploads/payment-proof")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        handle(async () => {
          let body: z.infer<typeof UploadIntentSchema>;
          try {
            body = UploadIntentSchema.parse(await request.json());
          } catch {
            return apiError(400, "VALIDATION_ERROR", "Provide fileName, contentType, and bookingReference.");
          }

          if (!ALLOWED_TYPES.includes(body.contentType)) {
            return apiError(400, "UNSUPPORTED_FILE_TYPE",
              `Allowed types: ${ALLOWED_TYPES.join(", ")}`);
          }

          // In this sprint, object-storage integration is a placeholder.
          // Replace with a real pre-signed URL from S3/R2/GCS when storage is configured.
          const objectStorageUrl = process.env["OBJECT_STORAGE_URL"];
          if (!objectStorageUrl) {
            // Return a local storage key the frontend can pass back in the evidence endpoint.
            const storageKey = `uploads/proof/${body.bookingReference}/${Date.now()}-${body.fileName}`;
            return apiOk({
              uploadUrl: null, // Direct upload not available without storage config
              storageKey,
              note: "Object storage not configured. Pass this storageKey to the evidence endpoint along with the base64 image as proofStorageKey for local demo use.",
            });
          }

          // With storage configured, issue a pre-signed PUT URL (example for S3-compatible)
          const storageKey = `uploads/proof/${body.bookingReference}/${Date.now()}-${body.fileName}`;
          // Real implementation: call AWS SDK getSignedUrl / R2 presigned URL here
          const uploadUrl = `${objectStorageUrl}/${storageKey}`;

          return apiOk({ uploadUrl, storageKey });
        }),
    },
  },
});
