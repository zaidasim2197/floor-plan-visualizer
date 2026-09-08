import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// Exercise the real TypeScript demo services without a browser or extra test dependency.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/"))
      return {
        url: new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href,
        shortCircuit: true,
      };
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith(".ts") && !url.includes("node_modules"))
      return {
        format: "module",
        shortCircuit: true,
        source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
          compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
        }).outputText,
      };
    return nextLoad(url, context);
  },
});
const memory = new Map();
globalThis.localStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value),
};
globalThis.window = { localStorage, addEventListener() {}, setInterval() {} };
const realInterval = globalThis.setInterval;
globalThis.setInterval = () => 0;
const events = await import("../src/lib/event-store.ts");
const store = await import("../src/lib/booking-store.ts");
const { summarizeBookings, filterBookings } = await import("../src/lib/admin-data.ts");
const { eventConfig: initialConfig } = await import("../src/config/event.ts");
globalThis.setInterval = realInterval;
events.initializeEvents();
const input = {
  customerName: "Test Exhibitor",
  companyName: "Studio Example",
  email: "studio@example.test",
  phone: "+92 300 1234567",
  productService: "Ceramics",
  notes: "Acceptance test",
};

test("two distinct datasets and isolated booking inventories", () => {
  const first = store.getBookingSnapshot();
  assert.equal(first.bookings.length, 12);
  events.selectEvent("makers-market");
  const second = store.getBookingSnapshot();
  assert.equal(second.bookings.length, 4);
  assert.ok(
    second.bookings.every((b) => b.eventId === "makers-market" && b.stallId.startsWith("M")),
  );
  assert.equal(events.activeEvent().spaces.length, 12);
  assert.equal(events.activeEvent().config.booking.paymentPendingMinutes, 45);
  events.selectEvent(events.DEFAULT_EVENT_ID);
  assert.deepEqual(store.getBookingSnapshot(), first);
});

test("admin can create and edit an event, add a space and book it", () => {
  const form = {
    name: "Independent Design Fair",
    description: "An independent design fair with local makers.",
    venue: "Creative Hall",
    city: "Islamabad",
    address: "10 Studio Avenue",
    email: "organiser@example.test",
    phone: "+92 300 1234567",
    whatsapp: "+92 300 1234567",
    startDate: "2028-02-01T09:00",
    endDate: "2028-02-01T18:00",
    holdMinutes: 60,
  };
  const event = events.saveEvent(form);
  assert.equal(store.getBookingSnapshot().bookings.length, 0);
  events.saveSpaces([
    {
      id: "S01",
      stallNumber: "S01",
      category: "Compact Pod",
      size: "2m x 2m",
      price: 30000,
      zone: "Main hall",
      x: 120,
      y: 180,
      w: 90,
      h: 80,
    },
  ]);
  const booking = store.createBooking("S01", input);
  assert.equal(booking.ok, true);
  assert.equal(booking.data.eventId, event.id);
  assert.equal(booking.data.expiresAt - booking.data.createdAt, 60 * 60000);
  assert.ok(booking.data.reference.includes("2028"));
  assert.equal(store.createBooking("S01", input).ok, false);
  events.saveEvent({ ...form, name: "Design Fair · Updated", holdMinutes: 90 }, event.id);
  assert.equal(events.activeEvent().config.name, "Design Fair · Updated");
  assert.equal(store.getBookingSnapshot().bookings[0].amount, 30000);
  assert.equal(store.getBookingSnapshot().bookings[0].expiresAt, booking.data.expiresAt);
  assert.notEqual(initialConfig.name, events.activeEvent().config.name);
});

test("event and space validation reject invalid configuration", () => {
  assert.equal(events.eventFormSchema.safeParse({}).success, false);
  assert.equal(
    events.spaceSchema.safeParse({
      id: "bad",
      stallNumber: "bad",
      category: "Compact Pod",
      size: "2m",
      zone: "Test",
      price: -1,
      x: 1190,
      y: 0,
      w: 40,
      h: 40,
    }).success,
    false,
  );
  const space = events.activeEvent().spaces[0];
  assert.throws(() => events.saveSpaces([space, { ...space, id: "S02" }]));
  assert.equal(store.createBooking("S01", { ...input, email: "invalid" }).ok, false);
});

