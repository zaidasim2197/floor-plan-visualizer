import { useSyncExternalStore } from "react";
import { eventConfig } from "@/config/event";
import { stalls, getStall } from "@/data/floor-plan";
import {
  ACTIVE_STATUSES,
  type AuditEvent,
  type Booking,
  type BookingStatus,
  type NotificationRecord,
  type StallStatus,
} from "@/lib/booking-types";

/**
 * DEMO BOOKING ENGINE (UI prototype)
 * ---------------------------------
 * This module is the single source of truth for booking state in the prototype.
 * It intentionally mirrors the shape of a real server/database service:
 * every mutation is a guarded, all-or-nothing transition that re-checks stall
 * availability before writing. Swapping this file for real API calls later does
 * not require changing any component.
 */

const STORAGE_KEY = "marriott-expo-demo-state-v1";
const HOLD_MS = eventConfig.booking.paymentPendingMinutes * 60 * 1000;

interface StoreState {
  bookings: Booking[];
  audit: AuditEvent[];
  notifications: NotificationRecord[];
  seq: number;
}

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const now = () => Date.now();
const uid = () => Math.random().toString(36).slice(2, 10);

// ---------------------------------------------------------------- seed data

function seed(): StoreState {
  const state: StoreState = { bookings: [], audit: [], notifications: [], seq: 0 };
  const t = now();
  const mk = (
    stallId: string,
    status: BookingStatus,
    customer: string,
    company: string,
    minutesAgo: number,
    extra: Partial<Booking> = {},
  ) => {
    const stall = getStall(stallId)!;
    state.seq += 1;
    const createdAt = t - minutesAgo * 60 * 1000;
    const booking: Booking = {
      id: uid(),
      reference: `EVT-2027-${String(1000 + state.seq).slice(1)}`,
      stallId,
      customerName: customer,
      companyName: company,
      email: `${company.toLowerCase().replace(/[^a-z]/g, "")}@demo-mail.test`,
      phone: "+92 300 000000" + (state.seq % 10),
      productService: "Demo product / service listing",
      notes: "",
      amount: stall.price,
      status,
      paymentStatus: status === "CONFIRMED" ? "VERIFIED" : status === "PAYMENT_REVIEW" ? "EVIDENCE_SUBMITTED" : "UNPAID",
      createdAt,
      expiresAt: createdAt + HOLD_MS,
      source: "PUBLIC",
      ...extra,
    };
    state.bookings.push(booking);
    state.audit.push({
      id: uid(),
      bookingRef: booking.reference,
      action: "DEMO_SEED",
      actor: "system",
      details: `Seeded demo booking for ${stallId} with status ${status}`,
      createdAt,
    });
    return booking;
  };

  mk("A02", "PAYMENT_PENDING", "Hamza Iqbal", "Northline Systems", 6);
  mk("B03", "PAYMENT_PENDING", "Sana Raza", "Vertex Instruments", 12);
  mk("C04", "PAYMENT_PENDING", "Bilal Ahmed", "Orbit Logistics", 19);
  mk("B01", "PAYMENT_REVIEW", "Ayesha Khan", "Meridian Foods", 40, {
    paymentSubmittedAt: t - 32 * 60 * 1000,
    paymentReference: "TRX-448120",
  });
  mk("D02", "PAYMENT_REVIEW", "Usman Tariq", "Cascade Energy", 55, {
    paymentSubmittedAt: t - 45 * 60 * 1000,
    paymentReference: "TRX-448233",
  });
  const seedNames = ["Zara Malik", "Faisal Sheikh", "Nida Aslam", "Rehan Qureshi", "Maria Yousuf"];
  const seedCompanies = ["Arcadia Textiles", "Helix Robotics", "Bluepeak Pharma", "Sona Ceramics", "Tallgrass Agri"];
  ["A01", "B05", "C01", "C05", "D01"].forEach((id, i) =>
    mk(id, "CONFIRMED", seedNames[i] ?? "Exhibitor", seedCompanies[i] ?? "Company", 600 + i * 30, {
      confirmedAt: t - (500 + i * 20) * 60 * 1000,
    }),
  );
  mk("A04", "EXPIRED", "Kamran Vohra", "Delta Packaging", 190, {
    expiresAt: t - 160 * 60 * 1000,
  });
  mk("C01", "CONFLICT", "Imran Baig", "Silverline Traders", 320, {
    expiresAt: t - 290 * 60 * 1000,
    paymentStatus: "EVIDENCE_SUBMITTED",
    paymentSubmittedAt: t - 280 * 60 * 1000,
    paymentReference: "TRX-447019",
    conflictReason: "Payment evidence received after the temporary hold expired.",
  });

  return state;
}

