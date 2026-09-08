import {
  ACTIVE_STATUSES,
  type Booking,
  type BookingStatus,
  type PaymentStatus,
  type Stall,
} from "@/lib/booking-types";
export const paymentLabels: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  EVIDENCE_SUBMITTED: "Evidence submitted",
  VERIFIED: "Verified",
  REFUND_PENDING: "Refund pending",
  REFUNDED: "Refunded",
};
export function reservationLabel(status: BookingStatus) {
  return {
    PAYMENT_PENDING: "Awaiting payment",
    PAYMENT_REVIEW: "Payment under review",
    CONFIRMED: "Confirmed",
    EXPIRED: "Expired",
    CANCELLED: "Cancelled",
    CONFLICT: "Payment conflict",
  }[status];
}
export function summarizeBookings(bookings: Booking[], spaces: Stall[]) {
  const occupied = new Set(
    bookings
      .filter((b) => ACTIVE_STATUSES.includes(b.status) && spaces.some((s) => s.id === b.stallId))
      .map((b) => b.stallId),
  ).size;
  const total = (predicate: (b: Booking) => boolean) =>
    bookings.filter(predicate).reduce((sum, b) => sum + b.amount, 0);
  return {
    occupied,
    occupancy: spaces.length ? Math.round((occupied / spaces.length) * 100) : 0,
    revenue: total((b) => b.status === "CONFIRMED" && b.paymentStatus === "VERIFIED"),
    pending: total((b) => b.status === "PAYMENT_PENDING" || b.status === "PAYMENT_REVIEW"),
    refunds: total((b) => b.paymentStatus === "REFUND_PENDING"),
  };
}
export function filterBookings(
  bookings: Booking[],
  filters: { status: string; payment: string; search: string },
) {
  const query = filters.search.trim().toLowerCase();
  return bookings.filter(
    (b) =>
      (filters.status === "ALL" || b.status === filters.status) &&
      (filters.payment === "ALL" || b.paymentStatus === filters.payment) &&
      (!query ||
        [
          b.reference,
          b.customerName,
          b.companyName,
          b.stallId,
          b.email,
          b.paymentReference ?? "",
        ].some((value) => value.toLowerCase().includes(query))),
  );
}
