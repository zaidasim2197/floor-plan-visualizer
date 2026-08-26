import { cn } from "@/lib/utils";
import { statusLabel, type StallStatus } from "@/lib/booking-types";
import { statusTone } from "@/lib/booking-format";

export function StatusBadge({ status, className }: { status: StallStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap",
        statusTone[status],
        className,
      )}
    >
      {statusLabel[status]}
    </span>
  );
}