// ------------------------------------------------------------- persistence

let state: StoreState = { bookings: [], audit: [], notifications: [], seq: 0 };
let hydrated = false;
const listeners = new Set<() => void>();
const SYNC_CHANNEL = "marriott_expo_realtime_sync";
let broadcastChannel: BroadcastChannel | null = null;

function reloadFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state = JSON.parse(raw) as StoreState;
      sweepExpired();
      cachedSnapshot = { ...state };
      listeners.forEach((l) => l());
    }
  } catch {
    /* ignore storage read error */
  }
}

if (typeof window !== "undefined") {
  try {
    if ("BroadcastChannel" in window) {
      broadcastChannel = new BroadcastChannel(SYNC_CHANNEL);
      broadcastChannel.onmessage = () => {
        reloadFromStorage();
      };
    }

    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) {
        reloadFromStorage();
      }
    });

    // Background 1-second auto-sweep & real-time sync interval
    setInterval(() => {
      reloadFromStorage();
    }, 1000);
  } catch {
    /* ignore fallback */
  }
}

function load() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    state = raw ? (JSON.parse(raw) as StoreState) : seed();
  } catch {
    state = seed();
  }
  sweepExpired();
  cachedSnapshot = state;
  persist();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — demo continues in memory */
  }
}

let cachedSnapshot: StoreState = state;

function emit() {
  persist();
  cachedSnapshot = { ...state };
  listeners.forEach((l) => l());
  try {
    broadcastChannel?.postMessage("sync");
  } catch {
    /* ignore broadcast error */
  }
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): StoreState {
  load();
  return cachedSnapshot;
}

const serverSnapshot: StoreState = { bookings: [], audit: [], notifications: [], seq: 0 };

export function useBookingState() {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}

// ------------------------------------------------------------------ logging

function log(action: string, actor: string, details: string, bookingRef?: string) {
  state.audit.unshift({ id: uid(), action, actor, details, bookingRef, createdAt: now() });
}

function notify(
  audience: "ADMIN" | "CUSTOMER",
  recipient: string,
  subject: string,
  body: string,
  bookingRef?: string,
) {
  state.notifications.unshift({
    id: uid(),
    audience,
    recipient,
    subject,
    body,
    bookingRef,
    status: "SENT (TEST MODE)",
    createdAt: now(),
  });
}

// ------------------------------------------------------------- derived data

export function activeBookingForStall(bookings: Booking[], stallId: string): Booking | undefined {
  return bookings.find((b) => b.stallId === stallId && ACTIVE_STATUSES.includes(b.status));
}

export function stallStatus(bookings: Booking[], stallId: string): StallStatus {
  const active = activeBookingForStall(bookings, stallId);
  return active ? active.status : "AVAILABLE";
}

export function stallStatusMap(bookings: Booking[]): Record<string, StallStatus> {
  const map: Record<string, StallStatus> = {};
  for (const s of stalls) map[s.id] = stallStatus(bookings, s.id);
  return map;
}

export function metrics(bookings: Booking[]) {
  const map = stallStatusMap(bookings);
  const count = (s: StallStatus) => Object.values(map).filter((v) => v === s).length;
  return {
    total: stalls.length,
    available: count("AVAILABLE"),
    paymentPending: count("PAYMENT_PENDING"),
    paymentReview: count("PAYMENT_REVIEW"),
    confirmed: count("CONFIRMED"),
    expired: bookings.filter((b) => b.status === "EXPIRED").length,
    conflicts: bookings.filter((b) => b.status === "CONFLICT").length,
  };
}

// -------------------------------------------------------------- expiry sweep

