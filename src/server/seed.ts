// @ts-nocheck
/**
 * Database seed — run once on first deploy or with FORCE_RESEED=true.
 *
 *   npx tsx src/server/seed.ts
 *
 * Creates:
 *  - Event 1: VenueFlow Business Expo 2027 (20 spaces, PKR, 30-min hold, Karachi)
 *  - Event 2: Lahore Makers Market 2027    (12 spaces, PKR, 45-min hold, Lahore)
 *  - One SUPER_ADMIN user (credentials from SEED_ADMIN_USERNAME / SEED_ADMIN_PASSWORD env)
 */

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./db";
import { hashPassword } from "./lib/auth";
import {
  Event,
  Space,
  FloorPlan,
  AdminUser,
  Booking,
  AuditEvent,
  Notification,
  PaymentWebhookEvent,
} from "./models/index";
import type { IFloorElement } from "./models/FloorPlan";
import type { SpaceCategory } from "./models/Space";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FORCE = process.env["FORCE_RESEED"] === "true";

async function dropIfForce() {
  if (!FORCE) return;
  console.log("[seed] FORCE_RESEED=true — dropping collections");
  await Promise.all([
    Event.deleteMany({}),
    Space.deleteMany({}),
    FloorPlan.deleteMany({}),
    AdminUser.deleteMany({}),
    Booking.deleteMany({}),
    AuditEvent.deleteMany({}),
    Notification.deleteMany({}),
    PaymentWebhookEvent.deleteMany({}),
  ]);
}

// ─── Floor-plan elements (shared layout) ─────────────────────────────────────

const EXPO_ELEMENTS: IFloorElement[] = [
  { elementType: "facility", label: "Keynote Stage", sublabel: "Main presentation area", x: 120, y: 60, w: 484, h: 90, tone: "stage", sortOrder: 1 },
  { elementType: "facility", label: "Networking Lounge", x: 680, y: 60, w: 204, h: 90, tone: "amenity", sortOrder: 2 },
  { elementType: "facility", label: "Information Desk", x: 960, y: 60, w: 110, h: 90, tone: "service", sortOrder: 3 },
  { elementType: "facility", label: "Restrooms", x: 120, y: 470, w: 184, h: 70, tone: "service", sortOrder: 4 },
  { elementType: "facility", label: "Café & Refreshments", x: 380, y: 480, w: 224, h: 110, tone: "amenity", sortOrder: 5 },
  { elementType: "facility", label: "Seating & Meeting Points", x: 680, y: 480, w: 204, h: 110, tone: "amenity", sortOrder: 6 },
  { elementType: "facility", label: "Registration & Badge Collection", x: 380, y: 630, w: 504, h: 70, tone: "service", sortOrder: 7 },
  { elementType: "facility", label: "Main Entrance", x: 560, y: 720, w: 144, h: 50, tone: "access", sortOrder: 8 },
  { elementType: "facility", label: "Emergency Exit", x: 40, y: 620, w: 110, h: 44, tone: "access", sortOrder: 9 },
  { elementType: "facility", label: "Emergency Exit", x: 1000, y: 620, w: 110, h: 44, tone: "access", sortOrder: 10 },
  { elementType: "aisle", x: 108, y: 440, w: 976, h: 24, isVertical: false, sortOrder: 11 },
  { elementType: "aisle", x: 320, y: 170, w: 44, h: 400, isVertical: true, sortOrder: 12 },
  { elementType: "aisle", x: 620, y: 170, w: 44, h: 400, isVertical: true, sortOrder: 13 },
  { elementType: "aisle", x: 900, y: 170, w: 44, h: 400, isVertical: true, sortOrder: 14 },
];

const MAKERS_ELEMENTS: IFloorElement[] = [
  { elementType: "facility", label: "Stage", x: 120, y: 60, w: 350, h: 80, tone: "stage", sortOrder: 1 },
  { elementType: "facility", label: "Refreshments", x: 500, y: 60, w: 180, h: 80, tone: "amenity", sortOrder: 2 },
  { elementType: "facility", label: "Information Desk", x: 720, y: 60, w: 120, h: 80, tone: "service", sortOrder: 3 },
  { elementType: "facility", label: "Main Entrance", x: 480, y: 720, w: 144, h: 50, tone: "access", sortOrder: 4 },
  { elementType: "aisle", x: 108, y: 400, w: 800, h: 24, isVertical: false, sortOrder: 5 },
  { elementType: "aisle", x: 480, y: 170, w: 40, h: 320, isVertical: true, sortOrder: 6 },
];

