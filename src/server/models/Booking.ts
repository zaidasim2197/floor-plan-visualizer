import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

export const BOOKING_STATUSES = [
  "PAYMENT_PENDING",
  "PAYMENT_REVIEW",
  "CONFIRMED",
  "EXPIRED",
  "CANCELLED",
  "CONFLICT",
] as const;

export const PAYMENT_STATUSES = [
  "UNPAID",
  "EVIDENCE_SUBMITTED",
  "VERIFIED",
  "REFUND_PENDING",
  "REFUNDED",
] as const;

export const ACTIVE_BOOKING_STATUSES = [
  "PAYMENT_PENDING",
  "PAYMENT_REVIEW",
  "CONFIRMED",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface IBooking {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  spaceId: mongoose.Types.ObjectId;
  reference: string;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  productService?: string;
  notes?: string;
  amount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  refundReference?: string;
  proofStorageKey?: string;
  expiresAt: Date;
  paymentSubmittedAt?: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  conflictReason?: string;
  correctionReason?: string;
  source: "PUBLIC" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    spaceId: { type: Schema.Types.ObjectId, ref: "Space", required: true },
    reference: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    productService: { type: String, trim: true },
    notes: { type: String },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: BOOKING_STATUSES },
    paymentStatus: { type: String, required: true, enum: PAYMENT_STATUSES },
    paymentReference: { type: String },
    refundReference: { type: String },
    proofStorageKey: { type: String },
    expiresAt: { type: Date, required: true },
    paymentSubmittedAt: { type: Date },
    confirmedAt: { type: Date },
    cancelledAt: { type: Date },
    conflictReason: { type: String },
    correctionReason: { type: String },
    source: { type: String, required: true, enum: ["PUBLIC", "ADMIN"] },
  },
  { timestamps: true },
);

BookingSchema.index(
  { eventId: 1, spaceId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["PAYMENT_PENDING", "PAYMENT_REVIEW", "CONFIRMED"] } },
    name: "bookings_space_active_unique",
  },
);

BookingSchema.index({ eventId: 1, status: 1 });
BookingSchema.index({ reference: 1 });
BookingSchema.index({ eventId: 1, expiresAt: 1, status: 1 });

export const Booking = (models["Booking"] ?? model<IBooking>("Booking", BookingSchema)) as ReturnType<typeof model<IBooking>>;
