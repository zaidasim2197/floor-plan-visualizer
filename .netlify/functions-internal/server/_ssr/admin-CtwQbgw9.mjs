import { r as __toESM } from "../_runtime.mjs";
import { t as eventConfig } from "./event-2f2AwK3C.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as ChevronDown, S as Funnel, T as CirclePlus, b as LogOut, j as Check, k as ChevronUp, r as TriangleAlert, t as X, u as Search, x as Lock } from "../_libs/lucide-react.mjs";
import { b as updateBooking, c as createBooking, d as metrics, f as reassignBooking, g as stalls, h as stallStatusMap, m as resolveConflict, o as approveBooking, p as releaseBooking, r as SiteLayout, s as cn, t as Button, x as useBookingState } from "./SiteLayout-CKYIau6i.mjs";
import { n as Label, t as Input } from "./label-L6jlgP2A.mjs";
import { n as statusTone, t as formatMoney } from "./booking-format-CKKEcEYb.mjs";
import { n as FloorMapLegend, t as FloorMap } from "./FloorMap-1mQ2ZkcF.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as SelectItemIndicator, c as SelectPortal, d as SelectSeparator$1, f as SelectTrigger$1, i as SelectItem$1, l as SelectScrollDownButton$1, m as SelectViewport, n as SelectContent$1, o as SelectItemText, p as SelectValue$1, r as SelectIcon, s as SelectLabel$1, t as Select$1, u as SelectScrollUpButton$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-CtwQbgw9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = SelectLabel$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator$1, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = SelectSeparator$1.displayName;
var adminStatusLabel = {
	AVAILABLE: "Available",
	PAYMENT_PENDING: "Payment Pending",
	PAYMENT_REVIEW: "Payment Review",
	CONFIRMED: "Confirmed",
	EXPIRED: "Expired",
	CANCELLED: "Cancelled",
	CONFLICT: "Conflict"
};
function AdminStatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap", statusTone[status]),
		children: adminStatusLabel[status]
	});
}
function AdminPage() {
	const [authenticated, setAuthenticated] = (0, import_react.useState)(() => {
		if (typeof window !== "undefined") return window.localStorage.getItem("marriott_admin_auth") === "true";
		return false;
	});
	const [usernameInput, setUsernameInput] = (0, import_react.useState)("");
	const [passwordInput, setPasswordInput] = (0, import_react.useState)("");
	const [authError, setAuthError] = (0, import_react.useState)(null);
	const handleLogin = (e) => {
		e.preventDefault();
		setAuthError(null);
		if (usernameInput.trim() === eventConfig.demo.adminUsername && passwordInput === eventConfig.demo.adminPassword) {
			setAuthenticated(true);
			if (typeof window !== "undefined") window.localStorage.setItem("marriott_admin_auth", "true");
			toast.success("Authenticated as Administrator.");
		} else setAuthError("Invalid admin credentials. Use demo credentials shown below.");
	};
	const handleLogout = () => {
		setAuthenticated(false);
		if (typeof window !== "undefined") window.localStorage.removeItem("marriott_admin_auth");
		toast.info("Logged out of Admin Portal.");
	};
	if (!authenticated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-md py-20 px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-border bg-card p-8 shadow-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-6 w-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-extrabold text-center text-foreground",
					children: "Admin Portal Authentication"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-center text-muted-foreground",
					children: "Restricted management panel for event organizers and venue managers."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-md bg-secondary p-3 text-xs border border-border space-y-1 font-mono",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-bold text-foreground",
							children: "Demo Access Credentials:"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Username: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "text-primary",
							children: "admin"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Password: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "text-primary",
							children: "Admin@123"
						})] })
					]
				}),
				authError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 rounded-md bg-destructive/10 p-3 text-xs font-semibold text-destructive",
					children: authError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleLogin,
					className: "mt-6 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "admin-user",
								children: "Username"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "admin-user",
								required: true,
								placeholder: "admin",
								value: usernameInput,
								onChange: (e) => setUsernameInput(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "admin-pass",
								children: "Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "admin-pass",
								type: "password",
								required: true,
								placeholder: "••••••••",
								value: passwordInput,
								onChange: (e) => setPasswordInput(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full font-bold h-11",
							children: "Authenticate & Access Dashboard"
						})
					]
				})
			]
		})
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminDashboard, { onLogout: handleLogout });
}
function AdminDashboard({ onLogout }) {
	const state = useBookingState();
	const stats = (0, import_react.useMemo)(() => metrics(state.bookings), [state.bookings]);
	const statusMap = (0, import_react.useMemo)(() => stallStatusMap(state.bookings), [state.bookings]);
	const [activeTab, setActiveTab] = (0, import_react.useState)("bookings");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("ALL");
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const [selectedBooking, setSelectedBooking] = (0, import_react.useState)(null);
	const [reassignModalOpen, setReassignModalOpen] = (0, import_react.useState)(false);
	const [newStallTarget, setNewStallTarget] = (0, import_react.useState)("");
	const [editModalOpen, setEditModalOpen] = (0, import_react.useState)(false);
	const [manualBookingModalOpen, setManualBookingModalOpen] = (0, import_react.useState)(false);
	const [releaseConfirmOpen, setReleaseConfirmOpen] = (0, import_react.useState)(false);
	const [editName, setEditName] = (0, import_react.useState)("");
	const [editCompany, setEditCompany] = (0, import_react.useState)("");
	const [editEmail, setEditEmail] = (0, import_react.useState)("");
	const [editPhone, setEditPhone] = (0, import_react.useState)("");
	const [editProduct, setEditProduct] = (0, import_react.useState)("");
	const [mbStallId, setMbStallId] = (0, import_react.useState)("A01");
	const [mbName, setMbName] = (0, import_react.useState)("");
	const [mbCompany, setMbCompany] = (0, import_react.useState)("");
	const [mbEmail, setMbEmail] = (0, import_react.useState)("");
	const [mbPhone, setMbPhone] = (0, import_react.useState)("");
	const [mbProduct, setMbProduct] = (0, import_react.useState)("");
	const [mbStatus, setMbStatus] = (0, import_react.useState)("CONFIRMED");
	const conflicts = (0, import_react.useMemo)(() => state.bookings.filter((b) => b.status === "CONFLICT"), [state.bookings]);
	const filteredBookings = (0, import_react.useMemo)(() => {
		return state.bookings.filter((b) => {
			if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
			if (searchTerm.trim()) {
				const q = searchTerm.toLowerCase();
				return b.reference.toLowerCase().includes(q) || b.customerName.toLowerCase().includes(q) || b.companyName.toLowerCase().includes(q) || b.stallId.toLowerCase().includes(q);
			}
			return true;
		});
	}, [
		state.bookings,
		statusFilter,
		searchTerm
	]);
	const handleApprove = (ref) => {
		const res = approveBooking(ref);
		if (res.ok) toast.success(`Booking ${ref} confirmed successfully.`);
		else toast.error(res.error);
	};
	const handleRelease = (ref) => {
		const res = releaseBooking(ref, "RELEASED");
		if (res.ok) {
			toast.success(`Space for booking ${ref} released.`);
			setReleaseConfirmOpen(false);
		} else toast.error(res.error);
	};
	const handleExecuteReassign = () => {
		if (!selectedBooking || !newStallTarget) return;
		const res = reassignBooking(selectedBooking.reference, newStallTarget);
		if (res.ok) {
			toast.success(`Moved booking ${selectedBooking.reference} to space ${newStallTarget}.`);
			setReassignModalOpen(false);
		} else toast.error(res.error);
	};
	const handleOpenEdit = (b) => {
		setSelectedBooking(b);
		setEditName(b.customerName);
		setEditCompany(b.companyName);
		setEditEmail(b.email);
		setEditPhone(b.phone);
		setEditProduct(b.productService);
		setEditModalOpen(true);
	};
	const handleExecuteEdit = (e) => {
		e.preventDefault();
		if (!selectedBooking) return;
		const res = updateBooking(selectedBooking.reference, {
			customerName: editName,
			companyName: editCompany,
			email: editEmail,
			phone: editPhone,
			productService: editProduct
		});
		if (res.ok) {
			toast.success(`Updated booking ${selectedBooking.reference}.`);
			setEditModalOpen(false);
		} else toast.error(res.error);
	};
	const handleCreateManualBooking = (e) => {
		e.preventDefault();
		const res = createBooking(mbStallId, {
			customerName: mbName,
			companyName: mbCompany,
			email: mbEmail,
			phone: mbPhone,
			productService: mbProduct,
			notes: "Manually created via Admin Panel"
		}, "ADMIN", mbStatus);
		if (res.ok) {
			toast.success(`Manual booking created for space ${mbStallId}!`);
			setManualBookingModalOpen(false);
			setMbName("");
			setMbCompany("");
			setMbEmail("");
			setMbPhone("");
			setMbProduct("");
		} else toast.error(res.error);
	};
	const handleResolveConflictAction = (ref, resolution) => {
		const res = resolveConflict(ref, resolution);
		if (res.ok) toast.success(`Conflict resolved for ${ref}.`);
		else toast.error(res.error);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-b border-border bg-ink text-ink-foreground py-2.5 px-4 text-xs font-semibold",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 sm:px-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5 text-emerald-400",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-emerald-400 animate-ping" }), " Booking System: Operational"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "opacity-30",
							children: "•"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "opacity-80",
							children: "Database: Connected"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "opacity-30",
							children: "•"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "opacity-80",
							children: "Notifications: Test Mode"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline-dark",
						className: "h-7 text-xs",
						onClick: () => setManualBookingModalOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "mr-1 h-3.5 w-3.5" }), " Add Manual Booking"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onLogout,
						className: "inline-flex items-center gap-1 text-red-300 hover:text-red-100 hover:underline",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" }), " Logout"]
					})]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-extrabold tracking-tight text-foreground",
						children: "Exhibition Operations Dashboard"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-1",
						children: "Live booking state engine, real-time map synchronization, conflict management & notification audit logs."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex rounded-md border border-border bg-surface p-1 text-xs font-bold",
						children: [
							["bookings", `Bookings (${state.bookings.length})`],
							["map", "Floor Map View"],
							["emails", `Email Log (${state.notifications.length})`],
							["audit", `Audit Trail (${state.audit.length})`]
						].map(([tab, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setActiveTab(tab),
							className: `rounded-sm px-3 py-2 transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`,
							children: label
						}, tab))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7",
					children: [
						[
							"Total Spaces",
							stats.total,
							"border-border"
						],
						[
							"Available",
							stats.available,
							"border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
						],
						[
							"Payment Pending",
							stats.paymentPending,
							"border-amber-500/30 text-amber-700 dark:text-amber-300"
						],
						[
							"Payment Review",
							stats.paymentReview,
							"border-blue-500/30 text-blue-700 dark:text-blue-300"
						],
						[
							"Confirmed",
							stats.confirmed,
							"border-emerald-600/30 text-emerald-800 dark:text-emerald-200"
						],
						[
							"Expired",
							stats.expired,
							"border-border text-muted-foreground"
						],
						[
							"Conflicts",
							stats.conflicts,
							"border-red-500/30 text-red-700 dark:text-red-300"
						]
					].map(([label, val, borderStyle]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `rounded-lg border bg-card p-3.5 shadow-xs ${borderStyle}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1 text-2xl font-extrabold",
							children: val
						})]
					}, label))
				}),
				conflicts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-red-500/40 bg-red-500/10 p-5 shadow-sm space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-6 w-6 text-red-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "text-base font-bold text-red-900 dark:text-red-200",
							children: [
								"PAYMENT CONFLICT DETECTED (",
								conflicts.length,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-red-800 dark:text-red-300",
							children: "Payment evidence was submitted after a reservation expired. Customer money was received, but space availability may have changed. Manual resolution required."
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "divide-y divide-red-500/20 border-t border-red-500/20 pt-2 space-y-3",
						children: conflicts.map((c) => {
							const isStallFree = statusMap[c.stallId] === "AVAILABLE";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-3 flex flex-wrap items-center justify-between gap-4 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-extrabold text-foreground",
										children: c.reference
									}),
									" — Company: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: c.companyName }),
									" (",
									c.customerName,
									") | Stall: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: c.stallId }),
									" | Payment Ref: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: c.paymentReference || "N/A" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-red-800 dark:text-red-300 mt-0.5",
										children: c.conflictReason
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										isStallFree && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											className: "h-7 text-xs font-bold bg-emerald-600 hover:bg-emerald-700",
											onClick: () => handleApprove(c.reference),
											children: [
												"Confirm Space ",
												c.stallId,
												" (Still Available)"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "outline",
											className: "h-7 text-xs font-bold",
											onClick: () => {
												setSelectedBooking(c);
												setReassignModalOpen(true);
											},
											children: "Reassign to Another Space"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "destructive",
											className: "h-7 text-xs font-bold",
											onClick: () => handleResolveConflictAction(c.reference, "Refund processed according to policy due to late payment post-expiry."),
											children: "Issue Refund & Cancel"
										})
									]
								})]
							}, c.id);
						})
					})]
				}),
				activeTab === "bookings" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-4 bg-surface p-4 rounded-lg border border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-1 items-center gap-3 min-w-[240px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Search by ID, Customer Name, Company, or Stall...",
								value: searchTerm,
								onChange: (e) => setSearchTerm(e.target.value),
								className: "h-9 text-xs"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "h-3.5 w-3.5 text-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold text-muted-foreground uppercase",
									children: "Status Filter:"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: statusFilter,
									onChange: (e) => setStatusFilter(e.target.value),
									className: "h-9 rounded-md border border-border bg-background px-3 text-xs font-semibold",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: "ALL",
											children: [
												"All Statuses (",
												state.bookings.length,
												")"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: "PAYMENT_PENDING",
											children: [
												"Payment Pending (",
												stats.paymentPending,
												")"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: "PAYMENT_REVIEW",
											children: [
												"Payment Review (",
												stats.paymentReview,
												")"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: "CONFIRMED",
											children: [
												"Confirmed (",
												stats.confirmed,
												")"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: "EXPIRED",
											children: [
												"Expired (",
												stats.expired,
												")"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: "CONFLICT",
											children: [
												"Conflict (",
												stats.conflicts,
												")"
											]
										})
									]
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto rounded-lg border border-border bg-card shadow-xs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[840px] text-left text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-surface-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Reference"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Space"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Customer & Company"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Amount"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Payment Ref"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 text-right",
										children: "Actions"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border",
								children: filteredBookings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 7,
									className: "px-4 py-8 text-center text-muted-foreground",
									children: "No bookings match the selected criteria."
								}) }) : filteredBookings.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-secondary/40",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3 font-extrabold text-foreground",
											children: [b.reference, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-[10px] font-normal text-muted-foreground",
												children: new Date(b.createdAt).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-bold text-foreground",
											children: b.stallId
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold text-foreground",
												children: b.companyName
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[11px] text-muted-foreground",
												children: [
													b.customerName,
													" · ",
													b.phone
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-semibold",
											children: formatMoney(b.amount)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-mono text-muted-foreground",
											children: b.paymentReference || "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatusBadge, { status: b.status })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3 text-right space-x-1",
											children: [
												(b.status === "PAYMENT_PENDING" || b.status === "PAYMENT_REVIEW") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													className: "h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700",
													onClick: () => handleApprove(b.reference),
													children: "Approve"
												}),
												(b.status === "PAYMENT_PENDING" || b.status === "PAYMENT_REVIEW") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "outline",
													className: "h-7 text-[11px] font-bold text-amber-700 dark:text-amber-300",
													onClick: () => {
														setSelectedBooking(b);
														setReleaseConfirmOpen(true);
													},
													children: "Release"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "outline",
													className: "h-7 text-[11px] font-bold",
													onClick: () => {
														setSelectedBooking(b);
														setReassignModalOpen(true);
													},
													children: "Reassign"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "ghost",
													className: "h-7 text-[11px] font-semibold",
													onClick: () => handleOpenEdit(b),
													children: "Edit"
												})
											]
										})
									]
								}, b.id))
							})]
						})
					})]
				}),
				activeTab === "map" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloorMap, {
						statusMap,
						selectedId: selectedBooking?.stallId ?? null,
						onSelect: (s) => {
							const found = state.bookings.find((b) => b.stallId === s.id && (b.status === "CONFIRMED" || b.status === "PAYMENT_PENDING" || b.status === "PAYMENT_REVIEW"));
							if (found) setSelectedBooking(found);
							else {
								setMbStallId(s.id);
								setManualBookingModalOpen(true);
							}
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloorMapLegend, { className: "mt-4" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-5 shadow-xs text-xs space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-bold text-foreground border-b border-border pb-2",
							children: "Admin Stall Inspector"
						}), selectedBooking ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Space Number"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-lg font-extrabold text-foreground",
									children: selectedBooking.stallId
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Booking Reference"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold text-primary",
									children: selectedBooking.reference
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Company Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold text-foreground",
									children: selectedBooking.companyName
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Customer Contact"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-semibold text-foreground",
									children: [
										selectedBooking.customerName,
										" (",
										selectedBooking.phone,
										")"
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Current Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatusBadge, { status: selectedBooking.status })
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pt-3 border-t border-border space-y-2",
									children: [selectedBooking.status !== "CONFIRMED" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "w-full h-8 text-xs font-bold bg-emerald-600",
										onClick: () => handleApprove(selectedBooking.reference),
										children: "Approve Booking"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										className: "w-full h-8 text-xs font-bold",
										onClick: () => handleOpenEdit(selectedBooking),
										children: "Edit Customer Info"
									})]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground",
							children: "Click any stall on the map to inspect its active booking or manually create a new reservation."
						})]
					})]
				}),
				activeTab === "emails" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-bold text-foreground",
							children: "Generated Email Notifications Log"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "All automated transaction emails dispatched to admins and customers during booking lifecycle."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto rounded-lg border border-border bg-card shadow-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[700px] text-left text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "bg-surface-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Audience"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Recipient"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Subject"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Reference"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Timestamp"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-border",
									children: state.notifications.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-secondary/40",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${n.audience === "ADMIN" ? "bg-purple-500/10 text-purple-700" : "bg-blue-500/10 text-blue-700"}`,
													children: n.audience
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 font-medium text-foreground",
												children: n.recipient
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 font-semibold text-foreground max-w-xs truncate",
												children: n.subject
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 font-mono text-muted-foreground",
												children: n.bookingRef || "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 text-muted-foreground",
												children: new Date(n.createdAt).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
													second: "2-digit"
												})
											})
										]
									}, n.id))
								})]
							})
						})
					]
				}),
				activeTab === "audit" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-bold text-foreground",
							children: "System Audit Event Log"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Immutable state machine transition trail for regulatory compliance and audit tracking."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto rounded-lg border border-border bg-card shadow-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[700px] text-left text-xs font-mono",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "bg-surface-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Timestamp"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Action"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Actor"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Reference"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Details"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-border",
									children: state.audit.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-secondary/40",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 text-muted-foreground",
												children: new Date(a.createdAt).toISOString().replace("T", " ").slice(0, 19)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 font-bold text-primary",
												children: a.action
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 uppercase text-muted-foreground",
												children: a.actor
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 text-foreground",
												children: a.bookingRef || "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 text-muted-foreground",
												children: a.details
											})
										]
									}, a.id))
								})]
							})
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: reassignModalOpen,
			onOpenChange: setReassignModalOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Reassign Booking Location" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					"Move booking ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedBooking?.reference }),
					" (",
					selectedBooking?.companyName,
					") to a different available space."
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Select Target Space" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: newStallTarget,
						onValueChange: setNewStallTarget,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose available space..." }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: stalls.filter((s) => statusMap[s.id] === "AVAILABLE").map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
							value: s.id,
							children: [
								"Space ",
								s.stallNumber,
								" (",
								s.category,
								" — ",
								formatMoney(s.price),
								")"
							]
						}, s.id)) })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setReassignModalOpen(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handleExecuteReassign,
					disabled: !newStallTarget,
					children: "Execute Reassignment"
				})] })
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: editModalOpen,
			onOpenChange: setEditModalOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Edit Booking Details" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
				"Update contact or company details for reference ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedBooking?.reference }),
				"."
			] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleExecuteEdit,
				className: "space-y-4 py-2 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "edit-name",
							children: "Customer Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "edit-name",
							value: editName,
							onChange: (e) => setEditName(e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "edit-company",
							children: "Company Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "edit-company",
							value: editCompany,
							onChange: (e) => setEditCompany(e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "edit-email",
							children: "Email Address"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "edit-email",
							type: "email",
							value: editEmail,
							onChange: (e) => setEditEmail(e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "edit-phone",
							children: "Phone Number"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "edit-phone",
							value: editPhone,
							onChange: (e) => setEditPhone(e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
						className: "pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => setEditModalOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "font-bold",
							children: "Save Changes"
						})]
					})
				]
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: releaseConfirmOpen,
			onOpenChange: setReleaseConfirmOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Release Space Confirmation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
				"Are you sure you want to release space ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedBooking?.stallId }),
				" held by ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedBooking?.companyName }),
				"? The space will instantly return to AVAILABLE."
			] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => setReleaseConfirmOpen(false),
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "destructive",
				onClick: () => selectedBooking && handleRelease(selectedBooking.reference),
				children: "Confirm Release"
			})] })] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: manualBookingModalOpen,
			onOpenChange: setManualBookingModalOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add Manual Admin Booking" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Create a direct booking for an exhibitor. Double-booking protection rules strictly enforced." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleCreateManualBooking,
					className: "space-y-3 py-2 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Select Space *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: mbStallId,
								onValueChange: setMbStallId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: stalls.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: s.id,
									disabled: statusMap[s.id] !== "AVAILABLE",
									children: [
										"Space ",
										s.stallNumber,
										" (",
										statusMap[s.id],
										")"
									]
								}, s.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "mb-name",
								children: "Customer Name *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "mb-name",
								required: true,
								value: mbName,
								onChange: (e) => setMbName(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "mb-company",
								children: "Company Name *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "mb-company",
								required: true,
								value: mbCompany,
								onChange: (e) => setMbCompany(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "mb-email",
									children: "Email *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "mb-email",
									type: "email",
									required: true,
									value: mbEmail,
									onChange: (e) => setMbEmail(e.target.value)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "mb-phone",
									children: "Phone *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "mb-phone",
									required: true,
									value: mbPhone,
									onChange: (e) => setMbPhone(e.target.value)
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "mb-product",
								children: "Product / Category"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "mb-product",
								value: mbProduct,
								onChange: (e) => setMbProduct(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Initial Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: mbStatus,
								onValueChange: (v) => setMbStatus(v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "CONFIRMED",
										children: "CONFIRMED (Payment Verified)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "PAYMENT_REVIEW",
										children: "PAYMENT_REVIEW (Under Review)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "PAYMENT_PENDING",
										children: "PAYMENT_PENDING (30-Min Hold)"
									})
								] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setManualBookingModalOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "font-bold",
								children: "Create Booking"
							})]
						})
					]
				})]
			})
		})
	] });
}
//#endregion
export { AdminPage as component };
