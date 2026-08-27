import { r as __toESM } from "../_runtime.mjs";
import { n as whatsappLink, t as eventConfig } from "./event-2f2AwK3C.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { E as CircleCheck, F as Building2, I as BadgeCheck, L as ArrowRight, N as CalendarDays, a as Target, i as TrendingUp, n as Users, o as Sparkles, v as MapPin } from "../_libs/lucide-react.mjs";
import { d as metrics, h as stallStatusMap, r as SiteLayout, t as Button, x as useBookingState } from "./SiteLayout-CKYIau6i.mjs";
import { n as FloorMapLegend, t as FloorMap } from "./FloorMap-1mQ2ZkcF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D14fOlTB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CountdownTimer() {
	const [timeLeft, setTimeLeft] = (0, import_react.useState)({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0
	});
	(0, import_react.useEffect)(() => {
		const calculate = () => {
			const diff = new Date(eventConfig.startDate).getTime() - (/* @__PURE__ */ new Date()).getTime();
			if (diff <= 0) {
				setTimeLeft({
					days: 0,
					hours: 0,
					minutes: 0,
					seconds: 0
				});
				return;
			}
			const days = Math.floor(diff / 864e5);
			const hours = Math.floor(diff / 36e5 % 24);
			const minutes = Math.floor(diff / 1e3 / 60 % 60);
			const seconds = Math.floor(diff / 1e3 % 60);
			setTimeLeft({
				days,
				hours,
				minutes,
				seconds
			});
		};
		calculate();
		const interval = setInterval(calculate, 1e3);
		return () => clearInterval(interval);
	}, []);
	const items = [
		{
			label: "Days",
			value: timeLeft.days
		},
		{
			label: "Hours",
			value: timeLeft.hours
		},
		{
			label: "Minutes",
			value: timeLeft.minutes
		},
		{
			label: "Seconds",
			value: timeLeft.seconds
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "eyebrow text-copper font-bold",
			children: "Event Countdown"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 grid grid-cols-4 gap-2 sm:gap-4",
			children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-center rounded-md border border-border bg-card p-3 text-center shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl",
					children: String(item.value).padStart(2, "0")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs",
					children: item.label
				})]
			}, item.label))
		})]
	});
}
function Index() {
	const state = useBookingState();
	const statusMap = (0, import_react.useMemo)(() => stallStatusMap(state.bookings), [state.bookings]);
	const stats = (0, import_react.useMemo)(() => metrics(state.bookings), [state.bookings]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-b border-border bg-surface relative overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:py-20 items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl text-foreground",
							children: eventConfig.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed",
							children: eventConfig.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-3 rounded-md border border-border bg-background p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-5 w-5 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground uppercase font-bold",
									children: "Date & Time"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-foreground font-semibold",
									children: eventConfig.dateLabel
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-3 rounded-md border border-border bg-background p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-5 w-5 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground uppercase font-bold",
									children: "Venue"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-foreground font-semibold",
									children: eventConfig.venue.name
								})] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-wrap items-center gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "lg",
								className: "h-12 px-7 font-bold text-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/floor-plan",
									children: ["Book Your Space ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4" })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "lg",
								variant: "outline",
								className: "h-12 px-7 font-bold text-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/floor-plan",
									children: "Explore Floor Plan"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex items-center gap-4 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "h-4 w-4" }), " Real-Time Hold Verification"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									stats.available,
									" of ",
									stats.total,
									" Spaces Available"
								] })
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-5 flex flex-col gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl border border-border bg-card p-6 shadow-xs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountdownTimer, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-6 shadow-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between border-b border-border pb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
								children: "Live Availability"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-extrabold text-foreground",
								children: [
									stats.available,
									" Available / ",
									stats.total,
									" Total"
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid grid-cols-3 gap-2 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-md bg-emerald-500/10 p-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xl font-extrabold text-emerald-800 dark:text-emerald-300",
										children: stats.available
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase",
										children: "Available"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-md bg-amber-500/10 p-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xl font-extrabold text-amber-800 dark:text-amber-300",
										children: stats.paymentPending + stats.paymentReview
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase",
										children: "On Hold"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-md bg-blue-500/10 p-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xl font-extrabold text-blue-800 dark:text-blue-300",
										children: stats.confirmed
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase",
										children: "Confirmed"
									})]
								})
							]
						})]
					})]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto w-full max-w-7xl px-4 py-20 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-3xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow text-primary",
						children: "Exhibitor Benefits"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl",
						children: "Why Exhibit at Marriott Trade Expo?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-base text-muted-foreground",
						children: "Position your brand directly in front of thousands of international buyers, key procurement managers, and industry leaders."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					{
						icon: Building2,
						title: "Showcase Your Products",
						desc: "Display your latest innovations and product lines in high-spec exhibition pods with direct buyer interaction."
					},
					{
						icon: Users,
						title: "Meet Quality Buyers",
						desc: "Connect with pre-registered decision-makers, commercial procurement executives, and enterprise buyers."
					},
					{
						icon: TrendingUp,
						title: "Build Business Connections",
						desc: "Expand your distributor network, form joint ventures, and close strategic partnerships on the expo floor."
					},
					{
						icon: Target,
						title: "Present Your Brand",
						desc: "Elevate your market visibility through premier keynote placement and dedicated media coverage."
					},
					{
						icon: Sparkles,
						title: "Connect Industry Leaders",
						desc: "Participate in roundtables, VIP networking sessions, and live technology demonstrations."
					},
					{
						icon: CircleCheck,
						title: "Instant Space Hold",
						desc: "Our interactive map allows instant 30-minute temporary holds to secure your preferred location seamlessly."
					}
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-lg border border-border bg-card p-6 shadow-xs hover:border-primary/40 transition-colors",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "h-8 w-8 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 text-lg font-bold text-foreground",
							children: item.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground leading-relaxed",
							children: item.desc
						})
					]
				}, item.title))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-t border-border bg-surface py-20",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-7xl px-4 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col md:flex-row md:items-end justify-between gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow text-primary",
							children: "Interactive Floor Map"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl",
							children: "Explore Available Spaces"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-2xl text-sm text-muted-foreground",
							children: "Hover over any space to inspect dimensions, pricing, and category. Click to start your booking request instantly."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						className: "font-bold",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/floor-plan",
							children: ["Open Full Floor Map ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4" })]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloorMap, { statusMap }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloorMapLegend, { className: "mt-4" })]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto w-full max-w-7xl px-4 py-20 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl font-extrabold tracking-tight sm:text-3xl",
				children: "How Booking Works"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 grid gap-6 md:grid-cols-3",
				children: [
					[
						"01",
						"Pick your space",
						"Zoom into the interactive floor plan and select any available stall to view dimensions and pricing."
					],
					[
						"02",
						"Hold it instantly",
						`Complete the brief registration form to place a ${eventConfig.booking.paymentPendingMinutes}-minute temporary hold on your space.`
					],
					[
						"03",
						"Get confirmed",
						"Send your payment receipt via WhatsApp or bank ref. Once verified by our team, your space is permanently confirmed."
					]
				].map(([num, heading, body]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-lg border border-border bg-card p-6 relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-extrabold text-primary uppercase tracking-widest",
							children: num
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-2 text-lg font-bold",
							children: heading
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground leading-relaxed",
							children: body
						})
					]
				}, heading))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-t border-border bg-ink text-ink-foreground py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-7xl px-4 sm:px-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-3xl font-extrabold tracking-tight sm:text-4xl",
						children: "Secure Your Space at Marriott Expo 2026"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl mx-auto text-sm opacity-80",
						children: "Exhibition spaces are limited and assigned on a first-come, first-served basis. Reserve your preferred location today."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap justify-center gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							className: "bg-primary text-primary-foreground font-bold hover:bg-primary/90",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/floor-plan",
								children: ["Reserve Exhibition Space Now ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							variant: "outline-dark",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: whatsappLink(eventConfig.contact.whatsapp[0], "Hello, I would like to inquire about exhibiting at Marriott Expo 2026."),
								target: "_blank",
								rel: "noreferrer",
								children: "Inquire on WhatsApp"
							})
						})]
					})
				]
			})
		})
	] });
}
//#endregion
export { Index as component };
