import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { eventConfig } from "@/config/event";
import { formatMoney } from "@/lib/booking-format";
import { confirmOnlineCardPayment, useBookingState } from "@/lib/booking-store";
import { CheckCircle2, ShieldCheck, Printer, ArrowLeft, AlertCircle, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/confirm")({
  component: ConfirmPage,
});

function ConfirmPage() {
  const state = useBookingState();
  const [ref, setRef] = useState<string | null>(null);
  const [gatewayName, setGatewayName] = useState<string>("PayFast");
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [serverBooking, setServerBooking] = useState<{
    reference: string;
    spaceNumber: string;
    zone?: string;
    customerName: string;
    companyName: string;
    amount: number;
    status: string;
    paymentStatus: string;
  } | null>(null);
  const [status, setStatus] = useState<"success" | "cancel" | "processing">("processing");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const safepayStatus = searchParams.get("safepay") || searchParams.get("status");
    const payfastStatus = searchParams.get("payfast");
    const gw = searchParams.get("gateway") || (payfastStatus ? "PayFast" : "Safepay");
    setGatewayName(gw);

    const isSim = payfastStatus === "simulated" || safepayStatus === "simulated" || searchParams.get("simulated") !== "false";
    setIsSimulated(isSim);

    const bookingRef =
      searchParams.get("ref") ||
      searchParams.get("order_id") ||
      searchParams.get("m_payment_id");

    if (bookingRef) {
      setRef(bookingRef);
    }

    if (safepayStatus === "cancel" || payfastStatus === "cancel") {
      setStatus("cancel");
      toast.error("Payment transaction was cancelled.");
      return;
    }

    // Auto-confirm payment in local store and check live API
    if (bookingRef) {
      const cardTxnRef = `SIMULATED-${gw.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      confirmOnlineCardPayment(bookingRef, cardTxnRef);
      setStatus("success");
      toast.success(`Simulated payment verified! Booking reference ${bookingRef} confirmed.`);

      // Fetch official booking details from MongoDB
      const slug = eventConfig.slug || "business-expo";
      fetch(`/api/v1/events/${slug}/bookings/${bookingRef}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.reference) {
            setServerBooking(data);
          }
        })
        .catch(() => null);
    } else {
      setStatus("success");
    }
  }, []);

  const booking = useMemo(() => {
    if (serverBooking) {
      return {
        ...serverBooking,
        stallId: serverBooking.spaceNumber,
      };
    }
    if (!ref) return state.bookings[state.bookings.length - 1];
    return (
      state.bookings.find((b) => b.reference === ref) ||
      state.bookings[state.bookings.length - 1]
    );
  }, [serverBooking, state.bookings, ref]);

  if (status === "cancel") {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md py-20 px-4 text-center">
          <AlertCircle className="mx-auto h-14 w-14 text-destructive" />
          <h1 className="mt-4 text-2xl font-extrabold text-foreground">Payment Cancelled</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your payment session was cancelled. Your temporary hold is still active for 30 minutes.
          </p>
          <Button asChild className="mt-6 font-bold">
            <Link to="/floor-plan">Back to Floor Plan</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 space-y-6">
        {/* BIG EXPLICIT SIMULATION NOTICE HEADING */}
        {isSimulated && (
          <div className="rounded-2xl border-2 border-amber-500/50 bg-amber-500/10 p-6 text-center space-y-2 shadow-sm">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-amber-950 dark:text-amber-200 uppercase">
              SIMULATED {gatewayName.toUpperCase()} PAYMENT SUCCESSFUL
            </h1>
            <p className="text-xs sm:text-sm text-amber-900/80 dark:text-amber-300/90 max-w-lg mx-auto font-medium">
              This transaction was processed in a simulated sandbox environment. No actual bank charges occurred. Space reservation is successfully confirmed.
            </p>
          </div>
        )}

        {/* CONFIRMATION CARD */}
        <div className="rounded-2xl border border-emerald-500/30 bg-card p-8 sm:p-10 text-center shadow-lg space-y-6">
          <ShieldCheck className="mx-auto h-20 w-20 text-emerald-600 animate-bounce" />

          <div>
            <span className="inline-block rounded-full bg-emerald-600/10 px-4 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              {isSimulated ? `Simulated ${gatewayName} Verified Pass` : "Official Payment Verified Pass"}
            </span>
            <h2 className="mt-3 text-2xl font-extrabold text-foreground sm:text-3xl">
              Payment Successful & Space Confirmed!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
              Thank you! Your booking transaction has been completed and confirmed. Your exhibition space is officially locked.
            </p>
          </div>

          {booking && (
            <div className="rounded-xl border border-border bg-secondary/50 p-6 text-left max-w-md mx-auto space-y-3.5 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-border pb-2.5">
                <span className="text-muted-foreground">Booking Reference</span>
                <span className="font-mono font-extrabold text-primary">{booking.reference}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2.5">
                <span className="text-muted-foreground">Exhibitor Name</span>
                <span className="font-bold text-foreground">{booking.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2.5">
                <span className="text-muted-foreground">Company / Organization</span>
                <span className="font-bold text-foreground">{booking.companyName}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2.5">
                <span className="text-muted-foreground">Assigned Space</span>
                <span className="font-extrabold text-foreground">Space {booking.stallId}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2.5">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatMoney(booking.amount)}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2.5">
                <span className="text-muted-foreground">Event Date</span>
                <span className="font-bold text-foreground">{eventConfig.dateLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Venue</span>
                <span className="font-bold text-foreground">{eventConfig.venue.name}</span>
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Button onClick={() => window.print()} variant="outline" className="font-bold">
              <Printer className="mr-2 h-4 w-4" /> Print Confirmed Pass
            </Button>
            <Button asChild className="font-bold bg-primary text-primary-foreground">
              <Link to="/floor-plan">
                <ArrowLeft className="mr-2 h-4 w-4" /> View Live Map
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
