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
  confirmOnlineCardPayment,
  useBookingState,
  activeBookingForStall,
  sweepExpired,
} from "@/lib/booking-store";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Send,
  ShieldCheck,
  Building2,
  CreditCard,
  AlertCircle,
  Lock,
  Printer,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/book/$stallId")({
  component: BookStallPage,
});

type PaymentMethod = "CARD" | "BANK";

export function BookStallPage() {
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");

  // Card Checkout Mode ("PAYFAST" vs "SIMULATED")
  const [cardMode, setCardMode] = useState<"PAYFAST" | "SIMULATED">("PAYFAST");

  // Simulated Card Payment State
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [processingCard, setProcessingCard] = useState(false);

  // Flow State
  const [activeRef, setActiveRef] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentRefInput, setPaymentRefInput] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Active booking calculation
  const currentBooking = useMemo(() => {
    if (activeRef) return state.bookings.find((b) => b.reference === activeRef);
    return activeBooking;
  }, [state.bookings, activeRef, activeBooking]);

  // Live Hold Timer (30 minutes)
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

  // Handle PayFast Sandbox Redirect Return Query Params
  useEffect(() => {
    if (typeof window === "undefined" || !stall) return;
    const searchParams = new URLSearchParams(window.location.search);
    const payfastStatus = searchParams.get("payfast");
    const ref = searchParams.get("ref") || activeRef;

    if (payfastStatus === "success" && ref) {
      const cardTxnRef = `PAYFAST-${Math.floor(100000 + Math.random() * 900000)}`;
      const res = confirmOnlineCardPayment(ref, cardTxnRef);
      if (res.ok) {
        toast.success(`PayFast Payment Successful! Space ${stall.stallNumber} is confirmed.`);
        setActiveRef(ref);
      }
      window.history.replaceState({}, "", window.location.pathname);
    } else if (payfastStatus === "cancel") {
      toast.error("PayFast payment transaction was cancelled.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [stall, activeRef]);

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

  // Handle Form Submission -> Activates 30-min Hold
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
    setCardName(customerName);
    toast.success(`Temporary hold activated! Reference: ${result.data.reference}`);
  };

  // PayFast Sandbox POST Redirect Handler
  const handlePayFastRedirect = () => {
    if (!currentBooking) return;

    const returnUrl = `${window.location.origin}/book/${stall.id}?payfast=success&ref=${currentBooking.reference}`;
    const cancelUrl = `${window.location.origin}/book/${stall.id}?payfast=cancel&ref=${currentBooking.reference}`;
    const notifyUrl = `${window.location.origin}/book/${stall.id}?payfast=notify&ref=${currentBooking.reference}`;

    const payload: Record<string, string> = {
      merchant_id: eventConfig.payfast.merchantId,
      merchant_key: eventConfig.payfast.merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      name_first: currentBooking.customerName,
      email_address: currentBooking.email,
      m_payment_id: currentBooking.reference,
      amount: currentBooking.amount.toFixed(2),
      item_name: `Marriott Expo Space Booking - Space ${currentBooking.stallId}`,
      item_description: `Exhibition Space Rental for Marriott Exhibition & Trade Expo 2027 (${currentBooking.companyName})`,
    };

    toast.loading("Redirecting to PayFast Payment Gateway...");

    const form = document.createElement("form");
    form.method = "POST";
    form.action = eventConfig.payfast.sandboxUrl;

    Object.entries(payload).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  // Quick fill demo test card
  const handleFillDemoCard = () => {
    setCardName(customerName || "Hammad Sheikh");
    setCardNumber("4532 •••• •••• 8910");
    setCardExpiry("08/28");
    setCardCvc("842");
    toast.info("Demo card details auto-filled for testing.");
  };

  // Handle Simulated Card Payment Submit
  const handleSimulateCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBooking) return;

    if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
      toast.error("Please enter complete card details.");
      return;
    }

    setProcessingCard(true);

    setTimeout(() => {
      const cardTxnRef = `CARD-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      const result = confirmOnlineCardPayment(currentBooking.reference, cardTxnRef);
      setProcessingCard(false);

      if (result.ok) {
        toast.success("Payment Successful! Your stall booking is confirmed.");
      } else {
        toast.error(result.error);
      }
    }, 1500);
  };

  // Handle Bank Reference Submission
  const handleSimulateBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBooking) return;
    setSubmittingPayment(true);

    const dummyRef = paymentRefInput.trim() || `HBL-TRX-${Math.floor(100000 + Math.random() * 900000)}`;
    const res = submitPaymentEvidence(currentBooking.reference, dummyRef);
    setSubmittingPayment(false);

    if (res.ok) {
      toast.success("Payment evidence submitted for review!");
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
                Exhibition Space Booking — Space {stall.stallNumber}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-muted-foreground">Price:</span>
              <span className="text-xl font-extrabold text-foreground">{formatMoney(stall.price)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN WORKFLOW */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        {currentBooking ? (
          <div className="mx-auto max-w-3xl space-y-8">
            {/* STEP SUMMARY & HOLD BADGE */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">Booking Reference</span>
                  <p className="text-2xl font-extrabold tracking-tight text-foreground">{currentBooking.reference}</p>
                </div>
                <StatusBadge status={currentBooking.status} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 text-xs sm:text-sm sm:grid-cols-4">
                <div>
                  <span className="text-muted-foreground text-[11px] block">Space</span>
                  <p className="font-bold text-foreground">{currentBooking.stallId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px] block">Organization</span>
                  <p className="font-bold text-foreground truncate">{currentBooking.companyName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px] block">Total Amount</span>
                  <p className="font-bold text-foreground">{formatMoney(currentBooking.amount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px] block">Payment Method</span>
                  <p className="font-bold text-primary">
                    {paymentMethod === "CARD" ? "PayFast Card Gateway" : "Bank Transfer"}
                  </p>
                </div>
              </div>

              {/* LIVE HOLD TIMER BANNER */}
              {currentBooking.status === "PAYMENT_PENDING" && (
                <div className="mt-6 rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-amber-600 animate-pulse shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase">
                        30-Minute Temporary Hold Active
                      </p>
                      <p className="text-xs text-amber-800 dark:text-amber-400">
                        Space {stall.stallNumber} is locked for your session. Complete payment before expiration.
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-extrabold text-amber-900 dark:text-amber-200 tracking-mono font-mono">
                    {formatTimer(secondsLeft)}
                  </span>
                </div>
              )}
            </div>

            {/* IF PAYMENT IS PENDING AND METHOD IS CARD */}
            {currentBooking.status === "PAYMENT_PENDING" && paymentMethod === "CARD" && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-bold text-foreground">PayFast Credit / Debit Card Gateway</h2>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                      Pay online securely via PayFast Sandbox Gateway or test via simulated checkout.
                    </p>
                  </div>

                  {/* CARD MODE SWITCHER */}
                  <div className="flex rounded-md border border-border bg-secondary p-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setCardMode("PAYFAST")}
                      className={
                        "rounded px-3 py-1.5 transition-all " +
                        (cardMode === "PAYFAST"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground")
                      }
                    >
                      PayFast Sandbox
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardMode("SIMULATED")}
                      className={
                        "rounded px-3 py-1.5 transition-all " +
                        (cardMode === "SIMULATED"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground")
                      }
                    >
                      Direct Card Form
                    </button>
                  </div>
                </div>

                {cardMode === "PAYFAST" ? (
                  /* PAYFAST SANDBOX GATEWAY SECTION */
                  <div className="space-y-5 pt-2">
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-emerald-600" />
                          <h3 className="text-sm font-bold text-foreground">PayFast Official Sandbox Integration</h3>
                        </div>
                        <span className="rounded-md bg-emerald-600/20 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                          Merchant ID: {eventConfig.payfast.merchantId}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Clicking below will securely POST your booking reference (<strong>{currentBooking.reference}</strong>) and rental amount (<strong>{formatMoney(currentBooking.amount)}</strong>) to the official PayFast Sandbox Gateway environment.
                      </p>
                    </div>

                    <Button
                      onClick={handlePayFastRedirect}
                      className="w-full h-13 text-base font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                    >
                      <Lock className="mr-2 h-5 w-5" /> Pay {formatMoney(currentBooking.amount)} via PayFast Gateway <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  /* DIRECT SIMULATED CARD FORM */
                  <div className="space-y-4 pt-2">
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4 text-xs text-blue-900 dark:text-blue-200 leading-relaxed flex items-start gap-3">
                      <Lock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-blue-950 dark:text-blue-100 uppercase tracking-wide">
                          DIRECT SIMULATED CHECKOUT MODE
                        </p>
                        No real credit card will be charged. Test card payment directly on this page.
                      </div>
                    </div>

                    <form onSubmit={handleSimulateCardSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="cardName">Cardholder Name</Label>
                          <button
                            type="button"
                            onClick={handleFillDemoCard}
                            className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <Sparkles className="h-3 w-3" /> Auto-Fill Demo Card
                          </button>
                        </div>
                        <Input
                          id="cardName"
                          required
                          placeholder="e.g. Hammad Sheikh"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          required
                          placeholder="4532 •••• •••• 8910"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardExpiry">Expiry Date (MM/YY)</Label>
                          <Input
                            id="cardExpiry"
                            required
                            placeholder="08/28"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardCvc">CVV / CVC</Label>
                          <Input
                            id="cardCvc"
                            type="password"
                            maxLength={4}
                            required
                            placeholder="842"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 text-sm font-extrabold bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
                        disabled={processingCard}
                      >
                        {processingCard ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" /> Processing Payment Gateway...
                          </span>
                        ) : (
                          `Pay ${formatMoney(currentBooking.amount)} & Confirm Space ${stall.stallNumber}`
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* IF PAYMENT IS PENDING AND METHOD IS BANK */}
            {currentBooking.status === "PAYMENT_PENDING" && paymentMethod === "BANK" && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Direct Bank Deposit / Transfer Instructions</h2>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    Transfer <strong>{formatMoney(currentBooking.amount)}</strong> to our official bank account within 30 minutes to confirm your space.
                  </p>
                </div>

                {/* BANK ACCOUNT DETAILS CARD */}
                <div className="rounded-lg bg-secondary p-4 space-y-2.5 text-xs sm:text-sm font-mono border border-border">
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Bank Name:</span>
                    <span className="font-bold text-foreground">Habib Bank Limited (HBL)</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Account Title:</span>
                    <span className="font-bold text-foreground">Marriott Trade & Exhibitions Ltd</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">IBAN Number:</span>
                    <span className="font-bold text-foreground">PK36 HABB 0001 2345 6789 0102</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Branch / SWIFT:</span>
                    <span className="font-bold text-foreground">HABBPKKA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking Reference:</span>
                    <span className="font-bold text-primary">{currentBooking.reference}</span>
                  </div>
                </div>

                {/* WHATSAPP RECEIPT SUBMISSION */}
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-emerald-600" />
                    <h4 className="text-sm font-bold text-foreground">Send Receipt Screenshot via WhatsApp</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    After making the bank transfer, send your receipt screenshot directly to our organizing team on WhatsApp for fast verification.
                  </p>
                  <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold h-11">
                    <a
                      href={whatsappLink(
                        eventConfig.contact.whatsapp[0],
                        `Bank Transfer Receipt:\nBooking ID: ${currentBooking.reference}\nSpace: ${currentBooking.stallId}\nCompany: ${currentBooking.companyName}\nAmount: PKR ${currentBooking.amount.toLocaleString()}`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Send className="mr-2 h-4 w-4" /> Send Receipt on WhatsApp
                    </a>
                  </Button>
                </div>

                {/* MANUAL TRANSACTION REFERENCE FORM */}
                <div className="rounded-lg border border-border p-5 space-y-3 bg-background">
                  <h4 className="text-sm font-bold text-foreground">Submit Bank Reference Number</h4>
                  <p className="text-xs text-muted-foreground">
                    Or enter your bank transfer transaction reference number below to place your booking under <strong>PAYMENT_REVIEW</strong>.
                  </p>
                  <form onSubmit={handleSimulateBankSubmit} className="flex gap-2">
                    <Input
                      placeholder="e.g. HBL-TRX-891042"
                      value={paymentRefInput}
                      onChange={(e) => setPaymentRefInput(e.target.value)}
                    />
                    <Button type="submit" className="font-bold shrink-0" disabled={submittingPayment}>
                      Submit Reference
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* PAYMENT UNDER REVIEW VIEW */}
            {currentBooking.status === "PAYMENT_REVIEW" && (
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-8 text-center space-y-4">
                <CheckCircle2 className="mx-auto h-14 w-14 text-blue-600" />
                <h2 className="text-xl font-bold text-foreground">Payment Received & Under Review</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Thank you! Your payment reference <strong>{currentBooking.paymentReference}</strong> has been submitted. Your temporary hold is protected while our management team verifies the transfer.
                </p>
                <div className="pt-4 flex flex-wrap justify-center gap-3">
                  <Button asChild variant="outline">
                    <Link to="/floor-plan">Return to Floor Plan</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/admin">Open Admin Panel to Approve</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* PAYMENT SUCCESSFUL & CONFIRMED VIEW */}
            {currentBooking.status === "CONFIRMED" && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-5">
                <ShieldCheck className="mx-auto h-16 w-16 text-emerald-600 animate-bounce" />
                <div>
                  <span className="inline-block rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    Official Confirmation
                  </span>
                  <h2 className="mt-2 text-2xl font-extrabold text-foreground sm:text-3xl">
                    Payment Successful & Space Confirmed!
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
                    Congratulations! Exhibition Space <strong>{currentBooking.stallId}</strong> is officially booked for <strong>{currentBooking.companyName}</strong> at {eventConfig.name}.
                  </p>
                </div>

                {/* DIGITAL EXHIBITOR PASS / RECEIPT CARD */}
                <div className="rounded-lg border border-border bg-card p-5 text-left max-w-md mx-auto space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Booking ID</span>
                    <span className="font-mono font-bold text-primary">{currentBooking.reference}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Exhibitor</span>
                    <span className="font-bold text-foreground">{currentBooking.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Organization</span>
                    <span className="font-bold text-foreground">{currentBooking.companyName}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Space Assigned</span>
                    <span className="font-bold text-foreground">Space {currentBooking.stallId}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Event Date</span>
                    <span className="font-bold text-foreground">{eventConfig.dateLabel}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Venue</span>
                    <span className="font-bold text-foreground">{eventConfig.venue.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Reference</span>
                    <span className="font-mono font-bold text-foreground">{currentBooking.paymentReference || "ONLINE-CARD"}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="font-bold border-border"
                  >
                    <Printer className="mr-2 h-4 w-4" /> Print / Download Confirmed Pass
                  </Button>
                  <Button asChild className="font-bold bg-primary text-primary-foreground">
                    <Link to="/floor-plan">View Confirmed Space on Live Map</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* EXPIRED VIEW */}
            {currentBooking.status === "EXPIRED" && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-4">
                <AlertCircle className="mx-auto h-14 w-14 text-destructive" />
                <h2 className="text-xl font-bold text-foreground">Reservation Expired</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Your 30-minute temporary hold for space <strong>{currentBooking.stallId}</strong> has expired. The space has been released back to the floor plan for other exhibitors.
                </p>
                <div className="pt-4">
                  <Button asChild className="font-bold">
                    <Link to="/floor-plan">Re-select Available Space</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STEP 1: EXHIBITOR FORM & PAYMENT SELECTION */
          <div className="grid gap-10 lg:grid-cols-12">
            {/* LEFT SUMMARY */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
                <h2 className="text-base font-bold text-foreground border-b border-border pb-3">
                  Space Selection Summary
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
                    <dt className="text-muted-foreground">Zone Location</dt>
                    <dd className="font-semibold text-foreground">{stall.zone}</dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3">
                    <dt className="font-bold text-foreground">Total Fee</dt>
                    <dd className="text-xl font-extrabold text-primary">{formatMoney(stall.price)}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Hold Protection Guarantee
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Submitting this form immediately reserves space <strong>{stall.stallNumber}</strong> for {eventConfig.booking.paymentPendingMinutes} minutes. Concurrent users are strictly blocked from double booking.
                </p>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="lg:col-span-7">
              <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs">
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">Exhibitor Registration & Booking</h2>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Provide your organization contact details and select your preferred payment method.
                </p>

                {error && (
                  <div className="mt-5 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-xs font-semibold text-destructive flex items-center gap-2">
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

                  {/* PAYMENT METHOD SELECTION TOGGLE */}
                  <div className="space-y-3 pt-2">
                    <Label className="text-sm font-bold text-foreground">Select Payment Method *</Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* OPTION 1: CARD */}
                      <label
                        onClick={() => setPaymentMethod("CARD")}
                        className={
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all " +
                          (paymentMethod === "CARD"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border bg-background hover:bg-secondary/50")
                        }
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === "CARD"}
                          onChange={() => setPaymentMethod("CARD")}
                          className="mt-0.5 accent-primary"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                            <CreditCard className="h-4 w-4 text-primary" /> PayFast Gateway
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                            Instant online payment via PayFast Sandbox Gateway
                          </p>
                        </div>
                      </label>

                      {/* OPTION 2: BANK */}
                      <label
                        onClick={() => setPaymentMethod("BANK")}
                        className={
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all " +
                          (paymentMethod === "BANK"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border bg-background hover:bg-secondary/50")
                        }
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === "BANK"}
                          onChange={() => setPaymentMethod("BANK")}
                          className="mt-0.5 accent-primary"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                            <Building2 className="h-4 w-4 text-primary" /> Direct Bank Transfer
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                            30-min hold + IBAN details & WhatsApp receipt submission
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Requirements / Notes</Label>
                    <Textarea
                      id="notes"
                      rows={2}
                      placeholder="e.g. Extra power outlet, customized fascia board text..."
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
                    <Label htmlFor="terms" className="text-xs leading-normal text-muted-foreground cursor-pointer">
                      I agree to the Exhibition Terms & Conditions and understand that space hold is valid for {eventConfig.booking.paymentPendingMinutes} minutes.
                    </Label>
                  </div>

                  <Button type="submit" className="w-full h-11 font-extrabold text-sm" disabled={submitting}>
                    {submitting
                      ? "Reserving Space..."
                      : paymentMethod === "CARD"
                        ? `Proceed to PayFast Card Gateway (${stall.stallNumber})`
                        : `Reserve Space (${stall.stallNumber}) & View Bank Details`}
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
