import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Users,
  Building2,
  TrendingUp,
  Target,
  Sparkles,
  CheckCircle2,
  BadgeCheck,
} from "lucide-react";
import { FloorMap, FloorMapLegend } from "@/components/site/FloorMap";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CountdownTimer } from "@/components/site/CountdownTimer";
import { Button } from "@/components/ui/button";
import { eventConfig, whatsappLink } from "@/config/event";
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
      {/* HERO SECTION */}
      <section className="border-b border-border bg-surface relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:py-20 items-center">
          <div className="lg:col-span-7">
            {/* <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{eventConfig.edition}</span>
            </div> */}

            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl text-foreground">
              {eventConfig.name}
            </h1>

            <p className="mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              {eventConfig.description}
            </p>

            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium">
              <li className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
                <CalendarDays className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold">Date & Time</p>
                  <p className="text-foreground font-semibold">{eventConfig.dateLabel}</p>
                </div>
              </li>
              <li className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold">Venue</p>
                  <p className="text-foreground font-semibold">{eventConfig.venue.name}</p>
                </div>
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="h-12 px-7 font-bold text-sm">
                <Link to="/floor-plan">
                  Book Your Space <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 font-bold text-sm">
                <Link to="/floor-plan">Explore Floor Plan</Link>
              </Button>
            </div>
            {/* 
            <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                <BadgeCheck className="h-4 w-4" /> Real-Time Hold Verification
              </span>
              <span>•</span>
              <span>{stats.available} of {stats.total} Spaces Available</span>
            </div> */}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <CountdownTimer />
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Availability</p>
                  <p className="text-sm font-extrabold text-foreground">{stats.available} Available / {stats.total} Total</p>
                </div>
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-emerald-500/10 p-2.5">
                  <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300">{stats.available}</p>
                  <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Available</p>
                </div>
                <div className="rounded-md bg-amber-500/10 p-2.5">
                  <p className="text-xl font-extrabold text-amber-800 dark:text-amber-300">
                    {stats.paymentPending + stats.paymentReview}
                  </p>
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">On Hold</p>
                </div>
                <div className="rounded-md bg-blue-500/10 p-2.5">
                  <p className="text-xl font-extrabold text-blue-800 dark:text-blue-300">{stats.confirmed}</p>
                  <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">Confirmed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY EXHIBIT SECTION */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-3xl">
          <p className="eyebrow text-primary">Exhibitor Benefits</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Why Exhibit at Marriott Trade Expo?
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Position your brand directly in front of thousands of international buyers, key procurement managers, and industry leaders.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Building2,
              title: "Showcase Your Products",
              desc: "Display your latest innovations and product lines in high-spec exhibition pods with direct buyer interaction.",
            },
            {
              icon: Users,
              title: "Meet Quality Buyers",
              desc: "Connect with pre-registered decision-makers, commercial procurement executives, and enterprise buyers.",
            },
            {
              icon: TrendingUp,
              title: "Build Business Connections",
              desc: "Expand your distributor network, form joint ventures, and close strategic partnerships on the expo floor.",
            },
            {
              icon: Target,
              title: "Present Your Brand",
              desc: "Elevate your market visibility through premier keynote placement and dedicated media coverage.",
            },
            {
              icon: Sparkles,
              title: "Connect Industry Leaders",
              desc: "Participate in roundtables, VIP networking sessions, and live technology demonstrations.",
            },
            {
              icon: CheckCircle2,
              title: "Instant Space Hold",
              desc: "Our interactive map allows instant 30-minute temporary holds to secure your preferred location seamlessly.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-border bg-card p-6 shadow-xs hover:border-primary/40 transition-colors"
            >
              <item.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FLOOR MAP PREVIEW */}
      <section className="border-t border-border bg-surface py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-primary">Interactive Floor Map</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Explore Available Spaces
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Hover over any space to inspect dimensions, pricing, and category. Click to start your booking request instantly.
              </p>
            </div>
            <Button asChild size="lg" className="font-bold">
              <Link to="/floor-plan">
                Open Full Floor Map <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10">
            <FloorMap statusMap={statusMap} />
            <FloorMapLegend className="mt-4" />
          </div>
        </div>
      </section>

      {/* HOW BOOKING WORKS */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">How Booking Works</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            ["01", "Pick your space", "Zoom into the interactive floor plan and select any available stall to view dimensions and pricing."],
            ["02", "Hold it instantly", `Complete the brief registration form to place a ${eventConfig.booking.paymentPendingMinutes}-minute temporary hold on your space.`],
            ["03", "Get confirmed", "Send your payment receipt via WhatsApp or bank ref. Once verified by our team, your space is permanently confirmed."],
          ].map(([num, heading, body]) => (
            <article key={heading} className="rounded-lg border border-border bg-card p-6 relative">
              <span className="text-xs font-extrabold text-primary uppercase tracking-widest">{num}</span>
              <h3 className="mt-2 text-lg font-bold">{heading}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="border-t border-border bg-ink text-ink-foreground py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Secure Your Space at Marriott Expo 2027
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm opacity-80">
            Exhibition spaces are limited and assigned on a first-come, first-served basis. Reserve your preferred location today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-primary text-primary-foreground font-bold hover:bg-primary/90">
              <Link to="/floor-plan">
                Reserve Exhibition Space Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline-dark">
              <a
                href={whatsappLink(eventConfig.contact.whatsapp[0], "Hello, I would like to inquire about exhibiting at Marriott Expo 2027.")}
                target="_blank"
                rel="noreferrer"
              >
                Inquire on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
