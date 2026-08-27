import { r as __toESM } from "../_runtime.mjs";
import { n as whatsappLink, t as eventConfig } from "./event-2f2AwK3C.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as CheckboxIndicator, p as require_jsx_runtime, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { E as CircleCheck, O as CircleAlert, R as ArrowLeft, c as ShieldCheck, j as Check, l as Send, w as Clock } from "../_libs/lucide-react.mjs";
import { c as createBooking, i as activeBookingForStall, r as SiteLayout, s as cn, t as Button, u as getStall, v as submitPaymentEvidence, x as useBookingState, y as sweepExpired } from "./SiteLayout-CKYIau6i.mjs";
import { n as Label, t as Input } from "./label-L6jlgP2A.mjs";
import { t as formatMoney } from "./booking-format-CKKEcEYb.mjs";
import { t as StatusBadge } from "./StatusBadge-Ctudv6cz.mjs";
import { t as Route } from "./book._stallId-Dc4S7dQD.mjs";
import { t as Textarea } from "./textarea-BE9s_JWl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/book._stallId-DiAdpFrW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
function BookStallPage() {
	const { stallId } = Route.useParams();
	useNavigate();
	const state = useBookingState();
	const stall = (0, import_react.useMemo)(() => getStall(stallId), [stallId]);
	const activeBooking = (0, import_react.useMemo)(() => stall ? activeBookingForStall(state.bookings, stall.id) : void 0, [state.bookings, stall]);
	const [customerName, setCustomerName] = (0, import_react.useState)("");
	const [companyName, setCompanyName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [productService, setProductService] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [terms, setTerms] = (0, import_react.useState)(false);
	const [activeRef, setActiveRef] = (0, import_react.useState)(null);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [paymentRefInput, setPaymentRefInput] = (0, import_react.useState)("");
	const [submittingPayment, setSubmittingPayment] = (0, import_react.useState)(false);
	const currentBooking = (0, import_react.useMemo)(() => {
		if (activeRef) return state.bookings.find((b) => b.reference === activeRef);
		return activeBooking;
	}, [
		state.bookings,
		activeRef,
		activeBooking
	]);
	const [secondsLeft, setSecondsLeft] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!currentBooking || currentBooking.status !== "PAYMENT_PENDING") return;
		const calc = () => {
			const remaining = Math.max(0, Math.floor((currentBooking.expiresAt - Date.now()) / 1e3));
			setSecondsLeft(remaining);
			if (remaining === 0) sweepExpired();
		};
		calc();
		const interval = setInterval(calc, 1e3);
		return () => clearInterval(interval);
	}, [currentBooking]);
	if (!stall) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md py-20 px-4 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mx-auto h-12 w-12 text-destructive" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 text-xl font-bold",
				children: "Space Not Found"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: [
					"The space ID \"",
					stallId,
					"\" does not exist in the floor plan."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-6 font-bold",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/floor-plan",
					children: "Back to Floor Plan"
				})
			})
		]
	}) });
	const handleFormSubmit = (e) => {
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
			notes
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
	const handleSimulatePayment = (e) => {
		e.preventDefault();
		if (!currentBooking) return;
		setSubmittingPayment(true);
		const dummyRef = paymentRefInput.trim() || `TRX-${Math.floor(1e5 + Math.random() * 9e5)}`;
		const res = submitPaymentEvidence(currentBooking.reference, dummyRef);
		setSubmittingPayment(false);
		if (res.ok) toast.success("Payment submitted for review!");
		else toast.error(res.error);
	};
	const formatTimer = (secs) => {
		const m = Math.floor(secs / 60);
		const s = secs % 60;
		return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "border-b border-border bg-surface py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-7xl px-4 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/floor-plan",
				className: "inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground mb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Back to Floor Plan"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow text-primary",
					children: stall.zone
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground",
					children: ["Exhibition Space Booking — ", stall.stallNumber]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-semibold text-muted-foreground",
						children: "Price:"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xl font-extrabold text-foreground",
						children: formatMoney(stall.price)
					})]
				})]
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "mx-auto w-full max-w-7xl px-4 py-12 sm:px-6",
		children: currentBooking ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl space-y-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card p-6 shadow-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-4 border-b border-border pb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-muted-foreground uppercase",
								children: "Booking Reference"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xl font-extrabold tracking-tight text-foreground",
								children: currentBooking.reference
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: currentBooking.status })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Space"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold text-foreground",
									children: currentBooking.stallId
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Company"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold text-foreground truncate",
									children: currentBooking.companyName
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Amount"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold text-foreground",
									children: formatMoney(currentBooking.amount)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Payment Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold text-primary",
									children: currentBooking.paymentStatus
								})] })
							]
						}),
						currentBooking.status === "PAYMENT_PENDING" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-6 w-6 text-amber-600 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-bold text-amber-900 dark:text-amber-300 uppercase",
									children: "Temporary Hold Expiration"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-amber-800 dark:text-amber-400",
									children: "Complete payment before timer expires to retain space."
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-2xl font-extrabold text-amber-900 dark:text-amber-200 tracking-mono",
								children: formatTimer(secondsLeft)
							})]
						})
					]
				}),
				currentBooking.status === "PAYMENT_PENDING" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card p-6 shadow-sm space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-bold text-foreground",
							children: "Payment Instructions"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: [
								"Please transfer the total booking fee of ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatMoney(currentBooking.amount) }),
								" to the official event account below."
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-secondary p-4 space-y-2 text-sm font-mono border border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Bank Name:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-foreground",
										children: "Habib Bank Limited (HBL)"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Account Title:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-foreground",
										children: "Marriott Trade & Exhibitions Ltd"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "IBAN / Account #:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-foreground",
										children: "PK36 HABB 0001 2345 6789 0102"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Reference Code:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-primary",
										children: currentBooking.reference
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-5 w-5 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "text-sm font-bold text-foreground",
										children: "Option 1: Send Receipt via WhatsApp"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Take a screenshot of your bank transfer receipt and send it directly to our administration team on WhatsApp for fast verification."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									className: "w-full bg-emerald-600 hover:bg-emerald-700 font-bold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: whatsappLink(eventConfig.contact.whatsapp[0], `Payment Receipt Submission:\nBooking ID: ${currentBooking.reference}\nSpace: ${currentBooking.stallId}\nCompany: ${currentBooking.companyName}\nAmount: PKR ${currentBooking.amount.toLocaleString()}`),
										target: "_blank",
										rel: "noreferrer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "mr-2 h-4 w-4" }), " Send Receipt via WhatsApp"]
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border p-5 space-y-3 bg-background",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "text-sm font-bold text-foreground",
									children: "Option 2: Simulate Payment (Demo Action)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										"Submit payment evidence directly inside the application to move status to ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "PAYMENT_REVIEW" }),
										"."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: handleSimulatePayment,
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "Transaction Reference (e.g. TRX-992140)",
										value: paymentRefInput,
										onChange: (e) => setPaymentRefInput(e.target.value)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										className: "font-bold shrink-0",
										disabled: submittingPayment,
										children: "Simulate Payment"
									})]
								})
							]
						})
					]
				}),
				currentBooking.status === "PAYMENT_REVIEW" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-blue-500/30 bg-blue-500/5 p-6 text-center space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mx-auto h-12 w-12 text-blue-600" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-bold text-foreground",
							children: "Payment Received & Under Review"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground max-w-md mx-auto",
							children: [
								"Thank you! Your payment reference ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: currentBooking.paymentReference }),
								" has been received. Your temporary hold is protected while our administration team verifies the transfer."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pt-4 flex justify-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								size: "sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/floor-plan",
									children: "Return to Floor Plan"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/admin",
									children: "Open Admin Panel to Approve"
								})
							})]
						})
					]
				}),
				currentBooking.status === "CONFIRMED" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mx-auto h-12 w-12 text-emerald-600" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-bold text-foreground",
							children: "Booking Permanently Confirmed!"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground max-w-md mx-auto",
							children: [
								"Your exhibition space ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: currentBooking.stallId }),
								" is fully confirmed. An official confirmation email has been logged to your address ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: currentBooking.email }),
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/floor-plan",
									children: "View Confirmed Space on Map"
								})
							})
						})
					]
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-12 lg:grid-cols-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-5 space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card p-6 shadow-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-foreground border-b border-border pb-3",
						children: "Selected Space Summary"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 space-y-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Space Number"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-extrabold text-foreground",
									children: stall.stallNumber
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Category"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-semibold text-foreground",
									children: stall.category
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Dimensions"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-semibold text-foreground",
									children: stall.size
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Zone"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-semibold text-foreground",
									children: stall.zone
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between border-t border-border pt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "font-bold text-foreground",
									children: "Total Rental Fee"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "text-xl font-extrabold text-primary",
									children: formatMoney(stall.price)
								})]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card p-6 shadow-xs space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "text-sm font-bold text-foreground flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-emerald-600" }), " Hold Protection Notice"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground leading-relaxed",
						children: [
							"Submitting this form immediately reserves space ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: stall.stallNumber }),
							" for ",
							eventConfig.booking.paymentPendingMinutes,
							" minutes. No other user can book this space while your hold is active."
						]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:col-span-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card p-8 shadow-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-extrabold text-foreground",
							children: "Complete Exhibitor Booking Form"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Provide your organization details to initialize your temporary reservation."
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-xs font-semibold text-destructive flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleFormSubmit,
							className: "mt-6 space-y-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "customerName",
											children: "Full Name *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "customerName",
											required: true,
											placeholder: "e.g. Hammad Sheikh",
											value: customerName,
											onChange: (e) => setCustomerName(e.target.value)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "companyName",
											children: "Company / Organization *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "companyName",
											required: true,
											placeholder: "e.g. Apex Industrial Solutions",
											value: companyName,
											onChange: (e) => setCompanyName(e.target.value)
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "email",
											children: "Work Email *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "email",
											type: "email",
											required: true,
											placeholder: "hammad@apex.com",
											value: email,
											onChange: (e) => setEmail(e.target.value)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "phone",
											children: "Phone / WhatsApp *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "phone",
											required: true,
											placeholder: "+92 300 1234567",
											value: phone,
											onChange: (e) => setPhone(e.target.value)
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "productService",
										children: "Product / Industry Category *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "productService",
										required: true,
										placeholder: "e.g. Industrial Automation, Renewable Energy, Textiles",
										value: productService,
										onChange: (e) => setProductService(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "notes",
										children: "Special Requirements / Notes"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "notes",
										rows: 3,
										placeholder: "e.g. Power outlet requirements, extra table request...",
										value: notes,
										onChange: (e) => setNotes(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start space-x-3 pt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
										id: "terms",
										checked: terms,
										onCheckedChange: (checked) => setTerms(Boolean(checked))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										htmlFor: "terms",
										className: "text-xs leading-normal text-muted-foreground",
										children: [
											"I agree to the Exhibition Terms & Conditions and understand that space hold is valid for ",
											eventConfig.booking.paymentPendingMinutes,
											" minutes pending payment confirmation."
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									className: "w-full h-11 font-bold text-sm",
									disabled: submitting,
									children: submitting ? "Reserving Space..." : `Submit Request & Reserve Space (${stall.stallNumber})`
								})
							]
						})
					]
				})
			})]
		})
	})] });
}
//#endregion
export { BookStallPage as component };
