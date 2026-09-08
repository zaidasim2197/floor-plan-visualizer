# Organiser frontend audit and integration handoff

## Scope and implementation status

| Requirement         | Before this work                                              | Current result                                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin event setup   | One source-code configuration                                 | Create/edit events in `/admin`: name, description, dates, venue, contact details and hold duration.                                                                                                         |
| Space management    | Static floor-plan array                                       | Add/edit/remove unused spaces; edit category, dimensions, zone, price and map placement. Duplicate numbers, overlapping spaces, invalid bounds and deletion with booking history are rejected.              |
| Booking management  | Search, status filter, manual creation, reassignment and edit | Added payment filters, cancelled status, whitespace-safe search, result counts, clear filters and shared validation.                                                                                        |
| Booking detail      | Limited map inspector / edit modal                            | Click any booking reference for contacts, notes, product/service, amount, payment evidence, reservation state and activity timeline.                                                                        |
| Manual payments     | Receipt display and approval                                  | Record evidence, request corrections with a reason and new hold, approve, cancel and record completed refunds with a transaction reference.                                                                 |
| Expiry              | Background demo sweep                                         | Visible countdown, explicit expired/cancelled/conflict labels and protected-review messaging. Late evidence cannot displace another reservation.                                                            |
| Occupancy / revenue | Occupancy counts                                              | Shared summary derives occupancy, verified revenue, pending value and refunds from the current event's booking records. **Real backend data remains to be integrated.**                                     |
| Two-event data      | One exhibition                                                | Business Expo: 20 spaces, PKR 88,000–420,000, 30-minute holds, Karachi. Makers Market: 12 spaces, PKR 25,000–45,000, 45-minute holds, Lahore. Each has separate fictional exhibitors and booking histories. |
| Generic integration | Single-event labels in several screens                        | Public event selector; active configuration shared across public/admin pages and map. No Marriott-specific source references found.                                                                         |

The site retains the existing forest-green palette, Manrope typography and shared Radix-based controls. No database, production authentication or server API existed in this repository. This delivery is a working frontend/demo implementation; it does not claim a connected database or a completed agreement with Zaid.

## Local review

1. Run `npm run dev`, open `/admin`, sign in with the displayed demo credentials (`admin` / `Admin@123`).
2. Switch between the two events. Inventory, bookings, summary, map and public content should change together.
3. Choose **Create event**, enter its details, then **Space management → Add space**. Use non-overlapping coordinates within the 1200 × 800 canvas.
4. Make a manual booking or visit the public floor plan. No source changes are required for a new event.
5. Filter bookings by reservation and payment status together; try customer/email/reference search and Clear filters.
6. Open a reference to review evidence, request corrections, confirm payment or cancel. Cancellation of paid/evidence-submitted bookings queues refund reconciliation. Marking a refund completed records a reference; it does not move money.
7. Refresh: event configuration and bookings persist in this browser. Booking records from the original demo storage key are preserved and assigned the original event ID.

## Contract proposal for Zaid

These are proposed integration boundaries, **not endpoints already implemented**. Backend agreement and connectivity are still required. Do not use the demo module's synchronous signature as an assertion that production API calls are synchronous.

### Models

- `ManagedEvent` (`src/lib/event-store.ts`): stable `id`, editable `config`, `spaces`; `sample` is demo-only.
- `Stall` (`src/lib/booking-types.ts`): immutable `id`, display `stallNumber`, category, physical size, price, zone and map coordinates. IDs and display numbers must be unique **within an event**. All space lookups must include `eventId`.
- `Booking`: includes `eventId`, stable ID/reference, space ID, customer details, booking-time amount, reservation status, independent payment status, timestamps and source. Existing prices and hold deadlines are snapshots; editing event settings must not rewrite them.
- `AuditEvent`: action, actor, reference, details and timestamp. Backend should additionally store immutable event/booking IDs and evidence history.
- Currency is PKR in this frontend. Monetary numbers are whole PKR here; explicitly convert if the backend uses minor units. Dates are entered in Pakistan time and persisted as ISO timestamps with `+05:00`; booking timestamps are epoch milliseconds.

### Proposed API operations

| Operation                                                       | Proposed route                                                             |
| --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| List/create events                                              | `GET /api/events`, `POST /api/events`                                      |
| Update event                                                    | `PATCH /api/events/:eventId`                                               |
| List/create/update/delete spaces                                | `/api/events/:eventId/spaces[/:spaceId]`                                   |
| List/search bookings                                            | `GET /api/events/:eventId/bookings?status=&paymentStatus=&search=&cursor=` |
| Booking detail and history                                      | `GET /api/events/:eventId/bookings/:bookingId`                             |
| Create reservation                                              | `POST /api/events/:eventId/bookings`                                       |
| Evidence / approve / return / cancel / reassign / refund record | Explicit action endpoints under the booking URL                            |
| Summary                                                         | `GET /api/events/:eventId/summary`                                         |

Return field validation errors as 422, state/availability conflicts as 409, and authorisation errors as 401/403. Return the updated booking and authoritative server time after mutations. Use idempotency keys and version checks for writes. Fetch fresh summary/bookings after successful actions and show pending/error UI while requests run.

### Reservation and payment rules

- Occupying statuses: `PAYMENT_PENDING`, `PAYMENT_REVIEW`, `CONFIRMED`.
- Pending holds expire at their stored deadline. Evidence submitted before expiry protects the reservation during manual review. The current demo has no automatic review timeout; agree a review escalation policy separately.
- Late evidence becomes `CONFLICT` and does not acquire the space. Approval must recheck the current holder atomically.
- Corrected evidence requests require a reason and start a fresh configured hold.
- Verified payments are independent from reservation state. Cancelling a verified or evidence-submitted booking sets `REFUND_PENDING`; recording a completed refund changes it to `REFUNDED`.
- Verified bookings can move only to equally priced spaces until payment-adjustment/reconciliation is implemented.
- Summary: occupancy is distinct active space IDs / total spaces; revenue is confirmed, verified booking amounts; pending value is active pending/review amounts; refunds sum `REFUND_PENDING`. Pending evidence is not proof of received money.

### Backend responsibilities still outstanding

Authenticated organiser authorisation; durable database transactions; cross-client unique active reservations; server-owned expiry scheduling; object storage and scanning for receipts; immutable evidence retention; real gateway/webhook verification; refund reconciliation; server-calculated summary and realtime updates. The current localStorage gate and browser mutations are demo conveniences and cannot enforce those guarantees.

Local receipt uploads accept PNG/JPEG/WebP up to 1 MB. Production should exchange file tokens/signed URLs rather than embed base64 images in booking payloads. Browser storage capacity can be exceeded; backend persistence is needed for durable operation. Server-rendered event selection/SEO should replace the client catalog bootstrap in production.

## Validation

`npm test` runs the real TypeScript services with isolated in-memory browser storage, using Node 24's module hooks. Coverage includes event isolation, event creation/editing and booking, validation, payment review/refunds, late-payment conflicts and combined filters. `npx tsc --noEmit` and `npm run build` validate types and the production build. Browser checks covered demo sign-in, second-event selection, search, detail and event-form saving, including the narrow viewport layout.
