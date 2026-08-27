import { r as __toESM } from "../_runtime.mjs";
import { t as eventConfig } from "./event-2f2AwK3C.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime, u as Slot } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as ExternalLink, c as ShieldCheck, d as RotateCcw, g as Menu, t as X, w as Clock } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SiteLayout-CKYIau6i.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			"outline-dark": "border border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white shadow-sm font-bold",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var nav = [
	{
		to: "/",
		label: "Home"
	},
	{
		to: "/floor-plan",
		label: "Floor Plan"
	},
	{
		to: "/about",
		label: "About"
	},
	{
		to: "/attendees",
		label: "Attendees"
	},
	{
		to: "/contact",
		label: "Contact"
	}
];
function SiteHeader() {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex min-w-0 items-center gap-3",
					onClick: () => setOpen(false),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary text-sm font-extrabold text-primary-foreground",
						children: "ME"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-sm font-bold tracking-tight",
							children: eventConfig.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-[11px] text-muted-foreground",
							children: eventConfig.dateLabel
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "hidden items-center gap-1 lg:flex",
					children: nav.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: item.to,
						className: "rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
						activeProps: { className: "text-foreground bg-secondary" },
						activeOptions: { exact: item.to === "/" },
						children: item.label
					}, item.to))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						className: "hidden sm:inline-flex",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/floor-plan",
							children: "Book Your Space"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": open ? "Close menu" : "Open menu",
						"aria-expanded": open,
						onClick: () => setOpen((v) => !v),
						className: "inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border lg:hidden",
						children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-4 w-4" })
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("border-t border-border lg:hidden", open ? "block" : "hidden"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "mx-auto flex w-full max-w-7xl flex-col px-4 py-2 sm:px-6",
				children: [nav.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: item.to,
					onClick: () => setOpen(false),
					className: "rounded-sm px-2 py-3 text-sm font-medium text-muted-foreground",
					activeProps: { className: "text-foreground" },
					activeOptions: { exact: item.to === "/" },
					children: item.label
				}, item.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					className: "my-3 sm:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/floor-plan",
						onClick: () => setOpen(false),
						children: "Book Your Space"
					})
				})]
			})
		})]
	});
}
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "mt-20 border-t border-border bg-ink text-ink-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-bold tracking-tight",
							children: eventConfig.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-md text-sm opacity-70",
							children: eventConfig.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 text-sm opacity-70",
							children: [
								eventConfig.dateLabel,
								" · ",
								eventConfig.venue.name,
								", ",
								eventConfig.venue.city
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-bold uppercase tracking-[0.16em] opacity-60",
					children: "Explore"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "opacity-80 hover:opacity-100",
							children: "Home"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/floor-plan",
							className: "opacity-80 hover:opacity-100",
							children: "Floor Plan"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/about",
							className: "opacity-80 hover:opacity-100",
							children: "About"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/attendees",
							className: "opacity-80 hover:opacity-100",
							children: "Attendees"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/contact",
							className: "opacity-80 hover:opacity-100",
							children: "Contact"
						}) })
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-bold uppercase tracking-[0.16em] opacity-60",
					children: "Contact"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 space-y-2 text-sm opacity-80",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: eventConfig.contact.email }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: eventConfig.contact.phone }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: eventConfig.venue.address })
					]
				})] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-white/10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-7xl px-4 py-5 text-[11px] opacity-60 sm:px-6",
				children: [
					"© ",
					(/* @__PURE__ */ new Date()).getFullYear(),
					" ",
					eventConfig.name,
					". Demo prototype — floor plan and bookings are illustrative."
				]
			})
		})]
	});
}
/**
* DEMO EXHIBITION LAYOUT — fictional layout inspired by professional venue maps.
* This is not the real Marriott floor plan. Replace this data file (and only this
* file) when the client supplies the official plan.
*/
var MAP_WIDTH = 1200;
var stalls = [
	{
		id: "A01",
		stallNumber: "A01",
		category: "Standard Exhibition Stall",
		size: "3m x 3m",
		price: 185e3,
		x: 120,
		y: 180,
		w: 90,
		h: 80,
		zone: "Zone A — West Hall"
	},
	{
		id: "A02",
		stallNumber: "A02",
		category: "Standard Exhibition Stall",
		size: "3m x 3m",
		price: 185e3,
		x: 214,
		y: 180,
		w: 90,
		h: 80,
		zone: "Zone A — West Hall"
	},
	{
		id: "A03",
		stallNumber: "A03",
		category: "Standard Exhibition Stall",
		size: "3m x 3m",
		price: 175e3,
		x: 120,
		y: 264,
		w: 90,
		h: 80,
		zone: "Zone A — West Hall"
	},
	{
		id: "A04",
		stallNumber: "A04",
		category: "Standard Exhibition Stall",
		size: "3m x 3m",
		price: 175e3,
		x: 214,
		y: 264,
		w: 90,
		h: 80,
		zone: "Zone A — West Hall"
	},
	{
		id: "A05",
		stallNumber: "A05",
		category: "Corner Stall",
		size: "3m x 4m",
		price: 225e3,
		x: 120,
		y: 348,
		w: 90,
		h: 80,
		zone: "Zone A — West Hall"
	},
	{
		id: "A06",
		stallNumber: "A06",
		category: "Corner Stall",
		size: "3m x 4m",
		price: 225e3,
		x: 214,
		y: 348,
		w: 90,
		h: 80,
		zone: "Zone A — West Hall"
	},
	{
		id: "B01",
		stallNumber: "B01",
		category: "Standard Exhibition Stall",
		size: "4m x 3m",
		price: 21e4,
		x: 380,
		y: 180,
		w: 110,
		h: 90,
		zone: "Zone B — Central Hall"
	},
	{
		id: "B02",
		stallNumber: "B02",
		category: "Standard Exhibition Stall",
		size: "4m x 3m",
		price: 21e4,
		x: 494,
		y: 180,
		w: 110,
		h: 90,
		zone: "Zone B — Central Hall"
	},
	{
		id: "B03",
		stallNumber: "B03",
		category: "Standard Exhibition Stall",
		size: "4m x 3m",
		price: 2e5,
		x: 380,
		y: 274,
		w: 110,
		h: 90,
		zone: "Zone B — Central Hall"
	},
	{
		id: "B04",
		stallNumber: "B04",
		category: "Standard Exhibition Stall",
		size: "4m x 3m",
		price: 2e5,
		x: 494,
		y: 274,
		w: 110,
		h: 90,
		zone: "Zone B — Central Hall"
	},
	{
		id: "B05",
		stallNumber: "B05",
		category: "Premium Island",
		size: "8m x 3m",
		price: 42e4,
		x: 380,
		y: 368,
		w: 224,
		h: 80,
		zone: "Zone B — Central Hall"
	},
	{
		id: "C01",
		stallNumber: "C01",
		category: "Standard Exhibition Stall",
		size: "4m x 3m",
		price: 205e3,
		x: 680,
		y: 180,
		w: 100,
		h: 90,
		zone: "Zone C — East Hall"
	},
	{
		id: "C02",
		stallNumber: "C02",
		category: "Standard Exhibition Stall",
		size: "4m x 3m",
		price: 205e3,
		x: 784,
		y: 180,
		w: 100,
		h: 90,
		zone: "Zone C — East Hall"
	},
	{
		id: "C03",
		stallNumber: "C03",
		category: "Standard Exhibition Stall",
		size: "4m x 3m",
		price: 195e3,
		x: 680,
		y: 274,
		w: 100,
		h: 90,
		zone: "Zone C — East Hall"
	},
	{
		id: "C04",
		stallNumber: "C04",
		category: "Standard Exhibition Stall",
		size: "4m x 3m",
		price: 195e3,
		x: 784,
		y: 274,
		w: 100,
		h: 90,
		zone: "Zone C — East Hall"
	},
	{
		id: "C05",
		stallNumber: "C05",
		category: "Premium Island",
		size: "8m x 3m",
		price: 41e4,
		x: 680,
		y: 368,
		w: 204,
		h: 80,
		zone: "Zone C — East Hall"
	},
	{
		id: "D01",
		stallNumber: "D01",
		category: "Compact Pod",
		size: "2m x 2m",
		price: 95e3,
		x: 960,
		y: 180,
		w: 110,
		h: 80,
		zone: "Zone D — Innovation Pods"
	},
	{
		id: "D02",
		stallNumber: "D02",
		category: "Compact Pod",
		size: "2m x 2m",
		price: 95e3,
		x: 960,
		y: 264,
		w: 110,
		h: 80,
		zone: "Zone D — Innovation Pods"
	},
	{
		id: "D03",
		stallNumber: "D03",
		category: "Compact Pod",
		size: "2m x 2m",
		price: 88e3,
		x: 960,
		y: 348,
		w: 110,
		h: 80,
		zone: "Zone D — Innovation Pods"
	},
	{
		id: "D04",
		stallNumber: "D04",
		category: "Compact Pod",
		size: "2m x 2m",
		price: 88e3,
		x: 960,
		y: 432,
		w: 110,
		h: 80,
		zone: "Zone D — Innovation Pods"
	}
];
var facilities = [
	{
		label: "Keynote Stage",
		sublabel: "Main presentation area",
		x: 120,
		y: 60,
		w: 484,
		h: 90,
		tone: "stage"
	},
	{
		label: "Networking Lounge",
		x: 680,
		y: 60,
		w: 204,
		h: 90,
		tone: "amenity"
	},
	{
		label: "Information Desk",
		x: 960,
		y: 60,
		w: 110,
		h: 90,
		tone: "service"
	},
	{
		label: "Restrooms",
		x: 120,
		y: 470,
		w: 184,
		h: 70,
		tone: "service"
	},
	{
		label: "Café & Refreshments",
		x: 380,
		y: 480,
		w: 224,
		h: 110,
		tone: "amenity"
	},
	{
		label: "Seating & Meeting Points",
		x: 680,
		y: 480,
		w: 204,
		h: 110,
		tone: "amenity"
	},
	{
		label: "Registration & Badge Collection",
		x: 380,
		y: 630,
		w: 504,
		h: 70,
		tone: "service"
	},
	{
		label: "Main Entrance",
		x: 560,
		y: 720,
		w: 144,
		h: 50,
		tone: "access"
	},
	{
		label: "Emergency Exit",
		x: 40,
		y: 620,
		w: 110,
		h: 44,
		tone: "access"
	},
	{
		label: "Emergency Exit",
		x: 1e3,
		y: 620,
		w: 110,
		h: 44,
		tone: "access"
	}
];
var aisles = [
	{
		label: "Main Aisle",
		x: 108,
		y: 440,
		w: 976,
		h: 24,
		vertical: false
	},
	{
		label: "",
		x: 320,
		y: 170,
		w: 44,
		h: 400,
		vertical: true
	},
	{
		label: "",
		x: 620,
		y: 170,
		w: 44,
		h: 400,
		vertical: true
	},
	{
		label: "",
		x: 900,
		y: 170,
		w: 44,
		h: 400,
		vertical: true
	}
];
var getStall = (id) => stalls.find((s) => s.id === id);
var ACTIVE_STATUSES = [
	"PAYMENT_PENDING",
	"PAYMENT_REVIEW",
	"CONFIRMED"
];
var statusLabel = {
	AVAILABLE: "Available",
	PAYMENT_PENDING: "On hold",
	PAYMENT_REVIEW: "On hold",
	CONFIRMED: "Confirmed",
	EXPIRED: "Available",
	CANCELLED: "Available",
	CONFLICT: "On hold"
};
/**
* DEMO BOOKING ENGINE (UI prototype)
* ---------------------------------
* This module is the single source of truth for booking state in the prototype.
* It intentionally mirrors the shape of a real server/database service:
* every mutation is a guarded, all-or-nothing transition that re-checks stall
* availability before writing. Swapping this file for real API calls later does
* not require changing any component.
*/
var STORAGE_KEY = "marriott-expo-demo-state-v1";
var HOLD_MS = eventConfig.booking.paymentPendingMinutes * 60 * 1e3;
var now = () => Date.now();
var uid = () => Math.random().toString(36).slice(2, 10);
function seed() {
	const state = {
		bookings: [],
		audit: [],
		notifications: [],
		seq: 0
	};
	const t = now();
	const mk = (stallId, status, customer, company, minutesAgo, extra = {}) => {
		const stall = getStall(stallId);
		state.seq += 1;
		const createdAt = t - minutesAgo * 60 * 1e3;
		const booking = {
			id: uid(),
			reference: `EVT-2026-${String(1e3 + state.seq).slice(1)}`,
			stallId,
			customerName: customer,
			companyName: company,
			email: `${company.toLowerCase().replace(/[^a-z]/g, "")}@demo-mail.test`,
			phone: "+92 300 000000" + state.seq % 10,
			productService: "Demo product / service listing",
			notes: "",
			amount: stall.price,
			status,
			paymentStatus: status === "CONFIRMED" ? "VERIFIED" : status === "PAYMENT_REVIEW" ? "EVIDENCE_SUBMITTED" : "UNPAID",
			createdAt,
			expiresAt: createdAt + HOLD_MS,
			source: "PUBLIC",
			...extra
		};
		state.bookings.push(booking);
		state.audit.push({
			id: uid(),
			bookingRef: booking.reference,
			action: "DEMO_SEED",
			actor: "system",
			details: `Seeded demo booking for ${stallId} with status ${status}`,
			createdAt
		});
		return booking;
	};
	mk("A02", "PAYMENT_PENDING", "Hamza Iqbal", "Northline Systems", 6);
	mk("B03", "PAYMENT_PENDING", "Sana Raza", "Vertex Instruments", 12);
	mk("C04", "PAYMENT_PENDING", "Bilal Ahmed", "Orbit Logistics", 19);
	mk("B01", "PAYMENT_REVIEW", "Ayesha Khan", "Meridian Foods", 40, {
		paymentSubmittedAt: t - 192e4,
		paymentReference: "TRX-448120"
	});
	mk("D02", "PAYMENT_REVIEW", "Usman Tariq", "Cascade Energy", 55, {
		paymentSubmittedAt: t - 27e5,
		paymentReference: "TRX-448233"
	});
	const seedNames = [
		"Zara Malik",
		"Faisal Sheikh",
		"Nida Aslam",
		"Rehan Qureshi",
		"Maria Yousuf"
	];
	const seedCompanies = [
		"Arcadia Textiles",
		"Helix Robotics",
		"Bluepeak Pharma",
		"Sona Ceramics",
		"Tallgrass Agri"
	];
	[
		"A01",
		"B05",
		"C01",
		"C05",
		"D01"
	].forEach((id, i) => mk(id, "CONFIRMED", seedNames[i] ?? "Exhibitor", seedCompanies[i] ?? "Company", 600 + i * 30, { confirmedAt: t - (500 + i * 20) * 60 * 1e3 }));
	mk("A04", "EXPIRED", "Kamran Vohra", "Delta Packaging", 190, { expiresAt: t - 96e5 });
	mk("C01", "CONFLICT", "Imran Baig", "Silverline Traders", 320, {
		expiresAt: t - 174e5,
		paymentStatus: "EVIDENCE_SUBMITTED",
		paymentSubmittedAt: t - 168e5,
		paymentReference: "TRX-447019",
		conflictReason: "Payment evidence received after the temporary hold expired."
	});
	return state;
}
var state = {
	bookings: [],
	audit: [],
	notifications: [],
	seq: 0
};
var hydrated = false;
var listeners = /* @__PURE__ */ new Set();
function load() {
	if (hydrated || typeof window === "undefined") return;
	hydrated = true;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		state = raw ? JSON.parse(raw) : seed();
	} catch {
		state = seed();
	}
	sweepExpired();
	cachedSnapshot = state;
	persist();
}
function persist() {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {}
}
var cachedSnapshot = state;
function emit() {
	persist();
	cachedSnapshot = { ...state };
	listeners.forEach((l) => l());
}
function subscribe(listener) {
	load();
	listeners.add(listener);
	return () => listeners.delete(listener);
}
function getSnapshot() {
	load();
	return cachedSnapshot;
}
var serverSnapshot = {
	bookings: [],
	audit: [],
	notifications: [],
	seq: 0
};
function useBookingState() {
	return (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, () => serverSnapshot);
}
function log(action, actor, details, bookingRef) {
	state.audit.unshift({
		id: uid(),
		action,
		actor,
		details,
		bookingRef,
		createdAt: now()
	});
}
function notify(audience, recipient, subject, body, bookingRef) {
	state.notifications.unshift({
		id: uid(),
		audience,
		recipient,
		subject,
		body,
		bookingRef,
		status: "SENT (TEST MODE)",
		createdAt: now()
	});
}
function activeBookingForStall(bookings, stallId) {
	return bookings.find((b) => b.stallId === stallId && ACTIVE_STATUSES.includes(b.status));
}
function stallStatus(bookings, stallId) {
	const active = activeBookingForStall(bookings, stallId);
	return active ? active.status : "AVAILABLE";
}
function stallStatusMap(bookings) {
	const map = {};
	for (const s of stalls) map[s.id] = stallStatus(bookings, s.id);
	return map;
}
function metrics(bookings) {
	const map = stallStatusMap(bookings);
	const count = (s) => Object.values(map).filter((v) => v === s).length;
	return {
		total: stalls.length,
		available: count("AVAILABLE"),
		paymentPending: count("PAYMENT_PENDING"),
		paymentReview: count("PAYMENT_REVIEW"),
		confirmed: count("CONFIRMED"),
		expired: bookings.filter((b) => b.status === "EXPIRED").length,
		conflicts: bookings.filter((b) => b.status === "CONFLICT").length
	};
}
function sweepExpired() {
	let changed = false;
	const t = now();
	for (const b of state.bookings) if (b.status === "PAYMENT_PENDING" && b.expiresAt < t) {
		b.status = "EXPIRED";
		changed = true;
		log("BOOKING_EXPIRED", "system", `Temporary hold on ${b.stallId} expired without payment.`, b.reference);
		notify("CUSTOMER", b.email, `Reservation expired — ${b.stallId}`, `Your temporary reservation for space ${b.stallId} expired because payment was not verified within ${eventConfig.booking.paymentPendingMinutes} minutes. The space is available again. Contact us if you have already paid.`, b.reference);
	}
	if (changed) emit();
	return changed;
}
if (typeof window !== "undefined") window.setInterval(sweepExpired, 15e3);
function nextReference() {
	state.seq += 1;
	return `EVT-2026-${String(1e3 + state.seq).slice(1)}`;
}
/** Atomic create: re-checks availability immediately before writing. */
function createBooking(stallId, input, source = "PUBLIC", presetStatus) {
	load();
	sweepExpired();
	const stall = getStall(stallId);
	if (!stall) return {
		ok: false,
		error: "This space does not exist."
	};
	if (activeBookingForStall(state.bookings, stallId)) return {
		ok: false,
		error: "This space was just taken by another customer. Please choose another space."
	};
	const t = now();
	const booking = {
		id: uid(),
		reference: nextReference(),
		stallId,
		...input,
		amount: stall.price,
		status: presetStatus ?? "PAYMENT_PENDING",
		paymentStatus: presetStatus === "CONFIRMED" ? "VERIFIED" : "UNPAID",
		createdAt: t,
		expiresAt: t + HOLD_MS,
		confirmedAt: presetStatus === "CONFIRMED" ? t : void 0,
		source
	};
	state.bookings.unshift(booking);
	log("BOOKING_CREATED", source === "ADMIN" ? "admin" : "customer", `${booking.stallId} held for ${booking.companyName}.`, booking.reference);
	notify("ADMIN", eventConfig.contact.email, `New booking request — ${booking.stallId} (${booking.reference})`, `${booking.customerName} of ${booking.companyName} has requested space ${booking.stallId}. Amount: PKR ${booking.amount.toLocaleString()}. Payment verification required.`, booking.reference);
	if (booking.status === "PAYMENT_PENDING") notify("CUSTOMER", booking.email, `Booking request received — ${booking.reference}`, `We have received your request for space ${booking.stallId}. Your space is temporarily reserved for ${eventConfig.booking.paymentPendingMinutes} minutes while payment is verified. This is not yet a confirmed booking — please complete payment and send your receipt via WhatsApp.`, booking.reference);
	emit();
	return {
		ok: true,
		data: booking
	};
}
function submitPaymentEvidence(reference, paymentReference) {
	load();
	sweepExpired();
	const b = state.bookings.find((x) => x.reference === reference);
	if (!b) return {
		ok: false,
		error: "Booking not found."
	};
	if (b.status === "PAYMENT_PENDING") {
		b.status = "PAYMENT_REVIEW";
		b.paymentStatus = "EVIDENCE_SUBMITTED";
		b.paymentSubmittedAt = now();
		b.paymentReference = paymentReference;
		log("PAYMENT_SUBMITTED", "customer", `Payment evidence ${paymentReference} submitted for ${b.stallId}.`, b.reference);
		notify("ADMIN", eventConfig.contact.email, `Payment review required — ${b.reference}`, `${b.companyName} submitted payment reference ${paymentReference} for ${b.stallId}. The hold is protected until an admin reviews it.`, b.reference);
		notify("CUSTOMER", b.email, `Payment received for review — ${b.reference}`, `Thank you. Your payment evidence is under review. Your space ${b.stallId} remains reserved while our team verifies the payment. You will receive a confirmation once approved.`, b.reference);
		emit();
		return {
			ok: true,
			data: b
		};
	}
	if (b.status === "EXPIRED" || b.status === "CANCELLED") {
		b.status = "CONFLICT";
		b.paymentStatus = "EVIDENCE_SUBMITTED";
		b.paymentSubmittedAt = now();
		b.paymentReference = paymentReference;
		b.conflictReason = "Payment evidence received after the temporary hold expired.";
		log("CONFLICT_CREATED", "system", `Late payment on ${b.stallId} for ${b.companyName}. Manual resolution required.`, b.reference);
		notify("ADMIN", eventConfig.contact.email, `Payment conflict detected — ${b.reference}`, `Payment reference ${paymentReference} arrived after booking ${b.reference} expired. Space ${b.stallId} may now belong to another customer. Manual resolution required.`, b.reference);
		notify("CUSTOMER", b.email, `We are reviewing your payment — ${b.reference}`, `Your payment arrived after the reservation window closed. Our team is reviewing your case and will contact you shortly. Your payment record has been preserved.`, b.reference);
		emit();
		return {
			ok: true,
			data: b
		};
	}
	return {
		ok: false,
		error: "Payment cannot be submitted for this booking in its current state."
	};
}
function approveBooking(reference) {
	load();
	const b = state.bookings.find((x) => x.reference === reference);
	if (!b) return {
		ok: false,
		error: "Booking not found."
	};
	if (b.status === "CONFIRMED") return {
		ok: false,
		error: "This booking is already confirmed."
	};
	const holder = activeBookingForStall(state.bookings, b.stallId);
	if (holder && holder.reference !== b.reference) return {
		ok: false,
		error: `Space ${b.stallId} is currently held by ${holder.reference}. Release or reassign it first.`
	};
	b.status = "CONFIRMED";
	b.paymentStatus = "VERIFIED";
	b.confirmedAt = now();
	log("BOOKING_APPROVED", "admin", `Payment verified and ${b.stallId} confirmed for ${b.companyName}.`, b.reference);
	notify("CUSTOMER", b.email, `Booking confirmed — ${b.stallId}`, `Payment received and your exhibition space is confirmed.\nCustomer: ${b.customerName}\nBooking ID: ${b.reference}\nSpace: ${b.stallId}\nEvent: ${eventConfig.name}, ${eventConfig.dateLabel}, ${eventConfig.venue.name}.`, b.reference);
	emit();
	return {
		ok: true,
		data: b
	};
}
function releaseBooking(reference, reason) {
	load();
	const b = state.bookings.find((x) => x.reference === reference);
	if (!b) return {
		ok: false,
		error: "Booking not found."
	};
	b.status = reason === "CANCELLED" ? "CANCELLED" : "EXPIRED";
	b.cancelledAt = now();
	log(reason === "CANCELLED" ? "BOOKING_CANCELLED" : "BOOKING_RELEASED", "admin", `${b.stallId} released back to available. Customer: ${b.companyName}.`, b.reference);
	notify("CUSTOMER", b.email, `Reservation released — ${b.reference}`, `Your reservation for space ${b.stallId} has been released by the organiser. If this is unexpected, please contact us.`, b.reference);
	emit();
	return {
		ok: true,
		data: b
	};
}
function reassignBooking(reference, newStallId) {
	load();
	const b = state.bookings.find((x) => x.reference === reference);
	if (!b) return {
		ok: false,
		error: "Booking not found."
	};
	const stall = getStall(newStallId);
	if (!stall) return {
		ok: false,
		error: "Target space does not exist."
	};
	const holder = activeBookingForStall(state.bookings, newStallId);
	if (holder && holder.reference !== reference) return {
		ok: false,
		error: `Space ${newStallId} is not available.`
	};
	const from = b.stallId;
	b.stallId = newStallId;
	b.amount = stall.price;
	if (b.status === "CONFLICT" || b.status === "EXPIRED") b.status = "PAYMENT_REVIEW";
	log("BOOKING_REASSIGNED", "admin", `Moved ${b.companyName} from ${from} to ${newStallId}.`, b.reference);
	notify("CUSTOMER", b.email, `Your space has been updated — ${b.reference}`, `Your exhibition space has been moved from ${from} to ${newStallId}. Amount: PKR ${b.amount.toLocaleString()}.`, b.reference);
	emit();
	return {
		ok: true,
		data: b
	};
}
function updateBooking(reference, patch) {
	load();
	const b = state.bookings.find((x) => x.reference === reference);
	if (!b) return {
		ok: false,
		error: "Booking not found."
	};
	Object.assign(b, patch);
	log("BOOKING_UPDATED", "admin", `Booking details updated for ${b.reference}.`, b.reference);
	emit();
	return {
		ok: true,
		data: b
	};
}
function resolveConflict(reference, resolution) {
	load();
	const b = state.bookings.find((x) => x.reference === reference);
	if (!b) return {
		ok: false,
		error: "Booking not found."
	};
	b.status = "CANCELLED";
	b.paymentStatus = "REFUND_PENDING";
	b.cancelledAt = now();
	log("CONFLICT_RESOLVED", "admin", `${resolution} — ${b.reference}`, b.reference);
	notify("CUSTOMER", b.email, `Update on your booking — ${b.reference}`, `${resolution}. Our team will be in touch to complete the process.`, b.reference);
	emit();
	return {
		ok: true,
		data: b
	};
}
function resetDemoData() {
	state = seed();
	hydrated = true;
	emit();
}
function DemoBanner() {
	const activeHolds = useBookingState().bookings.filter((b) => b.status === "PAYMENT_PENDING").length;
	const handleSweep = () => {
		if (sweepExpired()) toast.info("Expired unpaid reservations were returned to available status.");
		else toast.success("All reservation timers are up to date.");
	};
	const handleReset = () => {
		if (confirm("Reset demo data back to clean seeded state?")) {
			resetDemoData();
			toast.success("Demo dataset reset successfully.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-b border-border bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-900 dark:text-amber-200",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 sm:px-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3 w-3" }), "Demo Simulation Mode"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "hidden sm:inline",
					children: ["Real-time floor map & state engine active. Active holds: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: activeHolds })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleSweep,
						className: "inline-flex items-center gap-1 hover:underline focus:outline-none",
						title: "Check and sweep expired temporary holds",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }), "Run Expiry Check"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "opacity-30",
						children: "•"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleReset,
						className: "inline-flex items-center gap-1 hover:underline focus:outline-none",
						title: "Reset data back to seed state",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3 w-3" }), "Reset Seed Data"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "opacity-30",
						children: "•"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/admin",
						className: "inline-flex items-center gap-1 font-bold text-primary hover:underline focus:outline-none",
						children: ["Admin Portal ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" })]
					})
				]
			})]
		})
	});
}
function SiteLayout({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoBanner, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { statusLabel as _, aisles as a, updateBooking as b, createBooking as c, metrics as d, reassignBooking as f, stalls as g, stallStatusMap as h, activeBookingForStall as i, facilities as l, resolveConflict as m, MAP_WIDTH as n, approveBooking as o, releaseBooking as p, SiteLayout as r, cn as s, Button as t, getStall as u, submitPaymentEvidence as v, useBookingState as x, sweepExpired as y };