export function sweepExpired() {
  let changed = false;
  const t = now();
  for (const b of state.bookings) {
    // PAYMENT_REVIEW is protected: evidence was submitted before expiry.
    if (b.status === "PAYMENT_PENDING" && b.expiresAt < t) {
      b.status = "EXPIRED";
      changed = true;
      log("BOOKING_EXPIRED", "system", `Temporary hold on ${b.stallId} expired without payment.`, b.reference);
      notify(
        "CUSTOMER",
        b.email,
        `Reservation expired — ${b.stallId}`,
        `Your temporary reservation for space ${b.stallId} expired because payment was not verified within ${eventConfig.booking.paymentPendingMinutes} minutes. The space is available again. Contact us if you have already paid.`,
        b.reference,
      );
    }
  }
  if (changed) emit();
  return changed;
}

if (typeof window !== "undefined") {
  window.setInterval(sweepExpired, 15000);
}

// ---------------------------------------------------------------- mutations

export interface BookingInput {
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  productService: string;
  notes: string;
}

function nextReference() {
  state.seq += 1;
  return `EVT-2027-${String(1000 + state.seq).slice(1)}`;
}

/** Atomic create: re-checks availability immediately before writing. */
export function createBooking(
  stallId: string,
  input: BookingInput,
  source: "PUBLIC" | "ADMIN" = "PUBLIC",
  presetStatus?: BookingStatus,
): Result<Booking> {
  load();
  sweepExpired();
  const stall = getStall(stallId);
  if (!stall) return { ok: false, error: "This space does not exist." };
  if (activeBookingForStall(state.bookings, stallId)) {
    return { ok: false, error: "This space was just taken by another customer. Please choose another space." };
  }

  const t = now();
  const booking: Booking = {
    id: uid(),
    reference: nextReference(),
    stallId,
    ...input,
    amount: stall.price,
    status: presetStatus ?? "PAYMENT_PENDING",
    paymentStatus: presetStatus === "CONFIRMED" ? "VERIFIED" : "UNPAID",
    createdAt: t,
    expiresAt: t + HOLD_MS,
    confirmedAt: presetStatus === "CONFIRMED" ? t : undefined,
    source,
  };
  state.bookings.unshift(booking);
  log("BOOKING_CREATED", source === "ADMIN" ? "admin" : "customer", `${booking.stallId} held for ${booking.companyName}.`, booking.reference);
  notify(
    "ADMIN",
    eventConfig.contact.email,
    `New booking request — ${booking.stallId} (${booking.reference})`,
    `${booking.customerName} of ${booking.companyName} has requested space ${booking.stallId}. Amount: PKR ${booking.amount.toLocaleString()}. Payment verification required.`,
    booking.reference,
  );
  if (booking.status === "PAYMENT_PENDING") {
    notify(
      "CUSTOMER",
      booking.email,
      `Booking request received — ${booking.reference}`,
      `We have received your request for space ${booking.stallId}. Your space is temporarily reserved for ${eventConfig.booking.paymentPendingMinutes} minutes while payment is verified. This is not yet a confirmed booking — please complete payment and send your receipt via WhatsApp.`,
      booking.reference,
    );
  }
  emit();
  return { ok: true, data: booking };
}

