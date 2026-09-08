import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

export interface INotification {
  _id: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  bookingRef?: string;
  audience: "ADMIN" | "CUSTOMER";
  recipient: string;
  subject: string;
  body: string;
  status: "QUEUED" | "SENT" | "FAILED" | "TEST_MODE";
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event" },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    bookingRef: { type: String },
    audience: { type: String, required: true, enum: ["ADMIN", "CUSTOMER"] },
    recipient: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["QUEUED", "SENT", "FAILED", "TEST_MODE"],
      default: "TEST_MODE",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

NotificationSchema.index({ eventId: 1, createdAt: -1 });
NotificationSchema.index({ bookingRef: 1 });

export const Notification = (models["Notification"] ?? model<INotification>("Notification", NotificationSchema)) as ReturnType<typeof model<INotification>>;
