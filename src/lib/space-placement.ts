import { aisles, facilities, MAP_WIDTH, MAP_HEIGHT } from "@/data/floor-plan";
import type { Stall } from "@/lib/booking-types";

export interface MapRect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface PlacementObstacle extends MapRect {
  id: string;
  label: string;
  kind: "corridor" | "facility" | "stall";
}
export const restrictedAreas: PlacementObstacle[] = [
  ...aisles.map((area, i) => ({
    ...area,
    id: `corridor-${i}`,
    label: area.label || `Corridor ${i + 1}`,
    kind: "corridor" as const,
  })),
  ...facilities.map((area, i) => ({ ...area, id: `facility-${i}`, kind: "facility" as const })),
];
export function rectanglesOverlap(a: MapRect, b: MapRect) {
  // Touching edges are allowed; only occupied area counts as a collision.
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
export function placementFeedback(draft: MapRect & { id: string }, spaces: Stall[]) {
  const outside =
    ![draft.x, draft.y, draft.w, draft.h].every(Number.isFinite) ||
    draft.w < 20 ||
    draft.h < 20 ||
    draft.x < 0 ||
    draft.y < 0 ||
    draft.x + draft.w > MAP_WIDTH ||
    draft.y + draft.h > MAP_HEIGHT;
  const obstacles: PlacementObstacle[] = [
    ...restrictedAreas,
    ...spaces
      .filter((s) => s.id !== draft.id)
      .map((s) => ({ ...s, label: `Space ${s.stallNumber}`, kind: "stall" as const })),
  ];
  const clashes = obstacles.filter((area) => rectanglesOverlap(draft, area));
  return {
    valid: !outside && clashes.length === 0,
    outside,
    clashes,
    message: outside
      ? "Keep the entire space inside the map, with a valid size."
      : clashes.length
        ? `Cannot place here: ${clashes.map((area) => area.label).join(", ")}.`
        : "Clear placement — ready to save.",
  };
}
export function snapPosition(x: number, y: number) {
  return { x: Math.round(x / 5) * 5, y: Math.round(y / 5) * 5 };
}
export function samePlacement(a: MapRect, b: MapRect) {
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}
export function firstClearPosition(spaces: Stall[], w = 90, h = 80) {
  for (let y = 180; y + h <= MAP_HEIGHT; y += 10) {
    for (let x = 120; x + w <= MAP_WIDTH; x += 10) {
      if (placementFeedback({ id: "", x, y, w, h }, spaces).valid) return { x, y };
    }
  }
  return { x: 120, y: 180 }; // A full map opens with visible collision feedback, never a silent save.
}
