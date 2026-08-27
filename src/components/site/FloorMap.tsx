import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Maximize2 } from "lucide-react";
import { MAP_HEIGHT, MAP_WIDTH, aisles, facilities, stalls } from "@/data/floor-plan";
import type { Stall, StallStatus } from "@/lib/booking-types";
import { statusLabel } from "@/lib/booking-types";
import { formatMoney } from "@/lib/booking-format";
import { cn } from "@/lib/utils";

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 4;

const stallFill: Record<StallStatus, string> = {
  AVAILABLE: "var(--map-available)",
  PAYMENT_PENDING: "var(--map-pending)",
  PAYMENT_REVIEW: "var(--map-review)",
  CONFIRMED: "var(--map-confirmed)",
  EXPIRED: "var(--map-available)",
  CANCELLED: "var(--map-available)",
  CONFLICT: "var(--map-blocked)",
};

const facilityTone: Record<string, string> = {
  stage: "var(--color-ink)",
  service: "var(--color-surface-2)",
  amenity: "var(--color-accent)",
  access: "var(--color-copper)",
};

const facilityText: Record<string, string> = {
  stage: "var(--color-ink-foreground)",
  service: "var(--color-muted-foreground)",
  amenity: "var(--color-accent-foreground)",
  access: "var(--color-copper-foreground)",
};

export const legendItems: { status: StallStatus; swatch: string }[] = [
  { status: "AVAILABLE", swatch: "var(--map-available)" },
  { status: "PAYMENT_PENDING", swatch: "var(--map-pending)" },
  { status: "PAYMENT_REVIEW", swatch: "var(--map-review)" },
  { status: "CONFIRMED", swatch: "var(--map-confirmed)" },
  { status: "CONFLICT", swatch: "var(--map-blocked)" },
];

export function FloorMapLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {legendItems.map((item) => (
        <span key={item.status} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className="h-3 w-3 rounded-[3px] border border-border"
            style={{ backgroundColor: item.swatch }}
          />
          {statusLabel[item.status]}
        </span>
      ))}
      <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <span className="h-3 w-3 rounded-[3px] border-2 border-primary bg-primary/20" />
        Selected
      </span>
    </div>
  );
}

interface FloorMapProps {
  statusMap: Record<string, StallStatus>;
  selectedId?: string | null;
  onSelect?: (stall: Stall) => void;
  className?: string;
}

