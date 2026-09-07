import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { eventConfig } from "@/config/event";
import { stalls } from "@/data/floor-plan";
import { useBookingState } from "@/lib/booking-store";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Users, Building, ShieldCheck, ArrowRight, Search } from "lucide-react";

const title = `Attendees & Exhibitors — ${eventConfig.name}`;
const description = `Discover confirmed exhibitors, industry sector directory, and visitor profile for ${eventConfig.name}.`;

export const Route = createFileRoute("/attendees")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AttendeesPage,
});

function AttendeesPage() {
  const state = useBookingState();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdmin(localStorage.getItem("venueflow_admin_auth") === "true");
    }
  }, []);

  const displayedBookings = useMemo(() => {
    if (isAdmin) {
      return state.bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PAYMENT_REVIEW" || b.status === "PAYMENT_PENDING");
    }
    return state.bookings.filter((b) => b.status === "CONFIRMED");
  }, [state.bookings, isAdmin]);

  return (
    <SiteLayout>
      {/* HEADER */}
      <section className="border-b border-border bg-surface py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <p className="eyebrow text-primary">Directory & Attendees</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Exhibitor Directory & Attendee Guide
          </h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground leading-relaxed">
            Meet international manufacturers, technology developers, and distributor networks exhibiting at {eventConfig.name}.
          </p>
        </div>
      </section>

      {/* METRICS & SECTOR BREAKDOWN */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <Users className="h-7 w-7 text-primary" />
            <p className="mt-3 text-2xl font-extrabold text-foreground">3,500+ Expected</p>
            <p className="text-sm text-muted-foreground">Trade buyers, procurement managers & corporate executives.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <Building className="h-7 w-7 text-primary" />
            <p className="mt-3 text-2xl font-extrabold text-foreground">20 Prime Stalls</p>
            <p className="text-sm text-muted-foreground">Across West, Central, East Halls and Innovation Pods.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <p className="mt-3 text-2xl font-extrabold text-foreground">Verified Exhibitors</p>
            <p className="text-sm text-muted-foreground">All reserved space transactions verified by organizers.</p>
          </div>
        </div>
      </section>

      {/* EXHIBITOR DIRECTORY */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">
              {isAdmin ? "Exhibitor Directory & Admin Status" : "Confirmed Exhibitors"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "Admin View: Real-time status logs of all confirmed, review, and hold space reservations."
                : "Official list of confirmed participating organizations."}
            </p>
          </div>
          <Button asChild size="sm">
            <Link to="/floor-plan">
              Book Your Exhibitor Space <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3">Space</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Product / Industry</th>
                <th className="px-4 py-3">Category</th>
                {isAdmin && <th className="px-4 py-3">Status</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayedBookings.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-4 py-8 text-center text-muted-foreground">
                    No confirmed bookings yet. Be the first to reserve a space!
                  </td>
                </tr>
              ) : (
                displayedBookings.map((b) => {
                  const stall = stalls.find((s) => s.id === b.stallId);
                  return (
                    <tr key={b.id} className="hover:bg-secondary/40">
                      <td className="px-4 py-3 font-extrabold text-foreground">{b.stallId}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {b.companyName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{b.productService}</td>
                      <td className="px-4 py-3 text-muted-foreground">{stall?.category ?? "Exhibition Space"}</td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <StatusBadge status={b.status} />
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </SiteLayout>
  );
}
