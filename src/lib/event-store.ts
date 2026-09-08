import { placementFeedback, samePlacement } from "@/lib/space-placement";
import { useSyncExternalStore } from "react";
import { z } from "zod";
import { applyEventConfig, defaultEventConfig, type EventConfig } from "@/config/event";
import { applyStalls, defaultStalls } from "@/data/floor-plan";
import type { Stall } from "@/lib/booking-types";

export interface ManagedEvent {
  id: string;
  config: EventConfig;
  spaces: Stall[];
  sample?: boolean;
}
interface Catalog {
  events: ManagedEvent[];
  activeId: string;
  revision: number;
}
const KEY = "venueflow-event-catalog-v1";
export const DEFAULT_EVENT_ID = "business-expo";
const secondSpaces: Stall[] = Array.from({ length: 12 }, (_, i) => ({
  id: `M${String(i + 1).padStart(2, "0")}`,
  stallNumber: `M${String(i + 1).padStart(2, "0")}`,
  category: i < 4 ? "Corner Stall" : "Compact Pod",
  size: i < 4 ? "3m x 3m" : "2m x 2m",
  price: i < 4 ? 45000 : 25000,
  x: [120, 380, 680, 960][i % 4]!,
  y: 180 + Math.floor(i / 4) * 90,
  w: 90,
  h: 80,
  zone: i < 4 ? "Design studios" : "Artisan market",
}));
export function sampleEvents(): ManagedEvent[] {
  return [
    {
      id: DEFAULT_EVENT_ID,
      config: structuredClone(defaultEventConfig),
      spaces: structuredClone(defaultStalls),
      sample: true,
    },
    {
      id: "makers-market",
      sample: true,
      spaces: secondSpaces,
      config: {
        ...structuredClone(defaultEventConfig),
        name: "Lahore Makers Market 2027",
        edition: "Spring 2027",
        tagline: "Independent design. Local craft. A shared creative space.",
        description:
          "Discover independent ceramics, textiles, homeware and illustration from local makers in a one-day curated market.",
        startDate: "2027-03-20T10:00:00+05:00",
        endDate: "2027-03-20T20:00:00+05:00",
        dateLabel: "20 March 2027",
        timeLabel: "10:00 – 20:00 PKT",
        venue: {
          name: "Garden Pavilion",
          city: "Lahore, Pakistan",
          address: "12 Garden Avenue, Gulberg, Lahore",
        },
        contact: {
          email: "hello@makers.example",
          phone: "+92 42 5550 1200",
          whatsapp: ["+92 300 5551200"],
        },
        booking: { paymentPendingMinutes: 45, paymentReviewGraceHours: 24 },
        floorPlanLabel: "Makers Market Layout",
      },
    },
  ];
}
let catalog: Catalog | null = null;
const listeners = new Set<() => void>();
export function activeEventId() {
  return catalog?.activeId ?? DEFAULT_EVENT_ID;
}
export function activeEvent() {
  const current = catalog;
  return current?.events.find((e) => e.id === current.activeId);
}
function apply() {
  const event = activeEvent();
  if (event) {
    applyEventConfig(event.config);
    applyStalls(event.spaces);
  }
}
export function initializeEvents() {
  if (catalog || typeof window === "undefined") return;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null") as Catalog | null;
    if (
      raw?.events?.length &&
      raw.events.some((e) => e.id === raw.activeId) &&
      raw.events.every((e) => e.config?.name && Array.isArray(e.spaces))
    )
      catalog = raw;
  } catch {
    /* Recover to the sample catalog if storage is unavailable. */
  }
  catalog ??= { events: sampleEvents(), activeId: DEFAULT_EVENT_ID, revision: 0 };
  apply();
  listeners.forEach((l) => l());
}
function commit(next: Catalog) {
  // Do not claim that configuration was saved when browser storage is full.
  localStorage.setItem(KEY, JSON.stringify(next));
  catalog = next;
  apply();
  listeners.forEach((l) => l());
}
export function selectEvent(id: string) {
  if (!catalog?.events.some((e) => e.id === id)) throw new Error("Event not found.");
  commit({ ...catalog, activeId: id, revision: catalog.revision + 1 });
}
export const eventFormSchema = z
  .object({
    name: z.string().trim().min(3).max(120),
    description: z.string().trim().min(10).max(2000),
    venue: z.string().trim().min(2),
    city: z.string().trim().min(2),
    address: z.string().trim().min(5),
    email: z.string().trim().email(),
    phone: z.string().trim().min(7),
    whatsapp: z.string().regex(/^\+?[\d\s-]{7,20}$/, "Enter a valid WhatsApp number"),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    holdMinutes: z.coerce.number().int().min(5).max(1440),
  })
  .refine(
    (v) =>
      Number.isFinite(Date.parse(v.startDate)) && Date.parse(v.endDate) > Date.parse(v.startDate),
    { message: "End time must be after start time.", path: ["endDate"] },
  );
