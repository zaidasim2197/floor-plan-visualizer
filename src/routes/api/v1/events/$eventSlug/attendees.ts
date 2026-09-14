// @ts-nocheck
import mongoose from "mongoose";
import { createFileRoute } from "@tanstack/react-router";
import { connectDB } from "@/server/db";
import { Event, Space, Booking } from "@/server/models/index";
import { apiError, apiOk, handle } from "@/server/lib/errors";

export const Route = createFileRoute("/api/v1/events/$eventSlug/attendees")({
  server: {
    handlers: {
      GET: ({ params }) =>
        handle(async () => {
          await connectDB();
          const event =
            (await Event.findOne({ slug: params.eventSlug }).lean()) ||
            (await Event.findOne({ slug: new RegExp(`^${params.eventSlug}$`, "i") }).lean()) ||
            (await Event.findOne({}).lean());
          if (!event) return apiError(404, "EVENT_NOT_FOUND", "Event not found.");

          const confirmedBookings = await Booking.find({
            eventId: event._id,
            status: "CONFIRMED",
          })
            .select("spaceId companyName productService")
            .lean();

          const spaces = await Space.find({ eventId: event._id })
            .select("spaceNumber zone category")
            .lean();

          const spaceMapById = new Map(spaces.map((s) => [String(s._id), s]));
          const spaceMapByNumber = new Map(spaces.map((s) => [String(s.spaceNumber), s]));

          const attendees = confirmedBookings.map((b) => {
            const s = spaceMapById.get(String(b.spaceId)) ?? spaceMapByNumber.get(String(b.spaceId));
            return {
              spaceNumber: s?.spaceNumber ?? String(b.spaceId),
              zone: s?.zone ?? "",
              companyName: b.companyName,
              productService: b.productService ?? "",
              category: s?.category ?? "",
            };
          });

          return new Response(JSON.stringify({ attendees }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
              "Pragma": "no-cache",
              "Expires": "0",
            },
          });
        }),
    },
  },
});
