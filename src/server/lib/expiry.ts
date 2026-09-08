// @ts-nocheck
import { Booking } from "../models/index";
import { audit, notify } from "./notify";

/**
 * Expire all PAYMENT_PENDING bookings whose hold window has lapsed.
 * Called by the scheduler and as a lazy check-on-read before booking writes.
 * Returns the number of bookings expired.
 */
export async function sweepExpiredBookings(eventId?: string): Promise<number> {
  const filter: Record<string, unknown> = {
    status: "PAYMENT_PENDING",
    expiresAt: { $lt: new Date() },
  };
  if (eventId) filter["eventId"] = eventId;

  const expiredBookings = await Booking.find(filter).lean();
  if (expiredBookings.length === 0) return 0;

  await Booking.updateMany(filter, { $set: { status: "EXPIRED" } });

  // Fire audit + notifications asynchronously — do not block the write path
  for (const b of expiredBookings) {
    void audit(
      "BOOKING_EXPIRED",
      "system",
      `Hold on space ${String(b.spaceId)} expired without payment.`,
      String(b._id),
      b.reference,
      String(b.eventId),
    );
    void notify(
      "CUSTOMER",
      b.email,
      `Reservation expired — ${b.reference}`,
      `Your temporary reservation has expired because payment was not completed in time. The space is available again. Contact us if you have already paid.`,
      String(b._id),
      b.reference,
      String(b.eventId),
    );
  }

  return expiredBookings.length;
}