export type EventForm = z.infer<typeof eventFormSchema>;
export function saveEvent(input: EventForm, id?: string) {
  const data = eventFormSchema.parse(input);
  if (!catalog) throw new Error("Event catalog is not ready.");
  const previous = catalog.events.find((e) => e.id === id);
  const base = previous?.config ?? structuredClone(defaultEventConfig);
  // Event times are entered in Pakistan time, independent of the operator's device timezone.
  const startDate = data.startDate.slice(0, 16) + ":00+05:00";
  const endDate = data.endDate.slice(0, 16) + ":00+05:00";
  const dateFormat = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Karachi",
  });
  const event: ManagedEvent = {
    id: previous?.id ?? crypto.randomUUID(),
    spaces: previous?.spaces ?? [],
    ...(previous?.sample ? { sample: true } : {}),
    config: {
      ...base,
      name: data.name,
      description: data.description,
      tagline: previous?.config.tagline ?? data.description,
      edition: `${startDate.slice(0, 4)} Edition`,
      startDate,
      endDate,
      dateLabel: dateFormat.formatRange(new Date(startDate), new Date(endDate)),
      timeLabel: `${data.startDate.slice(11, 16)} – ${data.endDate.slice(11, 16)} PKT`,
      venue: { name: data.venue, city: data.city, address: data.address },
      contact: { email: data.email, phone: data.phone, whatsapp: [data.whatsapp] },
      booking: { ...base.booking, paymentPendingMinutes: data.holdMinutes },
      floorPlanLabel: `${data.name} layout`,
    },
  };
  commit({
    events: previous
      ? catalog.events.map((e) => (e.id === id ? event : e))
      : [...catalog.events, event],
    activeId: event.id,
    revision: catalog.revision + 1,
  });
  return event;
}
export const spaceSchema = z
  .object({
    id: z.string().trim().min(1),
    stallNumber: z.string().trim().min(1).max(20),
    category: z.enum([
      "Premium Island",
      "Standard Exhibition Stall",
      "Compact Pod",
      "Corner Stall",
    ]),
    size: z.string().trim().min(2).max(60),
    zone: z.string().trim().min(2).max(100),
    price: z.coerce.number().finite().min(0).max(100000000),
    x: z.coerce.number().min(0),
    y: z.coerce.number().min(0),
    w: z.coerce.number().min(20),
    h: z.coerce.number().min(20),
  })
  .refine(
    (s) => s.x + s.w <= 1200 && s.y + s.h <= 800,
    "Space must fit inside the 1200 × 800 map.",
  );
export function saveSpaces(spaces: Stall[]) {
  if (!catalog) throw new Error("Event catalog is not ready.");
  spaces.forEach((s) => spaceSchema.parse(s));
  if (new Set(spaces.map((s) => s.id)).size !== spaces.length)
    throw new Error("Space identifiers must be unique within this event.");
  if (new Set(spaces.map((s) => s.stallNumber.toLowerCase())).size !== spaces.length)
    throw new Error("Space numbers must be unique within this event.");
  if (
    spaces.some((s, i) =>
      spaces
        .slice(i + 1)
        .some(
          (other) =>
            s.x < other.x + other.w &&
            s.x + s.w > other.x &&
            s.y < other.y + other.h &&
            s.y + s.h > other.y,
        ),
    )
  )
    throw new Error("Space positions overlap. Adjust their map coordinates.");
  // Existing legacy geometry stays intact; every new or moved/resized space must be valid.
  for (const space of spaces) {
    const previous = activeEvent()?.spaces.find((s) => s.id === space.id);
    if (!previous || !samePlacement(previous, space)) {
      const result = placementFeedback(space, spaces);
      if (!result.valid) throw new Error(result.message);
    }
  }
  commit({
    ...catalog,
    events: catalog.events.map((e) => (e.id === catalog?.activeId ? { ...e, spaces } : e)),
    revision: catalog.revision + 1,
  });
}
export function useEventCatalog() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => catalog,
    () => null,
  );
}