export function submitPaymentEvidence(
  reference: string,
  paymentReference: string,
  paymentProofImage?: string,
): Result<Booking> {
  load();
  sweepExpired();
  const b = state.bookings.find((x) => x.reference === reference);
  if (!b) return { ok: false, error: "Booking not found." };

  if (b.status === "PAYMENT_PENDING") {
    b.status = "PAYMENT_REVIEW";
    b.paymentStatus = "EVIDENCE_SUBMITTED";
    b.paymentSubmittedAt = now();
    b.paymentReference = paymentReference;
    if (paymentProofImage) {
      b.paymentProofImage = paymentProofImage;
    }
    log(
      "PAYMENT_SUBMITTED",
      "customer",
      `Payment evidence ${paymentReference} ${paymentProofImage ? "(with receipt image proof) " : ""}submitted for ${b.stallId}.`,
      b.reference,
    );
    notify(
      "ADMIN",
      eventConfig.contact.email,
      `Payment Proof Submitted — ${b.reference} (Space ${b.stallId})`,
      `Exhibitor ${b.customerName} (${b.companyName}) has submitted payment proof for space ${b.stallId}.${
        paymentProofImage ? " Payment receipt image has been uploaded and is ready for admin verification." : ""
      }\nTransaction Ref: ${paymentReference}\nBooking ID: ${b.reference}`,
      b.reference,
    );
    notify(
      "CUSTOMER",
      b.email,
      `Payment proof received for review — ${b.reference}`,
      `Thank you. Your payment proof image and reference have been submitted successfully and are under review by Marriott Expo organizers. Your space ${b.stallId} is protected while our team verifies the payment.`,
      b.reference,
    );
    emit();
    return { ok: true, data: b };
  }

  if (b.status === "EXPIRED" || b.status === "CANCELLED") {
    // Late payment: never silently overwrite the current holder of the stall.
    b.status = "CONFLICT";
    b.paymentStatus = "EVIDENCE_SUBMITTED";
    b.paymentSubmittedAt = now();
    b.paymentReference = paymentReference;
    if (paymentProofImage) {
      b.paymentProofImage = paymentProofImage;
    }
    b.conflictReason = "Payment evidence received after the temporary hold expired.";
    log(
      "CONFLICT_CREATED",
      "system",
      `Late payment on ${b.stallId} for ${b.companyName}. Manual resolution required.`,
      b.reference,
    );
    notify(
      "ADMIN",
      eventConfig.contact.email,
      `Payment conflict detected — ${b.reference}`,
      `Payment reference ${paymentReference} arrived after booking ${b.reference} expired. Space ${b.stallId} may now belong to another customer. Manual resolution required.`,
      b.reference,
    );
    notify(
      "CUSTOMER",
      b.email,
      `We are reviewing your payment — ${b.reference}`,
      `Your payment arrived after the reservation window closed. Our team is reviewing your case and will contact you shortly. Your payment record has been preserved.`,
      b.reference,
    );
    emit();
    return { ok: true, data: b };
  }

  return { ok: false, error: "Payment cannot be submitted for this booking in its current state." };
}

export function confirmOnlineCardPayment(reference: string, cardTxnRef: string): Result<Booking> {
  load();
  sweepExpired();
  const b = state.bookings.find((x) => x.reference === reference);
  if (!b) return { ok: false, error: "Booking not found." };
  if (b.status === "CONFIRMED") return { ok: true, data: b };

  const holder = activeBookingForStall(state.bookings, b.stallId);
  if (holder && holder.reference !== b.reference) {
    return {
      ok: false,
      error: `Space ${b.stallId} is no longer held by your session. Please select another available space.`,
    };
  }

  b.status = "CONFIRMED";
  b.paymentStatus = "VERIFIED";
  b.paymentReference = cardTxnRef;
  b.paymentSubmittedAt = now();
  b.confirmedAt = now();
  log(
    "CARD_PAYMENT_SUCCESSFUL",
    "customer",
    `Online card payment ${cardTxnRef} processed. Space ${b.stallId} confirmed for ${b.companyName}.`,
    b.reference,
  );
  notify(
    "ADMIN",
    eventConfig.contact.email,
    `Online Payment Confirmed — ${b.reference}`,
    `Online credit card payment (${cardTxnRef}) processed for ${b.companyName} on space ${b.stallId}. Amount: PKR ${b.amount.toLocaleString()}. Space is confirmed.`,
    b.reference,
  );
  notify(
    "CUSTOMER",
    b.email,
    `Payment Successful & Space Confirmed — ${b.stallId}`,
    `Your online payment has been processed successfully. Your space ${b.stallId} is permanently confirmed for ${eventConfig.name}.\nTransaction Ref: ${cardTxnRef}\nBooking ID: ${b.reference}.`,
    b.reference,
  );
  emit();
  return { ok: true, data: b };
}

export function approveBooking(reference: string): Result<Booking> {
  load();
  const b = state.bookings.find((x) => x.reference === reference);
  if (!b) return { ok: false, error: "Booking not found." };
  if (b.status === "CONFIRMED") return { ok: false, error: "This booking is already confirmed." };

  const holder = activeBookingForStall(state.bookings, b.stallId);
  if (holder && holder.reference !== b.reference) {
    return { ok: false, error: `Space ${b.stallId} is currently held by ${holder.reference}. Release or reassign it first.` };
  }

  b.status = "CONFIRMED";
  b.paymentStatus = "VERIFIED";
  b.confirmedAt = now();
  log("BOOKING_APPROVED", "admin", `Payment verified and ${b.stallId} confirmed for ${b.companyName}.`, b.reference);
  notify("CUSTOMER", b.email, `Booking confirmed — ${b.stallId}`, `Payment received and your exhibition space is confirmed.\nCustomer: ${b.customerName}\nBooking ID: ${b.reference}\nSpace: ${b.stallId}\nEvent: ${eventConfig.name}, ${eventConfig.dateLabel}, ${eventConfig.venue.name}.`, b.reference);
  emit();
  return { ok: true, data: b };
}

