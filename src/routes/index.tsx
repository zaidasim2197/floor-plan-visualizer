import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import { FloorMap, FloorMapLegend } from "@/components/site/FloorMap";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { eventConfig } from "@/config/event";
import { metrics, stallStatusMap, useBookingState } from "@/lib/booking-store";

const title = `${eventConfig.name} — Exhibition Space Booking`;
const description = `${eventConfig.tagline} Reserve your stall for ${eventConfig.dateLabel} at ${eventConfig.venue.name}, ${eventConfig.venue.city}.`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  const state = useBookingState();
  const statusMap = useMemo(() => stallStatusMap(state.bookings), [state.bookings]);
  const stats = useMemo(() => metrics(state.bookings), [state.bookings]);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="eyebrow">{eventConfig.edition}</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              {eventConfig.name}
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground">{eventConfig.description}</p>

            <ul className="mt-8 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-primary" />
                {eventConfig.dateLabel} · {eventConfig.timeLabel}
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                {eventConfig.venue.name}, {eventConfig.venue.city}
              </li>
              <li className="flex items-center gap-3">
                <Users className="h-4 w-4 text-primary" />
                {stats.available} of {stats.total} exhibition spaces still available
              </li>
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/floor-plan">
                  Book your space <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/about">About the expo</Link>
              </Button>
            </div>
          </div>

          <div>
            <FloorMap statusMap={statusMap} className="h-full" />
            <FloorMapLegend className="mt-4" />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">How booking works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Pick your space", "Zoom into the interactive floor plan and select any available stall to see its size and price."],
            ["Hold it instantly", `Submit your details and the space is held for ${eventConfig.booking.paymentPendingMinutes} minutes while you pay.`],
            ["Get confirmed", "Send your payment receipt. Once the organiser verifies it, your booking is confirmed."],
          ].map(([heading, body], i) => (
            <article key={heading} className="rounded-md border border-border bg-card p-6">
              <span className="text-xs font-bold text-copper">0{i + 1}</span>
              <h3 className="mt-2 text-lg font-bold">{heading}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