export function FloorMap({ statusMap, selectedId, onSelect, className }: FloorMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState<{ stall: Stall; x: number; y: number } | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const view = useRef({ zoom, offset });
  view.current = { zoom, offset };

  const zoomAt = useCallback((next: number, px: number, py: number) => {
    const { zoom: z, offset: o } = view.current;
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    const k = clamped / z;
    setZoom(clamped);
    setOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k });
  }, []);

  const wheelRef = useRef((e: WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    zoomAt(view.current.zoom * Math.exp(-dy * 0.0015), e.clientX - rect.left, e.clientY - rect.top);
  });
  wheelRef.current = (e: WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    zoomAt(view.current.zoom * Math.exp(-dy * 0.0015), e.clientX - rect.left, e.clientY - rect.top);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const stepZoom = (factor: number) => {
    const el = containerRef.current;
    const rect = el?.getBoundingClientRect();
    zoomAt(view.current.zoom * factor, (rect?.width ?? 0) / 2, (rect?.height ?? 0) / 2);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    setOffset({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) });
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const scale = useMemo(() => zoom, [zoom]);

  return (
    <div className={cn("relative overflow-hidden rounded-md border border-border bg-surface-2", className)}>
      <div
        ref={containerRef}
        className={cn("relative h-[420px] touch-none select-none sm:h-[560px]", dragging ? "cursor-grabbing" : "cursor-grab")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={() => {
          endDrag();
          setHover(null);
        }}
      >
        <svg
          className="h-full w-full"
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Interactive exhibition floor plan"
        >
          <g transform={`translate(${offset.x} ${offset.y}) scale(${scale})`}>
            <rect x={0} y={0} width={MAP_WIDTH} height={MAP_HEIGHT} fill="var(--color-surface)" />

            {aisles.map((a, i) => (
              <g key={i}>
                <rect x={a.x} y={a.y} width={a.w} height={a.h} fill="var(--color-surface-2)" />
                {a.label ? (
                  <text
                    x={a.x + a.w / 2}
                    y={a.y + a.h / 2 + 4}
                    textAnchor="middle"
                    className="text-[11px]"
                    fill="var(--color-muted-foreground)"
                    style={{ fontSize: 11, letterSpacing: "0.16em" }}
                  >
                    {a.label.toUpperCase()}
                  </text>
                ) : null}
              </g>
            ))}

            {facilities.map((f, i) => (
              <g key={i}>
                <rect
                  x={f.x}
                  y={f.y}
                  width={f.w}
                  height={f.h}
                  rx={4}
                  fill={facilityTone[f.tone]}
                  stroke="var(--color-border)"
                />
                <text
                  x={f.x + f.w / 2}
                  y={f.y + f.h / 2 + (f.sublabel ? -2 : 4)}
                  textAnchor="middle"
                  fill={facilityText[f.tone]}
                  style={{ fontSize: 12, fontWeight: 600 }}
                >
                  {f.label}
                </text>
                {f.sublabel ? (
                  <text
                    x={f.x + f.w / 2}
                    y={f.y + f.h / 2 + 14}
                    textAnchor="middle"
                    fill={facilityText[f.tone]}
                    style={{ fontSize: 10, opacity: 0.75 }}
                  >
                    {f.sublabel}
                  </text>
                ) : null}
              </g>
            ))}

            {stalls.map((s) => {
              const status = statusMap[s.id] ?? "AVAILABLE";
              const selected = selectedId === s.id;
              const available = status === "AVAILABLE";
              return (
                <g
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Space ${s.stallNumber}, ${statusLabel[status]}, ${formatMoney(s.price)}`}
                  className="outline-none"
                  style={{ cursor: available ? "pointer" : "not-allowed" }}
                  onClick={() => onSelect?.(s)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect?.(s);
                    }
                  }}
                  onMouseMove={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    setHover({ stall: s, x: e.clientX - rect.left, y: e.clientY - rect.top });
                  }}
                  onMouseLeave={() => setHover((h) => (h?.stall.id === s.id ? null : h))}
                >
                  <rect
                    x={s.x}
                    y={s.y}
                    width={s.w}
                    height={s.h}
                    rx={3}
                    fill={selected ? "var(--map-selected)" : stallFill[status]}
                    stroke={selected ? "var(--map-selected)" : "var(--map-available-border)"}
                    strokeWidth={selected ? 3 : 1.25}
                    opacity={available || selected ? 1 : 0.92}
                  />
                  <text
                    x={s.x + s.w / 2}
                    y={s.y + s.h / 2 + 1}
                    textAnchor="middle"
                    fill={selected ? "var(--color-primary-foreground)" : "var(--color-foreground)"}
                    style={{ fontSize: 14, fontWeight: 700 }}
                  >
                    {s.stallNumber}
                  </text>
                  <text
                    x={s.x + s.w / 2}
                    y={s.y + s.h / 2 + 16}
                    textAnchor="middle"
                    fill={selected ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)"}
                    style={{ fontSize: 9.5 }}
                  >
                    {s.size}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {hover ? (
          <div
            className="pointer-events-none absolute z-10 w-52 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-md border border-border bg-popover p-3 text-left shadow-lg"
            style={{ left: hover.x, top: hover.y }}
          >
            <p className="text-sm font-bold">Space {hover.stall.stallNumber}</p>
            <p className="text-[11px] text-muted-foreground">{hover.stall.zone}</p>
            <dl className="mt-2 space-y-1 text-[11px]">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium">{hover.stall.category}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Size</dt>
                <dd className="font-medium">{hover.stall.size}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Price</dt>
                <dd className="font-medium">{formatMoney(hover.stall.price)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-semibold">{statusLabel[statusMap[hover.stall.id] ?? "AVAILABLE"]}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-sm border border-border bg-background shadow-sm">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => stepZoom(1.25)}
            className="flex h-9 w-9 items-center justify-center hover:bg-secondary"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => stepZoom(1 / 1.25)}
            className="flex h-9 w-9 items-center justify-center border-t border-border hover:bg-secondary"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Reset view"
            onClick={reset}
            className="flex h-9 w-9 items-center justify-center border-t border-border hover:bg-secondary"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        <p className="pointer-events-none absolute left-3 top-3 rounded-sm border border-border bg-background/85 px-2 py-1 text-[11px] text-muted-foreground">
          Scroll or pinch to zoom · drag to pan
        </p>
      </div>
    </div>
  );
}