// ─── Event 1 spaces ───────────────────────────────────────────────────────────

type RawSpace = {
  spaceNumber: string;
  category: SpaceCategory;
  size: string;
  price: number;
  x: number; y: number; w: number; h: number;
  zone: string;
};

const EXPO_SPACES: RawSpace[] = [
  // Zone A — West Hall
  { spaceNumber: "A01", category: "Standard Exhibition Stall", size: "3m x 3m", price: 185000, x: 120, y: 180, w: 90, h: 80, zone: "Zone A — West Hall" },
  { spaceNumber: "A02", category: "Standard Exhibition Stall", size: "3m x 3m", price: 185000, x: 214, y: 180, w: 90, h: 80, zone: "Zone A — West Hall" },
  { spaceNumber: "A03", category: "Standard Exhibition Stall", size: "3m x 3m", price: 175000, x: 120, y: 264, w: 90, h: 80, zone: "Zone A — West Hall" },
  { spaceNumber: "A04", category: "Standard Exhibition Stall", size: "3m x 3m", price: 175000, x: 214, y: 264, w: 90, h: 80, zone: "Zone A — West Hall" },
  { spaceNumber: "A05", category: "Corner Stall",              size: "3m x 4m", price: 225000, x: 120, y: 348, w: 90, h: 80, zone: "Zone A — West Hall" },
  { spaceNumber: "A06", category: "Corner Stall",              size: "3m x 4m", price: 225000, x: 214, y: 348, w: 90, h: 80, zone: "Zone A — West Hall" },
  // Zone B — Central Hall
  { spaceNumber: "B01", category: "Standard Exhibition Stall", size: "4m x 3m", price: 210000, x: 380, y: 180, w: 110, h: 90, zone: "Zone B — Central Hall" },
  { spaceNumber: "B02", category: "Standard Exhibition Stall", size: "4m x 3m", price: 210000, x: 494, y: 180, w: 110, h: 90, zone: "Zone B — Central Hall" },
  { spaceNumber: "B03", category: "Standard Exhibition Stall", size: "4m x 3m", price: 200000, x: 380, y: 274, w: 110, h: 90, zone: "Zone B — Central Hall" },
  { spaceNumber: "B04", category: "Standard Exhibition Stall", size: "4m x 3m", price: 200000, x: 494, y: 274, w: 110, h: 90, zone: "Zone B — Central Hall" },
  { spaceNumber: "B05", category: "Premium Island",            size: "8m x 3m", price: 420000, x: 380, y: 368, w: 224, h: 80, zone: "Zone B — Central Hall" },
  // Zone C — East Hall
  { spaceNumber: "C01", category: "Standard Exhibition Stall", size: "4m x 3m", price: 205000, x: 680, y: 180, w: 100, h: 90, zone: "Zone C — East Hall" },
  { spaceNumber: "C02", category: "Standard Exhibition Stall", size: "4m x 3m", price: 205000, x: 784, y: 180, w: 100, h: 90, zone: "Zone C — East Hall" },
  { spaceNumber: "C03", category: "Standard Exhibition Stall", size: "4m x 3m", price: 195000, x: 680, y: 274, w: 100, h: 90, zone: "Zone C — East Hall" },
  { spaceNumber: "C04", category: "Standard Exhibition Stall", size: "4m x 3m", price: 195000, x: 784, y: 274, w: 100, h: 90, zone: "Zone C — East Hall" },
  { spaceNumber: "C05", category: "Premium Island",            size: "8m x 3m", price: 410000, x: 680, y: 368, w: 204, h: 80, zone: "Zone C — East Hall" },
  // Zone D — Innovation Pods
  { spaceNumber: "D01", category: "Compact Pod", size: "2m x 2m", price: 95000,  x: 960, y: 180, w: 110, h: 80, zone: "Zone D — Innovation Pods" },
  { spaceNumber: "D02", category: "Compact Pod", size: "2m x 2m", price: 95000,  x: 960, y: 264, w: 110, h: 80, zone: "Zone D — Innovation Pods" },
  { spaceNumber: "D03", category: "Compact Pod", size: "2m x 2m", price: 88000,  x: 960, y: 348, w: 110, h: 80, zone: "Zone D — Innovation Pods" },
  { spaceNumber: "D04", category: "Compact Pod", size: "2m x 2m", price: 88000,  x: 960, y: 432, w: 110, h: 80, zone: "Zone D — Innovation Pods" },
];