export function releaseBooking(reference: string, reason: "RELEASED" | "CANCELLED"): Result<Booking> {
  load();
  const b = state.bookings.find((x) => x.reference === reference);
  if (!b) return { ok: false, error: "Booking not found." };
  b.status = reason === "CANCELLED" ? "CANCELLED" : "EXPIRED";
  b.cancelledAt = now();
  log(reason === "CANCELLED" ? "BOOKING_CANCELLED" : "BOOKING_RELEASED", "admin", `${b.stallId} released back to available. Customer: ${b.companyName}.`, b.reference);
  notify("CUSTOMER", b.email, `Reservation released — ${b.reference}`, `Your reservation for space ${b.stallId} has been released by the organiser. If this is unexpected, please contact us.`, b.reference);
  emit();
  return { ok: true, data: b };
}

export function reassignBooking(reference: string, newStallId: string): Result<Booking> {
  load();
  const b = state.bookings.find((x) => x.reference === reference);
  if (!b) return { ok: false, error: "Booking not found." };
  const stall = getStall(newStallId);
  if (!stall) return { ok: false, error: "Target space does not exist." };
  const holder = activeBookingForStall(state.bookings, newStallId);
  if (holder && holder.reference !== reference) {
    return { ok: false, error: `Space ${newStallId} is not available.` };
  }
  const from = b.stallId;
  b.stallId = newStallId;
  b.amount = stall.price;
  if (b.status === "CONFLICT" || b.status === "EXPIRED") b.status = "PAYMENT_REVIEW";
  log("BOOKING_REASSIGNED", "admin", `Moved ${b.companyName} from ${from} to ${newStallId}.`, b.reference);
  notify("CUSTOMER", b.email, `Your space has been updated — ${b.reference}`, `Your exhibition space has been moved from ${from} to ${newStallId}. Amount: PKR ${b.amount.toLocaleString()}.`, b.reference);
  emit();
  return { ok: true, data: b };
}

export function updateBooking(reference: string, patch: Partial<BookingInput>): Result<Booking> {
  load();
  const b = state.bookings.find((x) => x.reference === reference);
  if (!b) return { ok: false, error: "Booking not found." };
  Object.assign(b, patch);
  log("BOOKING_UPDATED", "admin", `Booking details updated for ${b.reference}.`, b.reference);
  emit();
  return { ok: true, data: b };
}

export function resolveConflict(reference: string, resolution: string): Result<Booking> {
  load();
  const b = state.bookings.find((x) => x.reference === reference);
  if (!b) return { ok: false, error: "Booking not found." };
  b.status = "CANCELLED";
  b.paymentStatus = "REFUND_PENDING";
  b.cancelledAt = now();
  log("CONFLICT_RESOLVED", "admin", `${resolution} — ${b.reference}`, b.reference);
  notify("CUSTOMER", b.email, `Update on your booking — ${b.reference}`, `${resolution}. Our team will be in touch to complete the process.`, b.reference);
  emit();
  return { ok: true, data: b };
}

export function expireNow(reference: string): Result<Booking> {
  load();
  const b = state.bookings.find((x) => x.reference === reference);
  if (!b) return { ok: false, error: "Booking not found." };
  b.expiresAt = now() - 1000;
  if (b.status === "PAYMENT_PENDING") {
    b.status = "EXPIRED";
    log("BOOKING_EXPIRED", "system", `Hold on ${b.stallId} force-expired for demonstration.`, b.reference);
  }
  emit();
  return { ok: true, data: b };
}

export function resetDemoData() {
  state = seed();
  hydrated = true;
  emit();
}

export function findBooking(bookings: Booking[], reference: string) {
  return bookings.find((b) => b.reference === reference);
}
