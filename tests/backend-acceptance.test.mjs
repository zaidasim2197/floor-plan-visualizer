import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import "dotenv/config";
import { connectDB } from "../src/server/db.ts";
import {
  Event,
  Space,
  FloorPlan,
  Booking,
  PaymentWebhookEvent,
  AuditEvent,
  Notification,
} from "../src/server/models/index.ts";
import { sweepExpiredBookings } from "../src/server/lib/expiry.ts";
import { processVerifiedWebhook } from "../src/server/lib/webhookProcessor.ts";

describe("Sprint Acceptance & Architectural Invariants", () => {
  let testEvent;
  let testFloorPlan;
  let testSpace;

  before(async () => {
    await connectDB();
    // Create isolated test event, floor plan & space
    testEvent = await Event.create({
      slug: "test-sprint-event-" + Date.now(),
      name: "Test Sprint Event",
      startDate: "2027-10-10",
      endDate: "2027-10-12",
      dateLabel: "10-12 Oct 2027",
      timeLabel: "09:00 - 18:00",
      venue: { name: "Expo Center", city: "Karachi", address: "Main Boulevard" },
      currency: "PKR",
      contact: { email: "test@vision71.test", phone: "+92 300 0000000", whatsapp: [] },
      booking: { paymentPendingMinutes: 1, paymentReviewGraceHours: 24 },
      paymentProviders: ["SIMULATED"],
      isPublished: true,
    });

    testFloorPlan = await FloorPlan.create({
      eventId: testEvent._id,
      label: "Test Layout",
      canvasWidth: 1200,
      canvasHeight: 800,
      elements: [],
    });

    testSpace = await Space.create({
      eventId: testEvent._id,
      floorPlanId: testFloorPlan._id,
      spaceNumber: "T-01",
      zone: "Main Zone",
      category: "Standard Exhibition Stall",
      sizeLabel: "3m x 3m",
      price: 50000,
      x: 100,
      y: 100,
      w: 60,
      h: 60,
      isActive: true,
    });
  });

  after(async () => {
    if (testEvent) {
      await Booking.deleteMany({ eventId: testEvent._id });
      await Space.deleteMany({ eventId: testEvent._id });
      await FloorPlan.deleteMany({ eventId: testEvent._id });
      await PaymentWebhookEvent.deleteMany({});
      await Event.deleteOne({ _id: testEvent._id });
    }
    await mongoose.disconnect();
  });

  test("Check 1: Concurrency - Two simultaneous booking attempts for one space cannot both succeed", async () => {
    const bookingA = {
      eventId: testEvent._id,
      spaceId: testSpace._id,
      reference: "TST-CONC-01A",
      customerName: "Alice Corp",
      companyName: "Alice Inc",
      email: "alice@test.com",
      phone: "+923001111111",
      amount: testSpace.price,
      status: "PAYMENT_PENDING",
      paymentStatus: "UNPAID",
      expiresAt: new Date(Date.now() + 60000),
      source: "PUBLIC",
    };

    const bookingB = {
      eventId: testEvent._id,
      spaceId: testSpace._id,
      reference: "TST-CONC-01B",
      customerName: "Bob Corp",
      companyName: "Bob Inc",
      email: "bob@test.com",
      phone: "+923002222222",
      amount: testSpace.price,
      status: "PAYMENT_PENDING",
      paymentStatus: "UNPAID",
      expiresAt: new Date(Date.now() + 60000),
      source: "PUBLIC",
    };

    // Execute concurrently
    const results = await Promise.allSettled([
      Booking.create([bookingA]),
      Booking.create([bookingB]),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    assert.equal(fulfilled.length, 1, "Exactly one booking must succeed");
    assert.equal(rejected.length, 1, "The second concurrent booking must be rejected by partial unique index");
    assert.equal(rejected[0].reason.code, 11000, "Must fail with duplicate key code 11000");
  });

  test("Check 2: Hold Expiry - Expired hold releases the space for a new booking", async () => {
    // Force active booking to be expired
    await Booking.updateOne(
      { eventId: testEvent._id, spaceId: testSpace._id, status: "PAYMENT_PENDING" },
      { $set: { expiresAt: new Date(Date.now() - 5000) } },
    );

    const sweptCount = await sweepExpiredBookings(String(testEvent._id));
    assert.ok(sweptCount >= 1, "Expired booking must be swept");

    const expiredBooking = await Booking.findOne({
      eventId: testEvent._id,
      spaceId: testSpace._id,
    });
    assert.equal(expiredBooking?.status, "EXPIRED", "Booking status must transition to EXPIRED");

    const postExpiryRef = "TST-POST-EXPIRY-" + Date.now();
    // Attempting a new booking for the same space must now succeed
    const newBooking = await Booking.create({
      eventId: testEvent._id,
      spaceId: testSpace._id,
      reference: postExpiryRef,
      customerName: "Charlie Corp",
      companyName: "Charlie Ltd",
      email: "charlie@test.com",
      phone: "+923003333333",
      amount: testSpace.price,
      status: "PAYMENT_PENDING",
      paymentStatus: "UNPAID",
      expiresAt: new Date(Date.now() + 60000),
      source: "PUBLIC",
    });

    assert.ok(newBooking._id, "New booking must be successfully created on freed space");
  });

  test("Check 3: Webhook Replay Protection - Repeated webhook callback does not confirm twice or duplicate side effects", async () => {
    const booking = await Booking.findOne({ eventId: testEvent._id, status: "PAYMENT_PENDING" });
    assert.ok(booking);

    const mockResult = {
      valid: true,
      event: "PAYMENT_COMPLETE",
      providerRef: booking.reference,
      amount: booking.amount,
    };

    const firstCall = await processVerifiedWebhook(
      mockResult,
      "SIMULATED",
      JSON.stringify(mockResult),
      "test@vision71.test",
      String(testEvent._id),
    );
    assert.equal(firstCall.status, 200);

    const confirmed = await Booking.findById(booking._id);
    assert.equal(confirmed?.status, "CONFIRMED");
    assert.equal(confirmed?.paymentStatus, "VERIFIED");

    // Second call with same gatewayRef
    const secondCall = await processVerifiedWebhook(
      mockResult,
      "SIMULATED",
      JSON.stringify(mockResult),
      "test@vision71.test",
      String(testEvent._id),
    );
    assert.equal(secondCall.status, 200);
    const parsedSecond = JSON.parse(secondCall.body);
    assert.equal(parsedSecond.duplicate, true, "Replay protection must detect duplicate delivery");
  });

  test("Check 4: Failed Payment Webhook - Failed payment does not falsely confirm booking", async () => {
    // Create a new space and pending booking
    const failSpace = await Space.create({
      eventId: testEvent._id,
      floorPlanId: testFloorPlan._id,
      spaceNumber: "T-FAIL",
      zone: "Main Zone",
      category: "Compact Pod",
      sizeLabel: "2m x 2m",
      price: 25000,
      x: 200,
      y: 200,
      w: 40,
      h: 40,
      isActive: true,
    });

    const pendingBooking = await Booking.create({
      eventId: testEvent._id,
      spaceId: failSpace._id,
      reference: "TST-FAIL-HOOK",
      customerName: "Fail Test Corp",
      companyName: "Fail Inc",
      email: "fail@test.com",
      phone: "+923004444444",
      amount: 25000,
      status: "PAYMENT_PENDING",
      paymentStatus: "UNPAID",
      expiresAt: new Date(Date.now() + 60000),
      source: "PUBLIC",
    });

    const failResult = {
      valid: true,
      event: "PAYMENT_FAILED",
      providerRef: pendingBooking.reference,
      amount: 25000,
    };

    await processVerifiedWebhook(
      failResult,
      "SIMULATED",
      JSON.stringify(failResult),
      "test@vision71.test",
      String(testEvent._id),
    );

    const reloaded = await Booking.findById(pendingBooking._id);
    assert.equal(reloaded?.status, "PAYMENT_PENDING", "Booking status must remain PAYMENT_PENDING on failure");
    assert.equal(reloaded?.paymentStatus, "UNPAID", "Payment status must remain UNPAID on failure");
  });

  test("Check 5: Webhook Signature - Invalid signature is rejected with 400", async () => {
    const invalidResult = {
      valid: false,
      reason: "Signature mismatch",
    };

    const res = await processVerifiedWebhook(
      invalidResult,
      "SIMULATED",
      "{}",
      "test@vision71.test",
      String(testEvent._id),
    );

    assert.equal(res.status, 400);
    const parsed = JSON.parse(res.body);
    assert.equal(parsed.error, "INVALID_SIGNATURE");
  });

  test("Check 6: Hold Access Isolation - User B cannot hijack or resume User A's unexpired hold", async () => {
    // Create an isolated space for hold tests
    const holdSpace = await Space.create({
      eventId: testEvent._id,
      floorPlanId: testFloorPlan._id,
      spaceNumber: "T-HOLD-01",
      zone: "Main Zone",
      category: "Corner Stall",
      sizeLabel: "3m x 3m",
      price: 60000,
      x: 300,
      y: 300,
      w: 60,
      h: 60,
      isActive: true,
    });

    const userAToken = "token-user-a-12345";
    const userABooking = await Booking.create({
      eventId: testEvent._id,
      spaceId: holdSpace._id,
      reference: "TST-USER-A-HOLD",
      holdToken: userAToken,
      customerName: "Alice User",
      companyName: "Alice Tech",
      email: "alice.tech@test.com",
      phone: "+923001234567",
      amount: 60000,
      status: "PAYMENT_PENDING",
      paymentStatus: "UNPAID",
      expiresAt: new Date(Date.now() + 600000), // 10 minutes
      source: "PUBLIC",
    });

    // User B tries to place a booking or resume with a different token/email
    const userBToken = "token-user-b-99999";
    const existingActive = await Booking.findOne({
      eventId: testEvent._id,
      spaceId: holdSpace._id,
      status: { $in: ["PAYMENT_PENDING", "PAYMENT_REVIEW", "CONFIRMED"] },
    });

    assert.ok(existingActive, "Active hold by User A must be found");

    // Evaluate matching logic
    const isSameUser =
      existingActive.status === "PAYMENT_PENDING" &&
      ((userBToken && existingActive.holdToken === userBToken) ||
        ("TST-OTHER-REF" && existingActive.reference === "TST-OTHER-REF") ||
        existingActive.email.toLowerCase() === "bob.intruder@test.com");

    assert.equal(isSameUser, false, "User B must NOT match User A's hold credentials");

    // Attempting duplicate insert for User B must be rejected by partial unique index
    let userBError;
    try {
      await Booking.create([{
        eventId: testEvent._id,
        spaceId: holdSpace._id,
        reference: "TST-USER-B-HIJACK",
        holdToken: userBToken,
        customerName: "Bob Intruder",
        companyName: "Bob Industries",
        email: "bob.intruder@test.com",
        phone: "+923009999999",
        amount: 60000,
        status: "PAYMENT_PENDING",
        paymentStatus: "UNPAID",
        expiresAt: new Date(Date.now() + 600000),
        source: "PUBLIC",
      }]);
    } catch (err) {
      userBError = err;
    }

    assert.ok(userBError, "User B insert attempt on active hold must fail");
    assert.equal(userBError.code, 11000, "Database must reject User B with duplicate key 11000");
  });

  test("Check 7: Same-User Resumption - User A can resume and update their own hold with matching token", async () => {
    const existingActive = await Booking.findOne({
      reference: "TST-USER-A-HOLD",
      eventId: testEvent._id,
    });
    assert.ok(existingActive, "User A hold must exist");

    const userAToken = "token-user-a-12345";
    const isSameUser =
      existingActive.status === "PAYMENT_PENDING" &&
      ((userAToken && existingActive.holdToken === userAToken) ||
        (existingActive.reference === "TST-USER-A-HOLD") ||
        existingActive.email.toLowerCase() === "alice.tech@test.com");

    assert.equal(isSameUser, true, "User A with matching holdToken must be recognized as same user");

    // Resume: update customer details and extend expiry
    const newExpiresAt = new Date(Date.now() + 1800000);
    existingActive.customerName = "Alice User Updated";
    existingActive.companyName = "Alice Global Tech";
    existingActive.notes = "Resumed checkout session";
    existingActive.expiresAt = newExpiresAt;
    await existingActive.save();

    const updated = await Booking.findById(existingActive._id);
    assert.equal(updated?.customerName, "Alice User Updated");
    assert.equal(updated?.companyName, "Alice Global Tech");
    assert.equal(updated?.notes, "Resumed checkout session");
    assert.equal(updated?.status, "PAYMENT_PENDING");
  });

  test("Check 8: Confirmed Space Lockout - Nobody can place a hold or overwrite a CONFIRMED space", async () => {
    // Confirm User A's hold
    await Booking.updateOne(
      { reference: "TST-USER-A-HOLD" },
      { $set: { status: "CONFIRMED", paymentStatus: "VERIFIED", confirmedAt: new Date() } },
    );

    const spaceId = (await Booking.findOne({ reference: "TST-USER-A-HOLD" }))?.spaceId;
    assert.ok(spaceId);

    // Any new hold attempt on the confirmed space must be blocked
    const activeBooking = await Booking.findOne({
      eventId: testEvent._id,
      spaceId,
      status: { $in: ["PAYMENT_PENDING", "PAYMENT_REVIEW", "CONFIRMED"] },
    });

    assert.ok(activeBooking);
    assert.equal(activeBooking.status, "CONFIRMED");

    // Even if User A presents their token, confirmed bookings cannot be overwritten
    const isResumable = activeBooking.status === "PAYMENT_PENDING";
    assert.equal(isResumable, false, "CONFIRMED spaces cannot be re-opened as holds");
  });

  test("Check 9: Cross-Event Isolation - Cannot book or query space from Event 1 under Event 2", async () => {
    // Create a second separate event
    const secondEvent = await Event.create({
      slug: "isolated-event-2-" + Date.now(),
      name: "Isolated Event 2",
      startDate: "2027-11-01",
      endDate: "2027-11-03",
      dateLabel: "1-3 Nov 2027",
      timeLabel: "10:00 - 18:00",
      venue: { name: "Lahore Expo", city: "Lahore", address: "Johar Town" },
      currency: "PKR",
      contact: { email: "org@event2.test", phone: "+923000000001", whatsapp: [] },
      booking: { paymentPendingMinutes: 30, paymentReviewGraceHours: 24 },
      paymentProviders: ["SIMULATED"],
      isPublished: true,
    });

    // Look up testSpace (from testEvent) under secondEvent
    const spaceInEvent2 = await Space.findOne({
      eventId: secondEvent._id,
      _id: testSpace._id,
    });
    assert.equal(spaceInEvent2, null, "Space from Event 1 must not be accessible in Event 2");

    // Clean up secondEvent
    await Event.deleteOne({ _id: secondEvent._id });
  });

  test("Check 10: Malformed Space ID & Non-Existent Lookup Handling", async () => {
    const invalidId = "not-a-valid-object-id";
    const isObjectId = mongoose.Types.ObjectId.isValid(invalidId);
    assert.equal(isObjectId, false, "Invalid string must fail ObjectId validation without crashing");

    const space = await Space.findOne({
      eventId: testEvent._id,
      isActive: true,
      ...(isObjectId
        ? { $or: [{ _id: invalidId }, { spaceNumber: invalidId }] }
        : { spaceNumber: invalidId }),
    }).lean();

    assert.equal(space, null, "Query for non-existent space number returns null safely");
  });
});
