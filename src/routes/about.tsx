import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { eventConfig } from "@/config/event";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, MapPin, Award, CheckCircle, ArrowRight } from "lucide-react";

const title = `About — ${eventConfig.name}`;
const description = `Learn more about ${eventConfig.name}, host venue ${eventConfig.venue.name}, organizer profile, and event agenda.`;

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      {/* HEADER */}
      <section className="border-b border-border bg-surface py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <p className="eyebrow text-primary">About The Expo</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Connecting Industry Pioneers & Enterprise Buyers
          </h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground leading-relaxed">
            {eventConfig.description} Organized annually, the expo serves as the premier commercial platform for strategic trade partnerships, technological showcases, and business growth.
          </p>
        </div>
      </section>

      {/* VENUE & EVENT OVERVIEW */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <span className="text-xs font-extrabold text-copper uppercase tracking-widest">Venue Highlight</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {eventConfig.venue.name}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Located in the commercial heart of {eventConfig.venue.city}, the {eventConfig.venue.name} provides a world-class exhibition hall equipped with high-speed fiber infrastructure, state-of-the-art keynote audiovisual systems, executive lounges, and dedicated loading bay access.
            </p>

            <dl className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <dt className="text-sm font-bold text-foreground">Location & Address</dt>
                  <dd className="text-sm text-muted-foreground">{eventConfig.venue.address}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <dt className="text-sm font-bold text-foreground">Event Schedule</dt>
                  <dd className="text-sm text-muted-foreground">{eventConfig.dateLabel} ({eventConfig.timeLabel})</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <dt className="text-sm font-bold text-foreground">Exhibition Capacity</dt>
                  <dd className="text-sm text-muted-foreground">20 Prime Exhibition Stalls & Pods across 4 Dedicated Zones</dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-card p-8 shadow-xs">
            <h3 className="text-xl font-bold text-foreground border-b border-border pb-4">
              Event Objectives
            </h3>
            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
              {[
                "Facilitate direct B2B transactions between manufacturers and global distributors.",
                "Provide an international benchmark platform for technology & product launches.",
                "Host high-impact keynote presentations led by prominent industry figures.",
                "Ensure maximum return on investment for exhibitors through pre-scheduled buyer meetings.",
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Organizing Body</p>
                <p className="text-sm font-bold text-foreground">Marriott Trade & Exhibitions Directorate</p>
              </div>
              <Button asChild size="sm">
                <Link to="/floor-plan">
                  Book Space <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AGENDA HIGHLIGHTS */}
      <section className="border-t border-border bg-surface py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <p className="eyebrow text-primary">Schedule Highlights</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Two Days of Strategic Opportunity
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-6">
              <span className="inline-block rounded-md bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                Day 1 — 28 January 2027
              </span>
              <h3 className="mt-4 text-lg font-bold text-foreground">Grand Opening & Keynote Showcases</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li>• 09:00 AM — Exhibition Floor Opens & Delegate Registration</li>
                <li>• 10:30 AM — Official Inauguration & Opening Keynote</li>
                <li>• 01:00 PM — Executive Networking Lunch</li>
                <li>• 03:00 PM — Product Demonstrations in Zone B</li>
                <li>• 06:00 PM — Day 1 Closing</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-background p-6">
              <span className="inline-block rounded-md bg-copper/10 px-3 py-1 text-xs font-bold text-copper">
                Day 2 — 29 January 2027
              </span>
              <h3 className="mt-4 text-lg font-bold text-foreground">Buyer Roundtables & Partnership Signings</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li>• 09:30 AM — B2B Procurement Meetings & Deal Rooms</li>
                <li>• 11:30 AM — Enterprise Innovation Panel</li>
                <li>• 02:30 PM — Industry Excellence Awards Presentation</li>
                <li>• 04:30 PM — Closing Ceremony & Exhibitor Reception</li>
                <li>• 06:00 PM — Official Event Conclusion</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
