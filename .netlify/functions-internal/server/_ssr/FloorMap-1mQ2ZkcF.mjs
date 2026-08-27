import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { _ as Maximize2, f as Plus, m as Minus } from "../_libs/lucide-react.mjs";
import { _ as statusLabel, a as aisles, g as stalls, l as facilities, n as MAP_WIDTH, s as cn } from "./SiteLayout-CKYIau6i.mjs";
import { t as formatMoney } from "./booking-format-CKKEcEYb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/FloorMap-1mQ2ZkcF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MIN_ZOOM = .6;
var MAX_ZOOM = 4;
var stallFill = {
	AVAILABLE: "var(--map-available)",
	PAYMENT_PENDING: "var(--map-pending)",
	PAYMENT_REVIEW: "var(--map-review)",
	CONFIRMED: "var(--map-confirmed)",
	EXPIRED: "var(--map-available)",
	CANCELLED: "var(--map-available)",
	CONFLICT: "var(--map-blocked)"
};
var facilityTone = {
	stage: "var(--color-ink)",
	service: "var(--color-surface-2)",
	amenity: "var(--color-accent)",
	access: "var(--color-copper)"
};
var facilityText = {
	stage: "var(--color-ink-foreground)",
	service: "var(--color-muted-foreground)",
	amenity: "var(--color-accent-foreground)",
	access: "var(--color-copper-foreground)"
};
var legendItems = [
	{
		status: "AVAILABLE",
		swatch: "var(--map-available)"
	},
	{
		status: "PAYMENT_PENDING",
		swatch: "var(--map-pending)"
	},
	{
		status: "CONFIRMED",
		swatch: "var(--map-confirmed)"
	}
];
function FloorMapLegend({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-wrap items-center gap-x-4 gap-y-2", className),
		children: [legendItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex items-center gap-2 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "h-3 w-3 rounded-[3px] border border-border",
				style: { backgroundColor: item.swatch }
			}), statusLabel[item.status]]
		}, item.status)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex items-center gap-2 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-3 w-3 rounded-[3px] border-2 border-primary bg-primary/20" }), "Selected"]
		})]
	});
}
function FloorMap({ statusMap, selectedId, onSelect, className }) {
	const containerRef = (0, import_react.useRef)(null);
	const [zoom, setZoom] = (0, import_react.useState)(1);
	const [offset, setOffset] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const [hover, setHover] = (0, import_react.useState)(null);
	const drag = (0, import_react.useRef)(null);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const view = (0, import_react.useRef)({
		zoom,
		offset
	});
	view.current = {
		zoom,
		offset
	};
	const zoomAt = (0, import_react.useCallback)((next, px, py) => {
		const { zoom: z, offset: o } = view.current;
		const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
		const k = clamped / z;
		setZoom(clamped);
		setOffset({
			x: px - (px - o.x) * k,
			y: py - (py - o.y) * k
		});
	}, []);
	const wheelRef = (0, import_react.useRef)(() => {});
	wheelRef.current = (e) => {
		const el = containerRef.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
		zoomAt(view.current.zoom * Math.exp(-dy * .0015), e.clientX - rect.left, e.clientY - rect.top);
	};
	(0, import_react.useEffect)(() => {
		const el = containerRef.current;
		if (!el) return;
		const onWheel = (e) => {
			e.preventDefault();
			wheelRef.current(e);
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, []);
	const reset = () => {
		setZoom(1);
		setOffset({
			x: 0,
			y: 0
		});
	};
	const stepZoom = (factor) => {
		const rect = containerRef.current?.getBoundingClientRect();
		zoomAt(view.current.zoom * factor, (rect?.width ?? 0) / 2, (rect?.height ?? 0) / 2);
	};
	const onPointerDown = (e) => {
		e.target.setPointerCapture?.(e.pointerId);
		drag.current = {
			x: e.clientX,
			y: e.clientY,
			ox: offset.x,
			oy: offset.y
		};
		setDragging(true);
	};
	const onPointerMove = (e) => {
		const d = drag.current;
		if (!d) return;
		setOffset({
			x: d.ox + (e.clientX - d.x),
			y: d.oy + (e.clientY - d.y)
		});
	};
	const endDrag = () => {
		drag.current = null;
		setDragging(false);
	};
	const scale = (0, import_react.useMemo)(() => zoom, [zoom]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("relative overflow-hidden rounded-md border border-border bg-surface-2", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: containerRef,
			className: cn("relative h-[420px] touch-none select-none sm:h-[560px]", dragging ? "cursor-grabbing" : "cursor-grab"),
			onPointerDown,
			onPointerMove,
			onPointerUp: endDrag,
			onPointerLeave: () => {
				endDrag();
				setHover(null);
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					className: "h-full w-full",
					viewBox: `0 0 ${MAP_WIDTH} 800`,
					preserveAspectRatio: "xMidYMid meet",
					role: "img",
					"aria-label": "Interactive exhibition floor plan",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						transform: `translate(${offset.x} ${offset.y}) scale(${scale})`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: 0,
								y: 0,
								width: MAP_WIDTH,
								height: 800,
								fill: "var(--color-surface)"
							}),
							aisles.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: a.x,
								y: a.y,
								width: a.w,
								height: a.h,
								fill: "var(--color-surface-2)"
							}), a.label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x: a.x + a.w / 2,
								y: a.y + a.h / 2 + 4,
								textAnchor: "middle",
								className: "text-[11px]",
								fill: "var(--color-muted-foreground)",
								style: {
									fontSize: 11,
									letterSpacing: "0.16em"
								},
								children: a.label.toUpperCase()
							}) : null] }, i)),
							facilities.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
									x: f.x,
									y: f.y,
									width: f.w,
									height: f.h,
									rx: 4,
									fill: facilityTone[f.tone],
									stroke: "var(--color-border)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
									x: f.x + f.w / 2,
									y: f.y + f.h / 2 + (f.sublabel ? -2 : 4),
									textAnchor: "middle",
									fill: facilityText[f.tone],
									style: {
										fontSize: 12,
										fontWeight: 600
									},
									children: f.label
								}),
								f.sublabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
									x: f.x + f.w / 2,
									y: f.y + f.h / 2 + 14,
									textAnchor: "middle",
									fill: facilityText[f.tone],
									style: {
										fontSize: 10,
										opacity: .75
									},
									children: f.sublabel
								}) : null
							] }, i)),
							stalls.map((s) => {
								const status = statusMap[s.id] ?? "AVAILABLE";
								const selected = selectedId === s.id;
								const available = status === "AVAILABLE";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
									role: "button",
									tabIndex: 0,
									"aria-label": `Space ${s.stallNumber}, ${statusLabel[status]}, ${formatMoney(s.price)}`,
									className: "outline-none",
									style: { cursor: available ? "pointer" : "not-allowed" },
									onClick: () => onSelect?.(s),
									onKeyDown: (e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											onSelect?.(s);
										}
									},
									onMouseMove: (e) => {
										const rect = containerRef.current?.getBoundingClientRect();
										if (!rect) return;
										setHover({
											stall: s,
											x: e.clientX - rect.left,
											y: e.clientY - rect.top
										});
									},
									onMouseLeave: () => setHover((h) => h?.stall.id === s.id ? null : h),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
											x: s.x,
											y: s.y,
											width: s.w,
											height: s.h,
											rx: 3,
											fill: selected ? "var(--map-selected)" : stallFill[status],
											stroke: selected ? "var(--map-selected)" : "var(--map-available-border)",
											strokeWidth: selected ? 3 : 1.25,
											opacity: available || selected ? 1 : .92
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
											x: s.x + s.w / 2,
											y: s.y + s.h / 2 + 1,
											textAnchor: "middle",
											fill: selected ? "var(--color-primary-foreground)" : "var(--color-foreground)",
											style: {
												fontSize: 14,
												fontWeight: 700
											},
											children: s.stallNumber
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
											x: s.x + s.w / 2,
											y: s.y + s.h / 2 + 16,
											textAnchor: "middle",
											fill: selected ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
											style: { fontSize: 9.5 },
											children: s.size
										})
									]
								}, s.id);
							})
						]
					})
				}),
				hover ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-none absolute z-10 w-52 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-md border border-border bg-popover p-3 text-left shadow-lg",
					style: {
						left: hover.x,
						top: hover.y
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-bold",
							children: ["Space ", hover.stall.stallNumber]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: hover.stall.zone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-2 space-y-1 text-[11px]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted-foreground",
										children: "Type"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "font-medium",
										children: hover.stall.category
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted-foreground",
										children: "Size"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "font-medium",
										children: hover.stall.size
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted-foreground",
										children: "Price"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "font-medium",
										children: formatMoney(hover.stall.price)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted-foreground",
										children: "Status"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "font-semibold",
										children: statusLabel[statusMap[hover.stall.id] ?? "AVAILABLE"]
									})]
								})
							]
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-sm border border-border bg-background shadow-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Zoom in",
							onClick: () => stepZoom(1.25),
							className: "flex h-9 w-9 items-center justify-center hover:bg-secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Zoom out",
							onClick: () => stepZoom(1 / 1.25),
							className: "flex h-9 w-9 items-center justify-center border-t border-border hover:bg-secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Reset view",
							onClick: reset,
							className: "flex h-9 w-9 items-center justify-center border-t border-border hover:bg-secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "h-4 w-4" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pointer-events-none absolute left-3 top-3 rounded-sm border border-border bg-background/85 px-2 py-1 text-[11px] text-muted-foreground",
					children: "Scroll or pinch to zoom · drag to pan"
				})
			]
		})
	});
}
//#endregion
export { FloorMapLegend as n, FloorMap as t };
