import { r as __toESM } from "../_runtime.mjs";
import { n as whatsappLink, t as eventConfig } from "./event-2f2AwK3C.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { L as ArrowRight, s as Shield } from "../_libs/lucide-react.mjs";
import { d as metrics, g as stalls, h as stallStatusMap, r as SiteLayout, t as Button, x as useBookingState } from "./SiteLayout-CKYIau6i.mjs";
import { t as formatMoney } from "./booking-format-CKKEcEYb.mjs";
import { n as FloorMapLegend, t as FloorMap } from "./FloorMap-1mQ2ZkcF.mjs";
import { t as StatusBadge } from "./StatusBadge-Ctudv6cz.mjs";
import { t as description } from "./floor-plan-AO52mcYg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/floor-plan-Bg3XaEd2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FloorPlanPage() {
	const state = useBookingState();
	const navigate = useNavigate();
	const statusMap = (0, import_react.useMemo)(() => stallStatusMap(state.bookings), [state.bookings]);
	const stats = (0, import_react.useMemo)(() => metrics(state.bookings), [state.bookings]);
	const [selected, setSelected] = (0, import_react.useState)(stalls[0] ?? null);
	const [zone, setZone] = (0, import_react.useState)("All zones");
	const zones = (0, import_react.useMemo)(() => ["All zones", ...Array.from(new Set(stalls.map((s) => s.zone)))], []);
	const list = (0, import_react.useMemo)(() => stalls.filter((s) => zone === "All zones" || s.zone === zone), [zone]);
	const selectedStatus = selected ? statusMap[selected.id] ?? "AVAILABLE" : null;
	const handleStartBooking = (stallId) => {
		navigate({
			to: "/book/$stallId",
			params: { stallId }
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "border-b border-border bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-7xl px-4 py-10 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: eventConfig.floorPlanLabel
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl",
					children: "Choose Your Exhibition Space"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-2xl text-sm text-muted-foreground",
					children: description
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
					className: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4",
					children: [
						["Total spaces", stats.total],
						["Available", stats.available],
						["Reserved", stats.paymentPending + stats.paymentReview],
						["Confirmed", stats.confirmed]
					].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border border-border bg-background p-3.5 shadow-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1 text-2xl font-extrabold text-foreground",
							children: value
						})]
					}, label))
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloorMap, {
				statusMap,
				selectedId: selected?.id ?? null,
				onSelect: setSelected
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloorMapLegend, { className: "mt-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3 mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-foreground",
						children: "Stall Directory & Availability"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: zones.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setZone(z),
							className: "rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors " + (zone === z ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary"),
							children: z
						}, z))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto rounded-lg border border-border bg-card shadow-xs",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[560px] text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-surface-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3",
									children: "Space"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3",
									children: "Type"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3",
									children: "Size"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3",
									children: "Price"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-right",
									children: "Action"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border",
							children: list.map((s) => {
								const status = statusMap[s.id] ?? "AVAILABLE";
								const isSelected = selected?.id === s.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									onClick: () => setSelected(s),
									className: `cursor-pointer transition-colors ${isSelected ? "bg-primary/5 font-medium" : "hover:bg-secondary/60"}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-extrabold text-foreground",
											children: s.stallNumber
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-muted-foreground",
											children: s.category
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-muted-foreground",
											children: s.size
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-semibold",
											children: formatMoney(s.price)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-right",
											children: status === "AVAILABLE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												className: "h-8 text-xs font-bold",
												onClick: (e) => {
													e.stopPropagation();
													handleStartBooking(s.id);
												},
												children: "Book Space"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground italic",
												children: "Unavailable"
											})
										})
									]
								}, s.id);
							})
						})]
					})
				})]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: "lg:sticky lg:top-20 lg:self-start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl border border-border bg-card p-6 shadow-sm",
				children: !selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base font-bold text-foreground",
						children: "Space Details"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2",
						children: "Select any space on the map or in the table to view dimensions, category, pricing, and live hold availability."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3 border-b border-border pb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow text-primary",
							children: selected.zone
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-2xl font-extrabold tracking-tight text-foreground",
							children: ["Space ", selected.stallNumber]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: selectedStatus })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-5 space-y-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Type",
								value: selected.category
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Dimensions",
								value: selected.size
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Price",
								value: formatMoney(selected.price)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Temporary Hold",
								value: `${eventConfig.booking.paymentPendingMinutes} Minutes`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 space-y-3",
						children: [selectedStatus === "AVAILABLE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "w-full h-11 font-bold text-sm",
							onClick: () => handleStartBooking(selected.id),
							children: [
								"Reserve Space ",
								selected.stallNumber,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4" })
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full h-11 font-bold text-sm",
							disabled: true,
							children: "Currently Unavailable"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "w-full h-11 font-bold text-sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: whatsappLink(eventConfig.contact.whatsapp[0], `Hello, I am inquiring about exhibition space ${selected.stallNumber} (${selected.category}) at ${eventConfig.name}.`),
								target: "_blank",
								rel: "noreferrer",
								children: "Enquire on WhatsApp"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 rounded-md bg-secondary p-3 text-[11px] leading-relaxed text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-semibold text-foreground flex items-center gap-1.5 mb-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-3.5 w-3.5 text-primary" }), " Booking Protection Policy"]
							}),
							"Submitting a booking request places an instant temporary hold for ",
							eventConfig.booking.paymentPendingMinutes,
							" minutes. The booking is confirmed once payment verification is completed by the organiser."
						]
					})
				] })
			})
		})]
	})] });
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-right font-semibold text-foreground",
			children: value
		})]
	});
}
//#endregion
export { FloorPlanPage as component };
