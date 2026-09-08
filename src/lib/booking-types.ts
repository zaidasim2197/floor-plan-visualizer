export type StallCategory =
  "Premium Island" | "Standard Exhibition Stall" | "Compact Pod" | "Corner Stall";

export interface Stall {
  id: string;
  stallNumber: string;
  category: StallCategory;
  size: string;
  price: number;
  /** Grid position on the demo floor plan (map units). */
  x: number;
  y: number;
  w: number;
  h: number;
  zone: string;
}

export type BookingStatus =
  "PAYMENT_PENDING" | "PAYMENT_REVIEW" | "CONFIRMED" | "EXPIRED" | "CANCELLED" | "CONFLICT";

export type StallStatus = "AVAILABLE" | BookingStatus;

export type PaymentStatus =
  "UNPAID" | "EVIDENCE_SUBMITTED" | "VERIFIED" | "REFUND_PENDING" | "REFUNDED";

export interface Booking {
  eventId: string;
  id: string;
  reference: string;
  stallId: string;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  productService: string;
  notes: string;
  amount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentReference?: string | undefined;
  paymentProofImage?: string | undefined;
  createdAt: number;
  expiresAt: number;
  paymentSubmittedAt?: number | undefined;
  confirmedAt?: number | undefined;
  cancelledAt?: number | undefined;
  source: "PUBLIC" | "ADMIN";
  conflictReason?: string | undefined;
}

export interface AuditEvent {
  id: string;
  bookingRef?: string | undefined;
  action: string;
  actor: string;
  details: string;
  createdAt: number;
}

export interface NotificationRecord {
  id: string;
  bookingRef?: string | undefined;
  recipient: string;
  audience: "ADMIN" | "CUSTOMER";
  subject: string;
  body: string;
  status: "SENT (TEST MODE)";
  createdAt: number;
}

export const ACTIVE_STATUSES: BookingStatus[] = ["PAYMENT_PENDING", "PAYMENT_REVIEW", "CONFIRMED"];

export const statusLabel: Record<StallStatus, string> = {
  AVAILABLE: "Available",
  PAYMENT_PENDING: "On hold",
  PAYMENT_REVIEW: "Payment review",
  CONFIRMED: "Confirmed",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
  CONFLICT: "Payment conflict",
};
