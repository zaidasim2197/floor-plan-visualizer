import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FloorMap, FloorMapLegend } from "@/components/site/FloorMap";
import { SiteLayout } from "@/components/site/SiteLayout";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
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
  const statusMap = useMemo(() => stallStatusMap(state.bookings), [state.bookings]);
  const stats = useMemo(() => metrics(state.bookings), [state.bookings]);
  const [selected, setSelected] = useState<Stall | null>(null);
  const [zone, setZone] = useState<string>("All zones");

  const zones = useMemo(() => ["All zones", ...Array.from(new Set(stalls.map((s) => s.zone)))], []);
  const list = useMemo(
    () => stalls.filter((s) => zone === "All zones" || s.zone === zone),
    [zone],
  );

  const selectedStatus = selected ? statusMap[selected.id] ?? "AVAILABLE" : null;

  return (
    <SiteLayout>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <p className="eyebrow">{eventConfig.floorPlanLabel}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Choose your exhibition space</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Total spaces", stats.total],
              ["Available", stats.available],
              ["Reserved", stats.paymentPending + stats.paymentReview],
              ["Confirmed", stats.confirmed],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-sm border border-border bg-background p-3">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-2xl font-extrabold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <FloorMap statusMap={statusMap} selectedId={selected?.id} onSelect={setSelected} />
          <FloorMapLegend className="mt-4" />

          <div className="mt-8">
            <div className="flex flex-wrap gap-2">
              {zones.map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZone(z)}
                  className={
                    "rounded-sm border px-3 py-1.5 text-xs font-semibold transition-colors " +
                    (zone === z
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-secondary")
                  }
                >
                  {z}
                </button>
              ))}
            </div>

            <div className="mt-4 overflow-x-auto rounded-md border border-border">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-surface-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Space</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Size</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setSelected(s)}
                      className="cursor-pointer border-t border-border hover:bg-secondary/60"
                    >
                      <td className="px-3 py-2 font-semibold">{s.stallNumber}</td>
                      <td className="px-3 py-2 text-muted-foreground">{s.category}</td>
                      <td className="px-3 py-2 text-muted-foreground">{s.size}</td>
                      <td className="px-3 py-2">{formatMoney(s.price)}</td>
                      <td className="px-3 py-2">
                        <StatusBadge status={statusMap[s.id] ?? "AVAILABLE"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-md border border-border bg-card p-5">
            {!selected ? (
              <div className="text-sm text-muted-foreground">
                <p className="text-base font-bold text-foreground">Space details</p>
                <p className="mt-2">
                  Select any space on the map — or a row in the table — to see its type, size, price and live
                  availability here.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow">{selected.zone}</p>
                    <p className="text-2xl font-extrabold tracking-tight">Space {selected.stallNumber}</p>
                  </div>
                  <StatusBadge status={selectedStatus!} />
                </div>

                <dl className="mt-5 space-y-3 text-sm">
                  <Row label="Type" value={selected.category} />
                  <Row label="Size" value={selected.size} />
                  <Row label="Price" value={formatMoney(selected.price)} />
                  <Row
                    label="Hold window"
                    value={`${eventConfig.booking.paymentPendingMinutes} minutes`}
                  />
                </dl>

                <div className="mt-6 space-y-2">
                  <Button className="w-full" disabled={selectedStatus !== "AVAILABLE"}>
                    {selectedStatus === "AVAILABLE" ? "Reserve this space" : "Not available"}
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a
                      href={whatsappLink(
                        eventConfig.contact.whatsapp[0],
                        `Hello, I'm interested in space ${selected.stallNumber} at ${eventConfig.name}.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Enquire on WhatsApp
                    </a>
                  </Button>
                </div>

                <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                  Reserving a space places a temporary hold only. The booking is confirmed once payment is verified
                  by the organiser.
                </p>
              </div>
            )}
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
