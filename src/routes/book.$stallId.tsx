import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { eventConfig, whatsappLink } from "@/config/event";
import { getStall } from "@/data/floor-plan";
import { formatMoney } from "@/lib/booking-format";
import {
  createBooking,
  submitPaymentEvidence,
  useBookingState,
  activeBookingForStall,
  sweepExpired,
} from "@/lib/booking-store";
import type { Booking } from "@/lib/booking-types";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Send,
  ShieldCheck,
  Building,
  CreditCard,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/book/$stallId")({
  component: BookStallPage,
});

function BookStallPage() {
  const { stallId } = Route.useParams();
  const navigate = useNavigate();
  const state = useBookingState();

  const stall = useMemo(() => getStall(stallId), [stallId]);
  const activeBooking = useMemo(
    () => (stall ? activeBookingForStall(state.bookings, stall.id) : undefined),
    [state.bookings, stall],
  );

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [productService, setProductService] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState(false);

  // Flow State
  const [activeRef, setActiveRef] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentRefInput, setPaymentRefInput] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Live Hold Timer for Pending Booking
  const currentBooking = useMemo(() => {
    if (activeRef) return state.bookings.find((b) => b.reference === activeRef);
    return activeBooking;
  }, [state.bookings, activeRef, activeBooking]);

  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (!currentBooking || currentBooking.status !== "PAYMENT_PENDING") return;

    const calc = () => {
      const remaining = Math.max(0, Math.floor((currentBooking.expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        sweepExpired();
      }
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [currentBooking]);

  if (!stall) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md py-20 px-4 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-xl font-bold">Space Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">The space ID "{stallId}" does not exist in the floor plan.</p>
          <Button asChild className="mt-6 font-bold">
            <Link to="/floor-plan">Back to Floor Plan</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!terms) {
      setError("Please accept the Terms & Conditions to proceed.");
      return;
    }

    setSubmitting(true);
    const result = createBooking(stall.id, {
      customerName,
      companyName,
      email,
      phone,
      productService,
      notes,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }

    setActiveRef(result.data.reference);
    toast.success(`Temporary hold activated! Reference: ${result.data.reference}`);
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBooking) return;
    setSubmittingPayment(true);

    const dummyRef = paymentRefInput.trim() || `TRX-${Math.floor(100000 + Math.random() * 900000)}`;
    const res = submitPaymentEvidence(currentBooking.reference, dummyRef);
    setSubmittingPayment(false);

    if (res.ok) {
      toast.success("Payment submitted for review!");
    } else {
      toast.error(res.error);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <SiteLayout>
      {/* TOP HEADER */}
      <section className="border-b border-border bg-surface py-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <Link
            to="/floor-plan"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Floor Plan
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow text-primary">{stall.zone}</p>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
                Exhibition Space Booking — {stall.stallNumber}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-muted-foreground">Price:</span>
              <span className="text-xl font-extrabold text-foreground">{formatMoney(stall.price)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN STEP WORKFLOW */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        {currentBooking ? (
          /* STEP 2: PAYMENT & HOLD STATUS VIEW */
          <div className="mx-auto max-w-3xl space-y-8">
            {/* STATUS BANNER */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">Booking Reference</span>
                  <p className="text-2xl font-extrabold tracking-tight text-foreground">{currentBooking.reference}</p>
                </div>
                <StatusBadge status={currentBooking.status} />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div>
                  <span className="text-xs text-muted-foreground">Space</span>
                  <p className="font-bold text-foreground">{currentBooking.stallId}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Company</span>
                  <p className="font-bold text-foreground truncate">{currentBooking.companyName}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Amount</span>
                  <p className="font-bold text-foreground">{formatMoney(currentBooking.amount)}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Payment Status</span>
                  <p className="font-bold text-primary">{currentBooking.paymentStatus}</p>
                </div>
              </div>

              {/* TIMER IF PENDING */}
              {currentBooking.status === "PAYMENT_PENDING" && (
                <div className="mt-6 rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-amber-600 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase">Temporary Hold Expiration</p>
                      <p className="text-xs text-amber-800 dark:text-amber-400">Complete payment before timer expires to retain space.</p>
                    </div>
                  </div>
                  <span className="text-2xl font-extrabold text-amber-900 dark:text-amber-200 tracking-mono">
                    {formatTimer(secondsLeft)}
                  </span>
                </div>
              )}
            </div>

            {/* PAYMENT INSTRUCTIONS & ACTION */}
            {currentBooking.status === "PAYMENT_PENDING" && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Payment Instructions</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Please transfer the total booking fee of <strong>{formatMoney(currentBooking.amount)}</strong> to the official event account below.
                  </p>
                </div>

                <div className="rounded-lg bg-secondary p-4 space-y-2 text-sm font-mono border border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank Name:</span>
                    <span className="font-bold text-foreground">Habib Bank Limited (HBL)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Title:</span>
                    <span className="font-bold text-foreground">Marriott Trade & Exhibitions Ltd</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IBAN / Account #:</span>
                    <span className="font-bold text-foreground">PK36 HABB 0001 2345 6789 0102</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference Code:</span>
                    <span className="font-bold text-primary">{currentBooking.reference}</span>
                  </div>
                </div>

                {/* WHATSAPP SUBMISSION */}
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-emerald-600" />
                    <h4 className="text-sm font-bold text-foreground">Option 1: Send Receipt via WhatsApp</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Take a screenshot of your bank transfer receipt and send it directly to our administration team on WhatsApp for fast verification.
                  </p>
                  <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold">
                    <a
                      href={whatsappLink(
                        eventConfig.contact.whatsapp[0],
                        `Payment Receipt Submission:\nBooking ID: ${currentBooking.reference}\nSpace: ${currentBooking.stallId}\nCompany: ${currentBooking.companyName}\nAmount: PKR ${currentBooking.amount.toLocaleString()}`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Send className="mr-2 h-4 w-4" /> Send Receipt via WhatsApp
                    </a>
                  </Button>
                </div>

                {/* TEST SIMULATION FORM */}
                <div className="rounded-lg border border-border p-5 space-y-3 bg-background">
                  <h4 className="text-sm font-bold text-foreground">Option 2: Simulate Payment (Demo Action)</h4>
                  <p className="text-xs text-muted-foreground">
                    Submit payment evidence directly inside the application to move status to <strong>PAYMENT_REVIEW</strong>.
                  </p>
                  <form onSubmit={handleSimulatePayment} className="flex gap-2">
                    <Input
                      placeholder="Transaction Reference (e.g. TRX-992140)"
                      value={paymentRefInput}
                      onChange={(e) => setPaymentRefInput(e.target.value)}
                    />
                    <Button type="submit" className="font-bold shrink-0" disabled={submittingPayment}>
                      Simulate Payment
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* PAYMENT REVIEW / CONFIRMED MESSAGES */}
            {currentBooking.status === "PAYMENT_REVIEW" && (
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-6 text-center space-y-3">
                <CheckCircle2 className="mx-auto h-12 w-12 text-blue-600" />
                <h3 className="text-lg font-bold text-foreground">Payment Received & Under Review</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Thank you! Your payment reference <strong>{currentBooking.paymentReference}</strong> has been received. Your temporary hold is protected while our administration team verifies the transfer.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/floor-plan">Return to Floor Plan</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/admin">Open Admin Panel to Approve</Link>
                  </Button>
                </div>
              </div>
            )}

            {currentBooking.status === "CONFIRMED" && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center space-y-3">
                <ShieldCheck className="mx-auto h-12 w-12 text-emerald-600" />
                <h3 className="text-lg font-bold text-foreground">Booking Permanently Confirmed!</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Your exhibition space <strong>{currentBooking.stallId}</strong> is fully confirmed. An official confirmation email has been logged to your address <strong>{currentBooking.email}</strong>.
                </p>
                <div className="pt-4">
                  <Button asChild size="sm">
                    <Link to="/floor-plan">View Confirmed Space on Map</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STEP 1: FORM FILLING VIEW */
          <div className="grid gap-12 lg:grid-cols-12">
            {/* LEFT DETAILS */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
                <h2 className="text-lg font-bold text-foreground border-b border-border pb-3">
                  Selected Space Summary
                </h2>

                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Space Number</dt>
                    <dd className="font-extrabold text-foreground">{stall.stallNumber}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="font-semibold text-foreground">{stall.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Dimensions</dt>
                    <dd className="font-semibold text-foreground">{stall.size}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Zone</dt>
                    <dd className="font-semibold text-foreground">{stall.zone}</dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3">
                    <dt className="font-bold text-foreground">Total Rental Fee</dt>
                    <dd className="text-xl font-extrabold text-primary">{formatMoney(stall.price)}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Hold Protection Notice
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Submitting this form immediately reserves space <strong>{stall.stallNumber}</strong> for {eventConfig.booking.paymentPendingMinutes} minutes. No other user can book this space while your hold is active.
                </p>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="lg:col-span-7">
              <div className="rounded-xl border border-border bg-card p-8 shadow-xs">
                <h2 className="text-2xl font-extrabold text-foreground">Complete Exhibitor Booking Form</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Provide your organization details to initialize your temporary reservation.
                </p>

                {error && (
                  <div className="mt-6 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-xs font-semibold text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="mt-6 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Full Name *</Label>
                      <Input
                        id="customerName"
                        required
                        placeholder="e.g. Hammad Sheikh"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company / Organization *</Label>
                      <Input
                        id="companyName"
                        required
                        placeholder="e.g. Apex Industrial Solutions"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Work Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="hammad@apex.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone / WhatsApp *</Label>
                      <Input
                        id="phone"
                        required
                        placeholder="+92 300 1234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productService">Product / Industry Category *</Label>
                    <Input
                      id="productService"
                      required
                      placeholder="e.g. Industrial Automation, Renewable Energy, Textiles"
                      value={productService}
                      onChange={(e) => setProductService(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Requirements / Notes</Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      placeholder="e.g. Power outlet requirements, extra table request..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex items-start space-x-3 pt-2">
                    <Checkbox
                      id="terms"
                      checked={terms}
                      onCheckedChange={(checked) => setTerms(Boolean(checked))}
                    />
                    <Label htmlFor="terms" className="text-xs leading-normal text-muted-foreground">
                      I agree to the Exhibition Terms & Conditions and understand that space hold is valid for {eventConfig.booking.paymentPendingMinutes} minutes pending payment confirmation.
                    </Label>
                  </div>

                  <Button type="submit" className="w-full h-11 font-bold text-sm" disabled={submitting}>
                    {submitting ? "Reserving Space..." : `Submit Request & Reserve Space (${stall.stallNumber})`}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
