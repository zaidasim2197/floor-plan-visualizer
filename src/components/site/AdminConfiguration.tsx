import { useState, type FormEvent } from "react";
import { Plus, Pencil, LayoutGrid, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  activeEvent,
  saveEvent,
  selectEvent,
  useEventCatalog,
  type EventForm,
} from "@/lib/event-store";
import { saveManagedSpaces as saveSpaces } from "@/lib/booking-store";
import { ACTIVE_STATUSES, type Booking, type Stall } from "@/lib/booking-types";
import { formatMoney } from "@/lib/booking-format";

import { SpacePlacementMap } from "@/components/site/SpacePlacementMap";
import { firstClearPosition, placementFeedback } from "@/lib/space-placement";

const selectClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
export function EventWorkspace() {
  const catalog = useEventCatalog();
  const event = activeEvent();
  const [editor, setEditor] = useState<"new" | "edit" | null>(null);
  if (!catalog || !event) return null;
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <Label
              htmlFor="event-workspace"
              className="text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              Event workspace
            </Label>
            <select
              id="event-workspace"
              value={event.id}
              onChange={(e) => {
                try {
                  selectEvent(e.target.value);
                } catch {
                  toast.error("Could not save event selection. Check browser storage.");
                }
              }}
              className="mt-1 block w-full max-w-lg bg-transparent py-1 pr-5 text-base font-bold"
            >
              {catalog.events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.config.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              {event.config.venue.city} · {event.config.dateLabel} · {event.spaces.length} spaces
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditor("edit")}>
            <Pencil className="h-4 w-4" /> Edit event
          </Button>
          <Button onClick={() => setEditor("new")}>
            <Plus className="h-4 w-4" /> Create event
          </Button>
        </div>
      </div>
      {editor && <EventEditor mode={editor} onClose={() => setEditor(null)} />}
    </section>
  );
}
function EventEditor({ mode, onClose }: { mode: "new" | "edit"; onClose: () => void }) {
  const current = mode === "edit" ? activeEvent() : undefined;
  const config = current?.config;
  const [form, setForm] = useState<EventForm>({
    name: config?.name ?? "",
    description: config?.description ?? "",
    venue: config?.venue.name ?? "",
    city: config?.venue.city ?? "",
    address: config?.venue.address ?? "",
    email: config?.contact.email ?? "",
    phone: config?.contact.phone ?? "",
    whatsapp: config?.contact.whatsapp[0] ?? "",
    startDate: config?.startDate.slice(0, 16) ?? "",
    endDate: config?.endDate.slice(0, 16) ?? "",
    holdMinutes: config?.booking.paymentPendingMinutes ?? 30,
  });
  const [error, setError] = useState("");
  const fields: [keyof EventForm, string, string][] = [
    ["name", "Event name", "text"],
    ["venue", "Venue name", "text"],
    ["city", "City / country", "text"],
    ["address", "Venue address", "text"],
    ["startDate", "Starts · Pakistan time", "datetime-local"],
    ["endDate", "Ends · Pakistan time", "datetime-local"],
    ["email", "Organiser email", "email"],
    ["phone", "Contact phone", "tel"],
    ["whatsapp", "WhatsApp number", "tel"],
    ["holdMinutes", "Reservation hold · minutes", "number"],
  ];
  const submit = (e: FormEvent) => {
    e.preventDefault();
    try {
      saveEvent(form, current?.id);
      toast.success(
        mode === "new"
          ? "Event created. Add spaces in Space management."
          : "Event updated across the booking site.",
      );
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.startsWith("[")
            ? "Check all fields. End time must follow start time; hold duration must be 5–1,440 minutes."
            : err.message
          : "Could not save event.",
      );
    }
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "new" ? "Create an event" : "Edit event setup"}</DialogTitle>
          <DialogDescription>
            Configure the details used throughout the booking experience. Prices are in PKR.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(([key, label, type]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`event-${key}`}>{label}</Label>
                <Input
                  id={`event-${key}`}
                  type={type}
                  required
                  value={form[key]}
                  min={type === "number" ? 5 : undefined}
                  max={type === "number" ? 1440 : undefined}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [key]: key === "holdMinutes" ? Number(e.target.value) : e.target.value,
                    })
                  }
                />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-description">Event description</Label>
            <Textarea
              id="event-description"
              required
              minLength={10}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{mode === "new" ? "Create event" : "Save changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SpaceManagement({ bookings }: { bookings: Booking[] }) {
  const event = activeEvent();
  const [editing, setEditing] = useState<Stall | "new" | null>(null);
  const [search, setSearch] = useState("");
  if (!event) return null;
  const spaces = event.spaces.filter((s) =>
    `${s.stallNumber} ${s.zone} ${s.category}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Space management</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Set inventory, pricing and map placement for this event. Existing booking amounts are
            preserved.
          </p>
        </div>
        <Button onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Add space
        </Button>
      </div>
      <Input
        aria-label="Search spaces"
        placeholder="Search space, category or zone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface-2 text-xs text-muted-foreground">
            <tr>
              {["Space", "Category / dimensions", "Zone", "Price", "Availability", ""].map(
                (label, i) => (
                  <th key={i} className="px-5 py-3 font-semibold">
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {spaces.map((s) => {
              const occupied = bookings.some(
                (b) => b.stallId === s.id && ACTIVE_STATUSES.includes(b.status),
              );
              return (
                <tr key={s.id}>
                  <td className="px-5 py-4 font-bold">{s.stallNumber}</td>
                  <td className="px-5 py-4">
                    {s.category}
                    <span className="mt-1 block text-xs text-muted-foreground">{s.size}</span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{s.zone}</td>
                  <td className="px-5 py-4 font-semibold">{formatMoney(s.price)}</td>
                  <td className="px-5 py-4">
                    <span className={occupied ? "text-warning-foreground" : "text-success"}>
                      {occupied ? "Reserved" : "Available"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Button size="sm" variant="outline" onClick={() => setEditing(s)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {spaces.length === 0 && (
          <div className="p-12 text-center">
            <LayoutGrid className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
            <p className="font-semibold">
              {event.spaces.length ? "No matching spaces" : "Build your event inventory"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {event.spaces.length
                ? "Try a different space, category or zone."
                : "Add your first space to make it available on the booking map."}
            </p>
          </div>
        )}
      </div>
      {editing && (
        <SpaceEditor space={editing} bookings={bookings} onClose={() => setEditing(null)} />
      )}
    </section>
  );
}
function SpaceEditor({
  space,
  bookings,
  onClose,
}: {
  space: Stall | "new";
  bookings: Booking[];
  onClose: () => void;
}) {
  const event = activeEvent()!;
  const [form, setForm] = useState<Stall>(
    space === "new"
      ? {
          id: crypto.randomUUID(),
          stallNumber: "",
          category: "Standard Exhibition Stall",
          size: "3m x 3m",
          price: 25000,
          zone: "Main hall",
          ...firstClearPosition(event.spaces),
          w: 90,
          h: 80,
        }
      : { ...space },
  );
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const hasHistory = bookings.some((b) => b.stallId === form.id);
  const placement = placementFeedback(form, event.spaces);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!placement.valid) {
      setError(placement.message);
      return;
    }
    try {
      saveSpaces(
        space === "new"
          ? [
              ...event.spaces,
              {
                ...form,
                id: form.stallNumber
                  .trim()
                  .toUpperCase()
                  .replace(/[^A-Z0-9_-]/g, "-"),
              },
            ]
          : event.spaces.map((s) => (s.id === form.id ? form : s)),
      );
      toast.success("Space saved.");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error && !err.message.startsWith("[")
          ? err.message
          : "Check all fields. Map bounds are 1200 × 800; width and height must be at least 20.",
      );
    }
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {space === "new" ? "Add a space" : `Edit space ${space.stallNumber}`}
          </DialogTitle>
          <DialogDescription>
            Place your space directly on the floor plan. Green means it fits; red marks a blocked
            position.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <SpacePlacementMap
            draft={form}
            spaces={event.spaces}
            onMove={(position) => {
              setForm((current) => ({ ...current, ...position }));
              setError("");
            }}
          />
          <div className="grid grid-cols-2 gap-4">
            {(
              [
                ["stallNumber", "Space number"],
                ["size", "Dimensions"],
                ["zone", "Zone"],
                ["price", "Price · PKR"],
                ["w", "Footprint width"],
                ["h", "Footprint height"],
              ] as const
            ).map(([key, label]) => (
              <div className="space-y-2" key={key}>
                <Label htmlFor={`space-${key}`}>{label}</Label>
                <Input
                  id={`space-${key}`}
                  required
                  type={typeof form[key] === "number" ? "number" : "text"}
                  min={0}
                  step="any"
                  value={form[key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [key]:
                        typeof form[key] === "number" ? Number(e.target.value) : e.target.value,
                    })
                  }
                />
              </div>
            ))}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="space-category">Category</Label>
              <select
                id="space-category"
                className={selectClass}
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as Stall["category"] })
                }
              >
                {["Standard Exhibition Stall", "Premium Island", "Compact Pod", "Corner Stall"].map(
                  (c) => (
                    <option key={c}>{c}</option>
                  ),
                )}
              </select>
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {space !== "new" && (
            <div className="border-t border-border pt-4">
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
                disabled={hasHistory}
                onClick={() => {
                  if (!deleteConfirm) {
                    setDeleteConfirm(true);
                    return;
                  }
                  try {
                    saveSpaces(event.spaces.filter((s) => s.id !== form.id));
                    toast.success("Space removed.");
                    onClose();
                  } catch {
                    setError("Could not save. Check browser storage.");
                  }
                }}
              >
                {deleteConfirm ? "Confirm removal" : "Remove space"}
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                {hasHistory
                  ? "Spaces with booking history cannot be removed."
                  : "Only unbooked spaces can be removed."}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!placement.valid}>
              Save space
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
