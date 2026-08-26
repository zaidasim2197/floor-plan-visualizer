import { eventConfig } from "@/config/event";
import type { StallStatus } from "@/lib/booking-types";

export const formatMoney = (amount: number) =>
  `${eventConfig.currency} ${amount.toLocaleString("en-PK")}`;

export const formatDateTime = (ts?: number) =>
  ts
    ? new Date(ts).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const formatCountdown = (ms: number) => {
  if (ms <= 0) return "00:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const statusTone: Record<StallStatus, string> = {
  AVAILABLE: "border-border bg-surface-2 text-muted-foreground",
  PAYMENT_PENDING: "border-warning/35 bg-warning/15 text-warning-foreground",
  PAYMENT_REVIEW: "border-info/35 bg-info/12 text-info",
  CONFIRMED: "border-success/35 bg-success/12 text-success",
  EXPIRED: "border-border bg-muted text-muted-foreground",
  CANCELLED: "border-border bg-muted text-muted-foreground",
  CONFLICT: "border-destructive/40 bg-destructive/10 text-destructive",
};
