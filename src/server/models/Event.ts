import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

export interface IEvent {
  _id: mongoose.Types.ObjectId;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  edition: string;
  startDate: string;
  endDate: string;
  dateLabel: string;
  timeLabel: string;
  venue: { name: string; city: string; address: string };
  currency: string;
  contact: { email: string; phone: string; whatsapp: string[] };
  booking: { paymentPendingMinutes: number; paymentReviewGraceHours: number };
  floorPlanLabel: string;
  paymentProviders: string[];
  payfastMerchantId?: string;
  safepayPublicKey?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: "" },
    description: { type: String, default: "" },
    edition: { type: String, default: "" },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    dateLabel: { type: String, default: "" },
    timeLabel: { type: String, default: "" },
    venue: {
      name: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, required: true },
    },
    currency: { type: String, required: true, default: "PKR" },
    contact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
      whatsapp: [{ type: String }],
    },
    booking: {
      paymentPendingMinutes: { type: Number, required: true, default: 30 },
      paymentReviewGraceHours: { type: Number, required: true, default: 24 },
    },
    floorPlanLabel: { type: String, default: "" },
    paymentProviders: [{ type: String }],
    payfastMerchantId: { type: String },
    safepayPublicKey: { type: String },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Event = (models["Event"] ?? model<IEvent>("Event", EventSchema)) as ReturnType<typeof model<IEvent>>;
