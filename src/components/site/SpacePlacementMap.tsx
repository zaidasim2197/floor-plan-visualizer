import { useId, useRef, useState, type PointerEvent } from "react";
import { CheckCircle2, AlertTriangle, Move, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAP_WIDTH, MAP_HEIGHT } from "@/data/floor-plan";
import type { Stall } from "@/lib/booking-types";
import { placementFeedback, restrictedAreas, snapPosition } from "@/lib/space-placement";

export function SpacePlacementMap({
  draft,
  spaces,
  onMove,
}: {
  draft: Stall;
  spaces: Stall[];
  onMove: (position: { x: number; y: number }) => void;
}) {
  const id = useId().replaceAll(":", "");
  const initial = useRef({ x: draft.x, y: draft.y });
  const gesture = useRef<{
    pointer: number;
    dx: number;
    dy: number;
    start: { x: number; y: number };
  } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const feedback = placementFeedback(draft, spaces);
  const clashIds = new Set(feedback.clashes.map((area) => area.id));
  const color = feedback.valid ? "var(--primary)" : "var(--destructive)";
  const point = (e: PointerEvent<SVGSVGElement>) => {
    const matrix = e.currentTarget.getScreenCTM();
    if (!matrix) return null;
    return new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
  };
  const end = (e: PointerEvent<SVGSVGElement>, cancelled = false) => {
    if (gesture.current?.pointer !== e.pointerId) return;
    if (cancelled) onMove(gesture.current.start);
    gesture.current = null;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };
  return (
    <section className="space-y-3" aria-label="Visual space placement">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Move className="h-4 w-4 text-primary" /> Place your space
          </h3>
          <p id={`${id}-help`} className="mt-1 text-xs text-muted-foreground">
            Click or tap to place. Drag to move. Arrow keys fine-tune; Shift moves faster.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Zoom placement map out"
            disabled={zoom <= 1}
            onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Zoom placement map in"
            disabled={zoom >= 3}
            onClick={() => setZoom((z) => Math.min(3, z + 0.5))}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Reset space position"
            onClick={() => onMove(initial.current)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="max-h-[52vh] overflow-auto rounded-xl border border-border bg-surface-2 p-2">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          width={`${zoom * 100}%`}
          style={{
            minWidth: 480,
            maxWidth: "none",
            touchAction: "none",
            cursor: dragging ? "grabbing" : "crosshair",
          }}
          className="block select-none rounded-lg bg-card outline-none focus-visible:ring-2 focus-visible:ring-primary"
          tabIndex={0}
          role="group"
          aria-label="Space placement map"
          aria-describedby={`${id}-help ${id}-status`}
          onPointerDown={(e) => {
            if (!e.isPrimary || e.button !== 0) return;
            const p = point(e);
            if (!p) return;
            e.preventDefault();
            e.currentTarget.focus({ preventScroll: true });
            const inside =
              p.x >= draft.x &&
              p.x <= draft.x + draft.w &&
              p.y >= draft.y &&
              p.y <= draft.y + draft.h;
            gesture.current = {
              pointer: e.pointerId,
              dx: inside ? p.x - draft.x : draft.w / 2,
              dy: inside ? p.y - draft.y : draft.h / 2,
              start: { x: draft.x, y: draft.y },
            };
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(true);
            if (!inside) onMove(snapPosition(p.x - draft.w / 2, p.y - draft.h / 2));
          }}
          onPointerMove={(e) => {
            const drag = gesture.current;
            if (!drag || drag.pointer !== e.pointerId) return;
            const p = point(e);
            if (p) onMove(snapPosition(p.x - drag.dx, p.y - drag.dy));
          }}
          onPointerUp={(e) => end(e)}
          onPointerCancel={(e) => end(e, true)}
          onLostPointerCapture={() => {
            gesture.current = null;
            setDragging(false);
          }}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 20 : 5;
            const moves: Record<string, [number, number]> = {
              ArrowLeft: [-step, 0],
              ArrowRight: [step, 0],
              ArrowUp: [0, -step],
              ArrowDown: [0, step],
            };
            const delta = moves[e.key];
            if (delta) {
              e.preventDefault();
              onMove({ x: draft.x + delta[0], y: draft.y + delta[1] });
            }
          }}
        >
          <defs>
            <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r=".8" fill="var(--border)" />
            </pattern>
            <pattern
              id={`${id}-restricted`}
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="12"
                stroke="var(--muted-foreground)"
                strokeWidth="2"
                opacity=".18"
              />
            </pattern>
            <pattern
              id={`${id}-invalid`}
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="12"
                stroke="var(--destructive)"
                strokeWidth="4"
                opacity=".25"
              />
            </pattern>
          </defs>
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill={`url(#${id}-grid)`} />
          <rect
            x="1"
            y="1"
            width={MAP_WIDTH - 2}
            height={MAP_HEIGHT - 2}
            fill="none"
            stroke={feedback.outside ? "var(--destructive)" : "var(--border)"}
            strokeWidth={feedback.outside ? 5 : 2}
          />
          {restrictedAreas.map((area) => (
            <g key={area.id}>
              <rect
                x={area.x}
                y={area.y}
                width={area.w}
                height={area.h}
                rx="3"
                fill={clashIds.has(area.id) ? "var(--destructive)" : "var(--muted)"}
                fillOpacity={clashIds.has(area.id) ? 0.2 : 1}
                stroke={clashIds.has(area.id) ? "var(--destructive)" : "var(--border)"}
                strokeWidth={clashIds.has(area.id) ? 3 : 1}
              />
              <rect
                x={area.x}
                y={area.y}
                width={area.w}
                height={area.h}
                fill={`url(#${id}-restricted)`}
              />
              <text
                x={area.x + area.w / 2}
                y={area.y + area.h / 2}
                dominantBaseline="middle"
                textAnchor="middle"
                fill="var(--muted-foreground)"
                fontSize={area.kind === "corridor" ? 10 : 12}
                transform={
                  area.h > area.w * 2
                    ? `rotate(-90 ${area.x + area.w / 2} ${area.y + area.h / 2})`
                    : undefined
                }
              >
                {area.label}
              </text>
            </g>
          ))}
          {spaces
            .filter((s) => s.id !== draft.id)
            .map((s) => (
              <g key={s.id}>
                <rect
                  x={s.x}
                  y={s.y}
                  width={s.w}
                  height={s.h}
                  rx="4"
                  fill={clashIds.has(s.id) ? "var(--destructive)" : "var(--map-available)"}
                  fillOpacity={clashIds.has(s.id) ? 0.2 : 1}
                  stroke={clashIds.has(s.id) ? "var(--destructive)" : "var(--map-available-border)"}
                  strokeWidth={clashIds.has(s.id) ? 3 : 1}
                />
                <text
                  x={s.x + s.w / 2}
                  y={s.y + s.h / 2}
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="var(--foreground)"
                  fontSize="14"
                  fontWeight="600"
                >
                  {s.stallNumber}
                </text>
              </g>
            ))}
          <g
            aria-label={`Draft space ${draft.stallNumber || "New"}: ${feedback.valid ? "valid placement" : "invalid placement"}`}
            data-placement-valid={feedback.valid}
            style={{ cursor: dragging ? "grabbing" : "grab" }}
          >
            <rect
              x={draft.x}
              y={draft.y}
              width={draft.w}
              height={draft.h}
              rx="4"
              fill={color}
              fillOpacity=".18"
              stroke={color}
              strokeWidth="4"
              strokeDasharray={feedback.valid ? undefined : "8 4"}
            />
            {!feedback.valid && (
              <rect
                x={draft.x}
                y={draft.y}
                width={draft.w}
                height={draft.h}
                fill={`url(#${id}-invalid)`}
              />
            )}
            <text
              x={draft.x + draft.w / 2}
              y={draft.y + draft.h / 2 - 6}
              textAnchor="middle"
              fill={color}
              fontWeight="800"
              fontSize="15"
            >
              {draft.stallNumber || "New space"}
            </text>
            <text
              x={draft.x + draft.w / 2}
              y={draft.y + draft.h / 2 + 13}
              textAnchor="middle"
              fill={color}
              fontSize="11"
            >
              {feedback.valid ? "✓ Move me" : "✕ Blocked"}
            </text>
          </g>
        </svg>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span>▨ Corridors & facilities · keep clear</span>
        <span className="text-primary">● Green · valid position</span>
        <span className="text-destructive">● Red · placement blocked</span>
      </div>
      <p
        id={`${id}-status`}
        role="status"
        aria-live="polite"
        className={`flex items-start gap-2 rounded-lg border p-3 text-xs font-medium ${feedback.valid ? "border-primary/20 bg-primary/5 text-primary" : "border-destructive/25 bg-destructive/5 text-destructive"}`}
      >
        {feedback.valid ? (
          <CheckCircle2 className="h-4 w-4 shrink-0" />
        ) : (
          <AlertTriangle className="h-4 w-4 shrink-0" />
        )}
        {feedback.message}
      </p>
    </section>
  );
}
