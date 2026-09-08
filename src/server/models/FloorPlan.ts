import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

export interface IFloorElement {
  elementType: "facility" | "aisle";
  label?: string;
  sublabel?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone?: "stage" | "service" | "amenity" | "access";
  isVertical?: boolean;
  sortOrder?: number;
}

export interface IFloorPlan {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  label: string;
  canvasWidth: number;
  canvasHeight: number;
  elements: IFloorElement[];
  createdAt: Date;
  updatedAt: Date;
}

const FloorElementSchema = new Schema<IFloorElement>(
  {
    elementType: { type: String, required: true, enum: ["facility", "aisle"] },
    label: { type: String },
    sublabel: { type: String },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    tone: { type: String, enum: ["stage", "service", "amenity", "access"] },
    isVertical: { type: Boolean },
    sortOrder: { type: Number },
  },
  { _id: false },
);

const FloorPlanSchema = new Schema<IFloorPlan>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, unique: true },
    label: { type: String, required: true },
    canvasWidth: { type: Number, required: true, default: 1200 },
    canvasHeight: { type: Number, required: true, default: 800 },
    elements: [FloorElementSchema],
  },
  { timestamps: true },
);

export const FloorPlan = (models["FloorPlan"] ?? model<IFloorPlan>("FloorPlan", FloorPlanSchema)) as ReturnType<typeof model<IFloorPlan>>;
