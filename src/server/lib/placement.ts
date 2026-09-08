/**
 * Server-side placement validation — mirrors src/lib/space-placement.ts exactly.
 * The frontend uses the client copy for instant drag-preview feedback.
 * The server re-runs the same check on every write so a stale UI or direct API
 * call cannot bypass it.
 */

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

export const MAP_WIDTH = 1200;
export const MAP_HEIGHT = 800;

/** Default facilities shared across all events (matches src/data/floor-plan.ts). */
export const DEFAULT_FACILITIES: PlacementObstacle[] = [
  { id: "facility-0", label: "Keynote Stage", x: 120, y: 60, w: 484, h: 90, kind: "facility" },
  { id: "facility-1", label: "Networking Lounge", x: 680, y: 60, w: 204, h: 90, kind: "facility" },
  { id: "facility-2", label: "Information Desk", x: 960, y: 60, w: 110, h: 90, kind: "facility" },
  { id: "facility-3", label: "Restrooms", x: 120, y: 470, w: 184, h: 70, kind: "facility" },
  { id: "facility-4", label: "Café & Refreshments", x: 380, y: 480, w: 224, h: 110, kind: "facility" },
  { id: "facility-5", label: "Seating & Meeting Points", x: 680, y: 480, w: 204, h: 110, kind: "facility" },
  { id: "facility-6", label: "Registration & Badge Collection", x: 380, y: 630, w: 504, h: 70, kind: "facility" },
  { id: "facility-7", label: "Main Entrance", x: 560, y: 720, w: 144, h: 50, kind: "facility" },
  { id: "facility-8", label: "Emergency Exit", x: 40, y: 620, w: 110, h: 44, kind: "facility" },
  { id: "facility-9", label: "Emergency Exit", x: 1000, y: 620, w: 110, h: 44, kind: "facility" },
];

export const DEFAULT_AISLES: PlacementObstacle[] = [
  { id: "corridor-0", label: "Corridor 1", x: 108, y: 440, w: 976, h: 24, kind: "corridor" },
  { id: "corridor-1", label: "Corridor 2", x: 320, y: 170, w: 44, h: 400, kind: "corridor" },
  { id: "corridor-2", label: "Corridor 3", x: 620, y: 170, w: 44, h: 400, kind: "corridor" },
  { id: "corridor-3", label: "Corridor 4", x: 900, y: 170, w: 44, h: 400, kind: "corridor" },
];

/** Touching edges are allowed; only overlapping occupied area is a collision. */
export function rectanglesOverlap(a: MapRect, b: MapRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export interface PlacementResult {
  valid: boolean;
  outside: boolean;
  clashes: PlacementObstacle[];
  message: string;
}

export function checkPlacement(
  draft: MapRect & { id: string },
  existingSpaces: Array<MapRect & { id: string; spaceNumber: string }>,
  facilities: PlacementObstacle[] = DEFAULT_FACILITIES,
  aisles: PlacementObstacle[] = DEFAULT_AISLES,
  canvasWidth = MAP_WIDTH,
  canvasHeight = MAP_HEIGHT,
): PlacementResult {
  const outside =
    !Number.isFinite(draft.x) ||
    !Number.isFinite(draft.y) ||
    !Number.isFinite(draft.w) ||
    !Number.isFinite(draft.h) ||
    draft.w < 20 ||
    draft.h < 20 ||
    draft.x < 0 ||
    draft.y < 0 ||
    draft.x + draft.w > canvasWidth ||
    draft.y + draft.h > canvasHeight;

  const obstacles: PlacementObstacle[] = [
    ...aisles,
    ...facilities,
    ...existingSpaces
      .filter((s) => s.id !== draft.id)
      .map((s) => ({
        ...s,
        label: `Space ${s.spaceNumber}`,
        kind: "stall" as const,
      })),
  ];

  const clashes = outside ? [] : obstacles.filter((o) => rectanglesOverlap(draft, o));

  return {
    valid: !outside && clashes.length === 0,
    outside,
    clashes,
    message: outside
      ? "Keep the entire space inside the map, with a valid size."
      : clashes.length
        ? `Cannot place here: ${clashes.map((c) => c.label).join(", ")}.`
        : "Clear placement — ready to save.",
  };
}
