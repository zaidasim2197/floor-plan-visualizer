import { Link } from "@tanstack/react-router";
import { ShieldCheck, RotateCcw, Clock, ExternalLink } from "lucide-react";
import { resetDemoData, sweepExpired, useBookingState } from "@/lib/booking-store";
import { toast } from "sonner";

export function DemoBanner() {
  const state = useBookingState();
  const activeHolds = state.bookings.filter((b) => b.status === "PAYMENT_PENDING").length;

  const handleSweep = () => {
    const changed = sweepExpired();
    if (changed) {
      toast.info("Expired unpaid reservations were returned to available status.");
    } else {
      toast.success("All reservation timers are up to date.");
    }
  };

  const handleReset = () => {
    if (confirm("Reset demo data back to clean seeded state?")) {
      resetDemoData();
      toast.success("Demo dataset reset successfully.");
    }
  };

  return (
    <div className="border-b border-border bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-900 dark:text-amber-200">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 sm:px-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Demo UI
          </span>
          {/* <span className="hidden sm:inline">
            Real-time floor map & state engine active. Active holds: <strong>{activeHolds}</strong>
          </span> */}
        </div>

        <div className="flex items-center gap-3">
          {/* <button
            type="button"
            onClick={handleSweep}
            className="inline-flex items-center gap-1 hover:underline focus:outline-none"
            title="Check and sweep expired temporary holds"
          >
            <Clock className="h-3 w-3" />
            Run Expiry Check
          </button>
          <span className="opacity-30">•</span>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 hover:underline focus:outline-none"
            title="Reset data back to seed state"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Seed Data
          </button> */}
          {/* <span className="opacity-30">•</span> */}
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 font-bold text-primary hover:underline focus:outline-none"
          >
            Admin Portal <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
