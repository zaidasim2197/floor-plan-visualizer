import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

export interface IAuditEvent {
  _id: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  bookingRef?: string;
  action: string;
  actor: string;
  details: string;
  createdAt: Date;
}

const AuditEventSchema = new Schema<IAuditEvent>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event" },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    bookingRef: { type: String },
    action: { type: String, required: true },
    actor: { type: String, required: true },
    details: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AuditEventSchema.index({ eventId: 1, createdAt: -1 });
AuditEventSchema.index({ bookingRef: 1 });

export const AuditEvent = (models["AuditEvent"] ?? model<IAuditEvent>("AuditEvent", AuditEventSchema)) as ReturnType<typeof model<IAuditEvent>>;
