import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

export interface IPaymentWebhookEvent {
  _id: mongoose.Types.ObjectId;
  gatewayRef: string;
  provider: string;
  bookingId?: mongoose.Types.ObjectId;
  eventType: string;
  rawPayload: string;
  processedAt: Date;
  createdAt: Date;
}

const PaymentWebhookEventSchema = new Schema<IPaymentWebhookEvent>(
  {
    gatewayRef: { type: String, required: true, unique: true },
    provider: { type: String, required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    eventType: { type: String, required: true },
    rawPayload: { type: String, required: true },
    processedAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const PaymentWebhookEvent = (models["PaymentWebhookEvent"] ?? model<IPaymentWebhookEvent>("PaymentWebhookEvent", PaymentWebhookEventSchema)) as ReturnType<typeof model<IPaymentWebhookEvent>>;
