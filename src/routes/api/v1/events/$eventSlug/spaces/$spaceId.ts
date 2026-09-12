// @ts-nocheck
import mongoose from "mongoose";
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Space, Booking, ACTIVE_BOOKING_STATUSES } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";
import { toDisplayStatus } from "@/server/lib/displayStatus";
import { sweepExpiredBookings } from "@/server/lib/expiry";

export const Route = createFileRoute("/api/v1/events/$eventSlug/spaces/$spaceId")({
  server: {
    handlers: {
      GET: ({ params }) =>
        handle(async () => {
          await connectDB();
          const event = await Event.findOne({ slug: params.eventSlug, isPublished: true }).lean();
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");

          await sweepExpiredBookings(String(event._id));

          const isObjectId = mongoose.Types.ObjectId.isValid(params.spaceId);
          const space = await Space.findOne({
            eventId: event._id,
            isActive: true,
            ...(isObjectId
              ? { $or: [{ _id: params.spaceId }, { spaceNumber: params.spaceId }] }
              : { spaceNumber: params.spaceId }),
          }).lean();
          if (!space) return apiError(404, "SPACE_NOT_FOUND", "Space not found.");

          const activeBooking = await Booking.findOne({
            spaceId: space._id,
            eventId: event._id,
            status: { $in: ACTIVE_BOOKING_STATUSES },
          })
            .select("reference holdToken customerName companyName email amount status paymentStatus expiresAt")
            .lean();

          return apiOk({
            id: String(space._id),
            spaceNumber: space.spaceNumber,
            zone: space.zone,
            category: space.category,
            sizeLabel: space.sizeLabel,
            price: space.price,
            x: space.x,
            y: space.y,
            w: space.w,
            h: space.h,
            displayStatus: activeBooking ? toDisplayStatus(activeBooking.status) : "AVAILABLE",
            activeBooking: activeBooking
              ? {
                  reference: activeBooking.reference,
                  holdToken: activeBooking.holdToken ?? null,
                  customerName: activeBooking.customerName,
                  companyName: activeBooking.companyName,
                  email: activeBooking.email,
                  amount: activeBooking.amount,
                  status: activeBooking.status,
                  paymentStatus: activeBooking.paymentStatus,
                  expiresAt: activeBooking.expiresAt?.toISOString() ?? null,
                }
              : null,
          });
        }),
    },
  },
});
