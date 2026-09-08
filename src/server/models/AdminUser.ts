import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

export type AdminRole = "SUPER_ADMIN" | "ORGANISER" | "VIEWER";

export interface IEventAdminRole {
  eventId: mongoose.Types.ObjectId;
  role: AdminRole;
}

export interface IAdminUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  passwordHash: string;
  displayName: string;
  isSuperAdmin: boolean;
  eventRoles: IEventAdminRole[];
  isActive: boolean;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventAdminRoleSchema = new Schema<IEventAdminRole>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    role: { type: String, required: true, enum: ["SUPER_ADMIN", "ORGANISER", "VIEWER"] },
  },
  { _id: false },
);

const AdminUserSchema = new Schema<IAdminUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
    isSuperAdmin: { type: Boolean, default: false },
    eventRoles: [EventAdminRoleSchema],
    isActive: { type: Boolean, default: true },
    refreshTokenHash: { type: String },
  },
  { timestamps: true },
);

export const AdminUser = (models["AdminUser"] ?? model<IAdminUser>("AdminUser", AdminUserSchema)) as ReturnType<typeof model<IAdminUser>>;
