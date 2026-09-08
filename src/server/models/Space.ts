import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

export const SPACE_CATEGORIES = [
  "Premium Island",
  "Standard Exhibition Stall",
  "Compact Pod",
  "Corner Stall",
] as const;

export type SpaceCategory = (typeof SPACE_CATEGORIES)[number];

export interface ISpace {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  floorPlanId: mongoose.Types.ObjectId;
  spaceNumber: string;
  zone: string;
  category: SpaceCategory;
  sizeLabel: string;
  price: number;
  x: number;
  y: number;
  w: number;
  h: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SpaceSchema = new Schema<ISpace>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    floorPlanId: { type: Schema.Types.ObjectId, ref: "FloorPlan", required: true },
    spaceNumber: { type: String, required: true, trim: true },
    zone: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: SPACE_CATEGORIES },
    sizeLabel: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    x: { type: Number, required: true, min: 0 },
    y: { type: Number, required: true, min: 0 },
    w: { type: Number, required: true, min: 20 },
    h: { type: Number, required: true, min: 20 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

SpaceSchema.index({ eventId: 1, spaceNumber: 1 }, { unique: true });

export const Space = (models["Space"] ?? model<ISpace>("Space", SpaceSchema)) as ReturnType<typeof model<ISpace>>;