// ─── Event 2 spaces ───────────────────────────────────────────────────────────

const MAKERS_SPACES: RawSpace[] = [
  // Design Studios (Corner Stalls ×4)
  { spaceNumber: "M01", category: "Corner Stall", size: "3m x 3m", price: 45000, x: 120, y: 180, w: 90, h: 80, zone: "Design Studios" },
  { spaceNumber: "M02", category: "Corner Stall", size: "3m x 3m", price: 45000, x: 214, y: 180, w: 90, h: 80, zone: "Design Studios" },
  { spaceNumber: "M03", category: "Corner Stall", size: "3m x 3m", price: 45000, x: 120, y: 264, w: 90, h: 80, zone: "Design Studios" },
  { spaceNumber: "M04", category: "Corner Stall", size: "3m x 3m", price: 45000, x: 214, y: 264, w: 90, h: 80, zone: "Design Studios" },
  // Artisan Market (Compact Pods ×8)
  { spaceNumber: "M05", category: "Compact Pod", size: "2m x 2m", price: 25000, x: 530, y: 180, w: 90, h: 80, zone: "Artisan Market" },
  { spaceNumber: "M06", category: "Compact Pod", size: "2m x 2m", price: 25000, x: 624, y: 180, w: 90, h: 80, zone: "Artisan Market" },
  { spaceNumber: "M07", category: "Compact Pod", size: "2m x 2m", price: 25000, x: 718, y: 180, w: 90, h: 80, zone: "Artisan Market" },
  { spaceNumber: "M08", category: "Compact Pod", size: "2m x 2m", price: 25000, x: 530, y: 264, w: 90, h: 80, zone: "Artisan Market" },
  { spaceNumber: "M09", category: "Compact Pod", size: "2m x 2m", price: 25000, x: 624, y: 264, w: 90, h: 80, zone: "Artisan Market" },
  { spaceNumber: "M10", category: "Compact Pod", size: "2m x 2m", price: 25000, x: 718, y: 264, w: 90, h: 80, zone: "Artisan Market" },
  { spaceNumber: "M11", category: "Compact Pod", size: "2m x 2m", price: 25000, x: 530, y: 348, w: 90, h: 80, zone: "Artisan Market" },
  { spaceNumber: "M12", category: "Compact Pod", size: "2m x 2m", price: 25000, x: 624, y: 348, w: 90, h: 80, zone: "Artisan Market" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  await connectDB();
  await dropIfForce();

  // ── Admin user ──────────────────────────────────────────────────────────────
  const adminUsername = process.env["SEED_ADMIN_USERNAME"] ?? "admin";
  const adminPassword = process.env["SEED_ADMIN_PASSWORD"] ?? "Admin@123";

  const existingAdmin = await AdminUser.findOne({ username: adminUsername });
  if (!existingAdmin) {
    const hash = await hashPassword(adminPassword);
    await AdminUser.create({
      username: adminUsername,
      passwordHash: hash,
      displayName: "Super Administrator",
      isSuperAdmin: true,
      eventRoles: [],
      isActive: true,
    });
    console.log(`[seed] Admin user "${adminUsername}" created.`);
  } else {
    console.log(`[seed] Admin user "${adminUsername}" already exists — skipped.`);
  }

  // ── Event 1 — VenueFlow Business Expo 2027 ──────────────────────────────────
  const expoSlug = "business-expo";
  let expoEvent = await Event.findOne({ slug: expoSlug });
  if (!expoEvent) {
    expoEvent = await Event.create({
      slug: expoSlug,
      name: "VenueFlow Business Expo 2027",
      tagline: "The premier exhibition booking platform for industry leaders and enterprise buyers.",
      description: "A two-day curated exhibition bringing together manufacturers, technology providers, distributors and enterprise buyers under one roof.",
      edition: "2027 Edition",
      startDate: "2027-01-28T09:00:00+05:00",
      endDate: "2027-01-29T18:00:00+05:00",
      dateLabel: "28 – 29 January 2027",
      timeLabel: "09:00 – 18:00 PKT",
      venue: { name: "VenueFlow Convention Center, Grand Exhibition Hall", city: "Karachi, Pakistan", address: "VenueFlow Convention Center, Main Expo Boulevard, Karachi" },
      currency: "PKR",
      contact: { email: "events@venueflow-demo.com", phone: "+92 21 0000 0000", whatsapp: ["+92 300 1234567"] },
      booking: { paymentPendingMinutes: 30, paymentReviewGraceHours: 24 },
      floorPlanLabel: "VenueFlow Exhibition Hall Layout",
      paymentProviders: ["PAYFAST", "MANUAL"],
      payfastMerchantId: process.env["PAYFAST_MERCHANT_ID_business-expo"] ?? "",
      isPublished: true,
    });
    console.log("[seed] Event 1 (Business Expo) created.");
  } else {
    console.log("[seed] Event 1 already exists — skipped.");
  }

  const expoFloorPlan = await FloorPlan.findOne({ eventId: expoEvent._id });
  if (!expoFloorPlan) {
    const fp = await FloorPlan.create({
      eventId: expoEvent._id,
      label: "VenueFlow Exhibition Hall Layout",
      canvasWidth: 1200,
      canvasHeight: 800,
      elements: EXPO_ELEMENTS,
    });
    // Create spaces
    for (const s of EXPO_SPACES) {
      await Space.updateOne(
        { eventId: expoEvent._id, spaceNumber: s.spaceNumber },
        { $setOnInsert: { ...s, eventId: expoEvent._id, floorPlanId: fp._id, isActive: true } },
        { upsert: true },
      );
    }
    console.log(`[seed] Event 1 floor plan + ${EXPO_SPACES.length} spaces created.`);
  }

  // ── Event 2 — Lahore Makers Market 2027 ─────────────────────────────────────
  const makersSlug = "makers-market";
  let makersEvent = await Event.findOne({ slug: makersSlug });
  if (!makersEvent) {
    makersEvent = await Event.create({
      slug: makersSlug,
      name: "Lahore Makers Market 2027",
      tagline: "Independent design. Local craft. A shared creative space.",
      description: "Discover independent ceramics, textiles, homeware and illustration from local makers in a one-day curated market.",
      edition: "Spring 2027",
      startDate: "2027-03-20T10:00:00+05:00",
      endDate: "2027-03-20T20:00:00+05:00",
      dateLabel: "20 March 2027",
      timeLabel: "10:00 – 20:00 PKT",
      venue: { name: "Garden Pavilion", city: "Lahore, Pakistan", address: "12 Garden Avenue, Gulberg, Lahore" },
      currency: "PKR",
      contact: { email: "hello@makers.example", phone: "+92 42 5550 1200", whatsapp: ["+92 300 5551200"] },
      booking: { paymentPendingMinutes: 45, paymentReviewGraceHours: 24 },
      floorPlanLabel: "Makers Market Layout",
      paymentProviders: ["MANUAL"],
      isPublished: true,
    });
    console.log("[seed] Event 2 (Makers Market) created.");
  } else {
    console.log("[seed] Event 2 already exists — skipped.");
  }

  const makersFloorPlan = await FloorPlan.findOne({ eventId: makersEvent._id });
  if (!makersFloorPlan) {
    const fp = await FloorPlan.create({
      eventId: makersEvent._id,
      label: "Makers Market Layout",
      canvasWidth: 1200,
      canvasHeight: 800,
      elements: MAKERS_ELEMENTS,
    });
    for (const s of MAKERS_SPACES) {
      await Space.updateOne(
        { eventId: makersEvent._id, spaceNumber: s.spaceNumber },
        { $setOnInsert: { ...s, eventId: makersEvent._id, floorPlanId: fp._id, isActive: true } },
        { upsert: true },
      );
    }
    console.log(`[seed] Event 2 floor plan + ${MAKERS_SPACES.length} spaces created.`);
  }

  console.log("[seed] Done.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[seed] Fatal:", err);
  process.exit(1);
});