test("payment evidence, rejection, protected review, approval and refunds", () => {
  const booking = store.getBookingSnapshot().bookings[0];
  assert.equal(store.submitPaymentEvidence(booking.reference, " ").ok, false);
  assert.equal(
    store.submitPaymentEvidence(booking.reference, "TX-001", "data:text/html;base64,abcd").ok,
    false,
  );
  assert.equal(
    store.submitPaymentEvidence(booking.reference, "TX-001").data.status,
    "PAYMENT_REVIEW",
  );
  store.expireNow(booking.reference);
  assert.equal(store.getBookingSnapshot().bookings[0].status, "PAYMENT_REVIEW");
  assert.equal(
    store.rejectPaymentEvidence(booking.reference, "Please provide a legible bank reference").data
      .status,
    "PAYMENT_PENDING",
  );
  assert.equal(store.submitPaymentEvidence(booking.reference, "TX-002").ok, true);
  assert.equal(store.approveBooking(booking.reference).data.paymentStatus, "VERIFIED");
  assert.equal(
    summarizeBookings(store.getBookingSnapshot().bookings, events.activeEvent().spaces).revenue,
    30000,
  );
  assert.equal(
    store.releaseBooking(booking.reference, "CANCELLED").data.paymentStatus,
    "REFUND_PENDING",
  );
  assert.equal(store.approveBooking(booking.reference).ok, false);
  assert.equal(
    store.completeRefund(booking.reference, "REFUND-001").data.paymentStatus,
    "REFUNDED",
  );
  assert.equal(
    summarizeBookings(store.getBookingSnapshot().bookings, events.activeEvent().spaces).revenue,
    0,
  );
});

test("expiry releases inventory and late evidence cannot displace another booking", () => {
  const old = store.createBooking("S01", input).data;
  store.expireNow(old.reference);
  assert.equal(store.getBookingSnapshot().bookings.find((b) => b.id === old.id).status, "EXPIRED");
  const next = store.createBooking("S01", input).data;
  assert.equal(store.submitPaymentEvidence(old.reference, "LATE-001").data.status, "CONFLICT");
  assert.equal(store.approveBooking(old.reference).ok, false);
  assert.equal(store.confirmOnlineCardPayment(old.reference, "CARD-001").ok, false);
  assert.equal(
    store.getBookingSnapshot().bookings.find((b) => b.id === next.id).status,
    "PAYMENT_PENDING",
  );
});

test("combined filters include cancelled and refunded records; whitespace is trimmed", () => {
  const bookings = store.getBookingSnapshot().bookings;
  assert.equal(
    filterBookings(bookings, { status: "CANCELLED", payment: "REFUNDED", search: "  STUDIO  " })
      .length,
    1,
  );
  assert.equal(
    filterBookings(bookings, { status: "CONFIRMED", payment: "REFUNDED", search: "" }).length,
    0,
  );
  assert.equal(
    filterBookings(bookings, { status: "ALL", payment: "ALL", search: "studio@example.test" })
      .length,
    bookings.length,
  );
  assert.equal(summarizeBookings([], []).occupancy, 0);
});

test("visual placement detects stalls, corridors, facilities and map boundaries", async () => {
  const { placementFeedback, snapPosition, firstClearPosition } =
    await import("../src/lib/space-placement.ts");
  const space = {
    id: "draft",
    stallNumber: "NEW",
    category: "Compact Pod",
    size: "2m x 2m",
    price: 1000,
    zone: "Main hall",
    x: 120,
    y: 180,
    w: 90,
    h: 80,
  };
  assert.equal(placementFeedback(space, [space]).valid, true, "A space does not clash with itself");
  assert.equal(placementFeedback(space, [{ ...space, id: "other" }]).clashes[0].kind, "stall");
  assert.equal(placementFeedback({ ...space, x: 320 }, []).clashes[0].kind, "corridor");
  assert.equal(placementFeedback({ ...space, y: 60 }, []).clashes[0].kind, "facility");
  assert.equal(placementFeedback({ ...space, x: -5 }, []).outside, true);
  assert.equal(placementFeedback({ ...space, x: 1190 }, []).outside, true);
  assert.equal(
    placementFeedback({ ...space, w: 200, x: 120 }, []).valid,
    true,
    "Touching a corridor edge is valid",
  );
  assert.deepEqual(snapPosition(123, 181), { x: 125, y: 180 });
  const position = firstClearPosition([{ ...space, id: "other" }]);
  assert.equal(
    placementFeedback({ ...space, ...position }, [{ ...space, id: "other" }]).valid,
    true,
  );
});

test("storage rejects placing new spaces in restricted areas", () => {
  const existing = events.activeEvent().spaces;
  const space = {
    ...existing[0],
    id: "BLOCKED",
    stallNumber: "BLOCKED",
    x: 320,
    y: 180,
    w: 30,
    h: 40,
  };
  assert.throws(() => events.saveSpaces([...existing, space]), /Corridor/);
  assert.throws(
    () => events.saveSpaces([...existing, { ...space, x: 120, y: 60 }]),
    /Keynote Stage/,
  );
  assert.deepEqual(events.activeEvent().spaces, existing, "Invalid placement must not persist");
});
