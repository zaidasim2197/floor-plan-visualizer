import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatCountdown, formatDateTime, formatMoney } from "@/lib/booking-format";
import {
  approveBooking,
  submitPaymentEvidence,
  releaseBooking,
  rejectPaymentEvidence,
  completeRefund,
  useBookingState,
} from "@/lib/booking-store";
import { paymentLabels, reservationLabel, summarizeBookings } from "@/lib/admin-data";
import { stalls } from "@/data/floor-plan";
import { eventConfig } from "@/config/event";
import type { Booking } from "@/lib/booking-types";

export function RevenueSummary({ bookings }: { bookings: Booking[] }) {
  const summary = summarizeBookings(bookings, stalls);
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      aria-label="Occupancy and revenue"
    >
      {[
        [
          "Occupancy",
          `${summary.occupancy}%`,
          `${summary.occupied} of ${stalls.length} spaces reserved`,
        ],
        ["Verified revenue", formatMoney(summary.revenue), "Verified payments, excluding refunds"],
        [
          "Awaiting payment / review",
          formatMoney(summary.pending),
          "Active reservations · not received revenue",
        ],
        [
          "Refunds to reconcile",
          formatMoney(summary.refunds),
          "Pending manual refund verification",
        ],
      ].map(([label, value, hint]) => (
        <div key={label} className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
          {label === "Occupancy" && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-primary" style={{ width: `${summary.occupancy}%` }} />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

export function BookingDetail({
  reference,
  onClose,
  booking: explicitBooking,
  audit: explicitAudit,
}: {
  reference: string;
  onClose: () => void;
  booking?: Booking | null;
  audit?: typeof state.audit;
}) {
  const state = useBookingState();
  const booking = explicitBooking ?? state.bookings.find((b) => b.reference === reference);
  const auditEntries = explicitAudit ?? state.audit;
  const [transaction, setTransaction] = useState("");
  const [proof, setProof] = useState<string>();
  const [reason, setReason] = useState("");
  const [cancel, setCancel] = useState(false);
  if (!booking) return null;
  const run = (result: { ok: boolean; error?: string }) =>
    result.ok ? toast.success("Booking updated.") : toast.error(result.error);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(submitPaymentEvidence(reference, transaction, proof));
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Booking detail · {eventConfig.name}
          </p>
          <DialogTitle>{booking.reference}</DialogTitle>
          <DialogDescription>
            {booking.companyName} · Space{" "}
            {stalls.find((s) => s.id === booking.stallId)?.stallNumber ?? booking.stallId}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-border bg-surface-2 p-4">
          <p className="font-semibold">{reservationLabel(booking.status)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {booking.status === "PAYMENT_PENDING"
              ? `Hold expires in ${formatCountdown(booking.expiresAt - Date.now())} · ${formatDateTime(booking.expiresAt)}`
              : booking.status === "PAYMENT_REVIEW"
                ? "Reservation protected while payment evidence is reviewed."
                : booking.status === "EXPIRED"
                  ? `Reservation expired ${formatDateTime(booking.expiresAt)}. The space is no longer held.`
                  : (booking.conflictReason ??
                    "See the activity timeline below for reservation changes.")}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          {[
            ["Customer", booking.customerName],
            ["Company", booking.companyName],
            ["Email", booking.email],
            ["Phone", booking.phone],
            ["Product / service", booking.productService || "—"],
            ["Booked amount", formatMoney(booking.amount)],
            ["Payment status", paymentLabels[booking.paymentStatus]],
            ["Transaction reference", booking.paymentReference || "Not supplied"],
            ["Created", formatDateTime(booking.createdAt)],
            ["Source", booking.source],
            ["Notes", booking.notes || "—"],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-1 break-words font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        {booking.paymentProofImage && (
          <a
            href={booking.paymentProofImage}
            target="_blank"
            rel="noreferrer"
            aria-label="Open payment receipt"
          >
            <img
              src={booking.paymentProofImage}
              alt={`Payment receipt for ${reference}`}
              className="max-h-64 w-full rounded-lg border border-border bg-secondary object-contain"
            />
          </a>
        )}
        {["PAYMENT_PENDING", "EXPIRED"].includes(booking.status) && (
          <form onSubmit={submit} className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold">Record manual payment evidence</h3>
            <Label htmlFor="proof-reference">Transaction reference</Label>
            <Input
              id="proof-reference"
              required
              value={transaction}
              onChange={(e) => setTransaction(e.target.value)}
            />
            <Label htmlFor="proof-upload">Receipt · PNG, JPEG or WebP · up to 1 MB</Label>
            <Input
              id="proof-upload"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={async (e) => {
                setProof(undefined);
                const file = e.target.files?.[0];
                if (!file) return;
                if (
                  file.size > 1000000 ||
                  !["image/png", "image/jpeg", "image/webp"].includes(file.type)
                ) {
                  toast.error("Choose a PNG, JPEG or WebP receipt up to 1 MB.");
                  e.target.value = "";
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => setProof(String(reader.result));
                reader.onerror = () => toast.error("Could not read the receipt.");
                reader.readAsDataURL(file);
              }}
            />
            <Button type="submit" variant="outline">
              Submit for review
            </Button>
          </form>
        )}
        {booking.status === "PAYMENT_REVIEW" && (
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Reason for requesting corrected evidence</Label>
            <Input
              id="rejection-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="For example: transaction amount does not match"
            />
            <Button
              variant="outline"
              disabled={reason.trim().length < 5}
              onClick={() => run(rejectPaymentEvidence(reference, reason))}
            >
              Request corrected evidence
            </Button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {["PAYMENT_PENDING", "PAYMENT_REVIEW", "CONFLICT"].includes(booking.status) && (
            <Button onClick={() => run(approveBooking(reference))}>Verify payment & confirm</Button>
          )}
          {["PAYMENT_PENDING", "PAYMENT_REVIEW", "CONFIRMED"].includes(booking.status) && (
            <Button
              variant="outline"
              onClick={() => {
                if (!cancel) {
                  setCancel(true);
                  return;
                }
                run(releaseBooking(reference, "CANCELLED"));
                setCancel(false);
              }}
            >
              {cancel ? "Confirm cancellation" : "Cancel reservation"}
            </Button>
          )}
          {booking.paymentStatus === "REFUND_PENDING" && (
            <>
              <Input
                aria-label="Refund transaction reference"
                className="sm:w-60"
                placeholder="Refund transaction reference"
                value={transaction}
                onChange={(e) => setTransaction(e.target.value)}
              />
              <Button
                disabled={!transaction.trim()}
                variant="outline"
                onClick={() => run(completeRefund(reference, transaction))}
              >
                Mark refund completed
              </Button>
            </>
          )}
        </div>
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold">Activity timeline</h3>
          <ol className="mt-3 space-y-4">
            {auditEntries
              .filter((a) => a.bookingRef === reference)
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((a) => (
                <li key={a.id} className="border-l-2 border-primary/20 pl-3">
                  <p className="text-sm">{a.details}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(a.createdAt)} · {a.actor} ·{" "}
                    {a.action.replaceAll("_", " ").toLowerCase()}
                  </p>
                </li>
              ))}
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
}
