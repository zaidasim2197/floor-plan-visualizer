import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, AlertTriangle, Shield, HelpCircle } from "lucide-react";
import { FloorMap, FloorMapLegend } from "@/components/site/FloorMap";
import { SiteLayout } from "@/components/site/SiteLayout";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { eventConfig, whatsappLink } from "@/config/event";
import { stalls } from "@/data/floor-plan";
import { formatMoney } from "@/lib/booking-format";
import type { Stall } from "@/lib/booking-types";
import { stallStatusMap, useBookingState, metrics } from "@/lib/booking-store";

const title = "Interactive Floor Plan — Book Your Exhibition Space";
const description =
  "Explore the exhibition hall, zoom into any zone, compare stall sizes and prices, and reserve an available space in real time.";

export const Route = createFileRoute("/floor-plan")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: FloorPlanPage,
});

function FloorPlanPage() {
  const state = useBookingState();
  const navigate = useNavigate();
  const statusMap = useMemo(() => stallStatusMap(state.bookings), [state.bookings]);
  const stats = useMemo(() => metrics(state.bookings), [state.bookings]);
  const [selected, setSelected] = useState<Stall | null>(stalls[0] ?? null);
  const [zone, setZone] = useState<string>("All zones");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  const zones = useMemo(() => ["All zones", ...Array.from(new Set(stalls.map((s) => s.zone)))], []);
  const list = useMemo(
    () => stalls.filter((s) => zone === "All zones" || s.zone === zone),
    [zone],
  );

  const selectedStatus = selected ? statusMap[selected.id] ?? "AVAILABLE" : null;

  const handleSelectStall = (stall: Stall) => {
    setSelected(stall);
    setMobileDrawerOpen(true);
  };

  const handleStartBooking = (stallId: string) => {
    navigate({ to: "/book/$stallId", params: { stallId } });
  };

  return (
    <SiteLayout>
      <section className="border-b border-border bg-surface overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <p className="eyebrow">{eventConfig.floorPlanLabel}</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-4xl">Choose Your Exhibition Space</h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-2xl">{description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
            {[
              ["Total spaces", stats.total],
              ["Available", stats.available],
              ["Reserved", stats.paymentPending + stats.paymentReview],
              ["Confirmed", stats.confirmed],
            ].map(([label, value]) => (
              <div key={label as string} className="min-w-0 rounded-md border border-border bg-background p-2.5 sm:p-3.5 shadow-xs overflow-hidden">
                <dt className="truncate text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-xl sm:text-2xl font-extrabold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <FloorMap statusMap={statusMap} selectedId={selected?.id ?? null} onSelect={handleSelectStall} />
          <FloorMapLegend className="mt-4" />

          <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-bold text-foreground">Stall Directory & Availability</h2>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {zones.map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZone(z)}
                    className={
                      "whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors " +
                      (zone === z
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-secondary")
                    }
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
              <table className="w-full min-w-[500px] text-left text-xs sm:text-sm">
                <thead className="bg-surface-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-3 sm:px-4 py-3">Space</th>
                    <th className="px-3 sm:px-4 py-3">Type</th>
                    <th className="px-3 sm:px-4 py-3">Size</th>
                    <th className="px-3 sm:px-4 py-3">Price</th>
                    <th className="px-3 sm:px-4 py-3">Status</th>
                    <th className="px-3 sm:px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {list.map((s) => {
                    const status = statusMap[s.id] ?? "AVAILABLE";
                    const isSelected = selected?.id === s.id;
                    return (
                      <tr
                        key={s.id}
                        onClick={() => handleSelectStall(s)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/5 font-medium" : "hover:bg-secondary/60"
                        }`}
                      >
                        <td className="px-3 sm:px-4 py-3 font-extrabold text-foreground">{s.stallNumber}</td>
                        <td className="px-3 sm:px-4 py-3 text-muted-foreground">{s.category}</td>
                        <td className="px-3 sm:px-4 py-3 text-muted-foreground">{s.size}</td>
                        <td className="px-3 sm:px-4 py-3 font-semibold">{formatMoney(s.price)}</td>
                        <td className="px-3 sm:px-4 py-3">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-right">
                          {status === "AVAILABLE" ? (
                            <Button
                              size="sm"
                              className="h-7 sm:h-8 text-xs font-bold"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartBooking(s.id);
                              }}
                            >
                              Book Space
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Unavailable</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            {!selected ? (
              <div className="text-sm text-muted-foreground">
                <p className="text-base font-bold text-foreground">Space Details</p>
                <p className="mt-2">
                  Select any space on the map or in the table to view dimensions, category, pricing, and live hold availability.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <p className="eyebrow text-primary">{selected.zone}</p>
                    <p className="text-2xl font-extrabold tracking-tight text-foreground">Space {selected.stallNumber}</p>
                  </div>
                  <StatusBadge status={selectedStatus!} />
                </div>

                <dl className="mt-5 space-y-3 text-sm">
                  <Row label="Type" value={selected.category} />
                  <Row label="Dimensions" value={selected.size} />
                  <Row label="Price" value={formatMoney(selected.price)} />
                  <Row
                    label="Temporary Hold"
                    value={`${eventConfig.booking.paymentPendingMinutes} Minutes`}
                  />
                </dl>

                <div className="mt-6 space-y-3">
                  {selectedStatus === "AVAILABLE" ? (
                    <Button
                      className="w-full h-11 font-bold text-sm"
                      onClick={() => handleStartBooking(selected.id)}
                    >
                      Reserve Space {selected.stallNumber} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button className="w-full h-11 font-bold text-sm" disabled>
                      Currently Unavailable
                    </Button>
                  )}

                  <Button asChild variant="outline" className="w-full h-11 font-bold text-sm">
                    <a
                      href={whatsappLink(
                        eventConfig.contact.whatsapp[0],
                        `Hello, I am inquiring about exhibition space ${selected.stallNumber} (${selected.category}) at ${eventConfig.name}.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Enquire on WhatsApp
                    </a>
                  </Button>
                </div>

                <div className="mt-6 rounded-md bg-secondary p-3 text-[11px] leading-relaxed text-muted-foreground">
                  <p className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
                    <Shield className="h-3.5 w-3.5 text-primary" /> Booking Protection Policy
                  </p>
                  Submitting a booking request places an instant temporary hold for {eventConfig.booking.paymentPendingMinutes} minutes. The booking is confirmed once payment verification is completed by the organiser.
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Stall Detail & Booking Modal Drawer */}
        <Dialog open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <DialogContent className="sm:max-w-md rounded-t-2xl sm:rounded-xl max-h-[90vh] overflow-y-auto p-5">
            {selected && (
              <div>
                <DialogHeader className="border-b border-border pb-3 text-left">
                  <div className="flex items-center justify-between gap-2 pr-6">
                    <div>
                      <p className="eyebrow text-primary text-[10px] sm:text-xs">{selected.zone}</p>
                      <DialogTitle className="text-xl font-extrabold text-foreground">
                        Space {selected.stallNumber}
                      </DialogTitle>
                    </div>
                    <StatusBadge status={selectedStatus!} />
                  </div>
                  <DialogDescription className="text-xs mt-1 text-muted-foreground">
                    {selected.category} · {selected.size}
                  </DialogDescription>
                </DialogHeader>

                <dl className="my-4 space-y-2 text-xs sm:text-sm">
                  <Row label="Space Number" value={selected.stallNumber} />
                  <Row label="Type" value={selected.category} />
                  <Row label="Dimensions" value={selected.size} />
                  <Row label="Price" value={formatMoney(selected.price)} />
                  <Row label="Temporary Hold" value={`${eventConfig.booking.paymentPendingMinutes} Minutes`} />
                </dl>

                <div className="mt-5 space-y-2.5">
                  {selectedStatus === "AVAILABLE" ? (
                    <Button
                      className="w-full h-11 font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        handleStartBooking(selected.id);
                      }}
                    >
                      Reserve Space {selected.stallNumber} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button className="w-full h-11 font-bold text-sm" disabled>
                      Currently Unavailable
                    </Button>
                  )}

                  <Button asChild variant="outline" className="w-full h-10 font-bold text-xs">
                    <a
                      href={whatsappLink(
                        eventConfig.contact.whatsapp[0],
                        `Hello, I am inquiring about exhibition space ${selected.stallNumber} (${selected.category}) at ${eventConfig.name}.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Enquire on WhatsApp
                    </a>
                  </Button>
                </div>

                <div className="mt-4 rounded-md bg-secondary p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                  <p className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
                    <Shield className="h-3.5 w-3.5 text-primary" /> Booking Protection Policy
                  </p>
                  Instant temporary hold for {eventConfig.booking.paymentPendingMinutes} minutes upon reservation.
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </section>
    </SiteLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold text-foreground">{value}</dd>
    </div>
  );
}
