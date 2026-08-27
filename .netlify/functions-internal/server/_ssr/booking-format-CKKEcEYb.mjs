import { t as eventConfig } from "./event-2f2AwK3C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/booking-format-CKKEcEYb.js
var formatMoney = (amount) => `${eventConfig.currency} ${amount.toLocaleString("en-PK")}`;
var statusTone = {
	AVAILABLE: "border-border bg-surface-2 text-muted-foreground",
	PAYMENT_PENDING: "border-warning/35 bg-warning/15 text-warning-foreground",
	PAYMENT_REVIEW: "border-info/35 bg-info/12 text-info",
	CONFIRMED: "border-success/35 bg-success/12 text-success",
	EXPIRED: "border-border bg-muted text-muted-foreground",
	CANCELLED: "border-border bg-muted text-muted-foreground",
	CONFLICT: "border-destructive/40 bg-destructive/10 text-destructive"
};
//#endregion
export { statusTone as n, formatMoney as t };
