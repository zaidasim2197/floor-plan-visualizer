import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { eventConfig } from "@/config/event";
import { stalls } from "@/data/floor-plan";
import { useBookingState } from "@/lib/booking-store";
import { activeEventId } from "@/lib/event-store";
import type { Booking, BookingStatus } from "@/lib/booking-types";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface DisplayAttendee {
  spaceNumber: string;
  zone?: string;
  companyName: string;
  productService?: string;
  category?: string;
  status: BookingStatus;
}

let cachedAttendeesList: Array<{
  spaceNumber: string;
  zone?: string;
  companyName: string;
  productService?: string;
  category?: string;
}> | null = null;

function AttendeesPage() {
  const localStore = useBookingState();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(() => !cachedAttendeesList);
  const [serverAttendees, setServerAttendees] = useState<Array<{
    spaceNumber: string;
    zone?: string;
    companyName: string;
    productService?: string;
    category?: string;
  }> | null>(() => {
    if (cachedAttendeesList) return cachedAttendeesList;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("venueflow_cached_attendees");
        if (raw) return JSON.parse(raw);
      } catch {
        /* ignore */
      }
    }
    return null;
  });
  const [adminServerBookings, setAdminServerBookings] = useState<any[]>([]);

  useEffect(() => {
    const adminAuth = typeof window !== "undefined" && localStorage.getItem("venueflow_admin_auth") === "true";
    setIsAdmin(adminAuth);

    let mounted = true;
    const slug = activeEventId() || eventConfig.slug || "business-expo";

    const fetchPublicAttendees = fetch(`/api/v1/events/${slug}/attendees`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted) return;
        const list = Array.isArray(data?.attendees) ? data.attendees : [];
        setServerAttendees(list);
        cachedAttendeesList = list;
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("venueflow_cached_attendees", JSON.stringify(list));
          }
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        if (mounted && !serverAttendees) {
          setServerAttendees([]);
        }
      });

    const token = typeof window !== "undefined" ? localStorage.getItem("venueflow_admin_token") : null;
    const fetchAdminBookings = adminAuth
      ? fetch(`/api/v1/admin/events/${slug}/bookings?pageSize=100`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (!mounted) return;
            const bList = data?.bookings ?? data?.data?.bookings;
            if (Array.isArray(bList)) {
              setAdminServerBookings(bList);
            }
          })
          .catch(() => {
            /* ignore */
          })
      : Promise.resolve();

    Promise.allSettled([fetchPublicAttendees, fetchAdminBookings]).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const displayedAttendees = useMemo(() => {
    const map = new Map<string, DisplayAttendee>();
    const ALLOWED_STATUSES = new Set(["CONFIRMED", "PAYMENT_REVIEW", "PAYMENT_PENDING"]);

    // 1. Process server public confirmed attendees
    if (serverAttendees && serverAttendees.length > 0) {
      serverAttendees.forEach((att) => {
        if (att.spaceNumber) {
          const stall = stalls.find((s) => s.id === att.spaceNumber || s.stallNumber === att.spaceNumber);
          map.set(att.spaceNumber, {
            spaceNumber: att.spaceNumber,
            zone: att.zone || stall?.zone,
            companyName: att.companyName,
            productService: att.productService,
            category: att.category || stall?.category,
            status: "CONFIRMED",
          });
        }
      });
    }

    // 2. If admin, process server admin bookings
    if (isAdmin && adminServerBookings.length > 0) {
      adminServerBookings.forEach((b: any) => {
        const spaceNum = b.spaceNumber || b.spaceId || b.stallId;
        const status = (b.status as BookingStatus) || "CONFIRMED";
        if (spaceNum && ALLOWED_STATUSES.has(status)) {
          const stall = stalls.find((s) => s.id === spaceNum || s.stallNumber === spaceNum);
          map.set(spaceNum, {
            spaceNumber: spaceNum,
            zone: b.zone || stall?.zone,
            companyName: b.companyName,
            productService: b.productService,
            category: b.category || stall?.category,
            status,
          });
        }
      });
    }

    // 3. Process local store bookings (both demo prototype & reactive sessions)
    if (localStore?.bookings && localStore.bookings.length > 0) {
      localStore.bookings.forEach((b: Booking) => {
        const spaceNum = b.stallId;
        if (!spaceNum) return;
        if (!ALLOWED_STATUSES.has(b.status)) return;

        // If not admin, only show confirmed bookings
        if (!isAdmin && b.status !== "CONFIRMED") return;

        const stall = stalls.find((s) => s.id === spaceNum || s.stallNumber === spaceNum);

        // Overlay/merge
        map.set(spaceNum, {
          spaceNumber: spaceNum,
          zone: stall?.zone,
          companyName: b.companyName,
          productService: b.productService || stall?.description,
          category: stall?.category,
          status: b.status,
        });
      });
    }

    let list = Array.from(map.values()).filter((item) => ALLOWED_STATUSES.has(item.status));

    // In public mode, only show CONFIRMED
    if (!isAdmin) {
      list = list.filter((item) => item.status === "CONFIRMED");
    }

    // Sort naturally by spaceNumber (e.g. A01, A02, B01...)
    list.sort((a, b) => a.spaceNumber.localeCompare(b.spaceNumber, undefined, { numeric: true }));

    // Apply search filter if present
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.spaceNumber.toLowerCase().includes(q) ||
          item.companyName.toLowerCase().includes(q) ||
          (item.productService && item.productService.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q)) ||
          (item.status && item.status.toLowerCase().includes(q))
      );
    }

    return list;
  }, [serverAttendees, adminServerBookings, localStore?.bookings, isAdmin, searchQuery]);

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
          <div className="flex items-center gap-3">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exhibitors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Button asChild size="sm">
              <Link to="/floor-plan">
                Book Your Exhibitor Space <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
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
              {loading && displayedAttendees.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-4 py-8 text-center text-muted-foreground">
                    Loading exhibitors directory...
                  </td>
                </tr>
              ) : displayedAttendees.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-4 py-8 text-center text-muted-foreground">
                    {searchQuery ? "No exhibitors found matching your search." : "No confirmed exhibitors yet. Be the first to reserve and confirm an exhibition space!"}
                  </td>
                </tr>
              ) : (
                displayedAttendees.map((b, idx) => {
                  const stall = stalls.find((s) => s.id === b.spaceNumber || s.stallNumber === b.spaceNumber);
                  return (
                    <tr key={`${b.spaceNumber}-${idx}`} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-4 py-3 font-extrabold text-foreground">
                        Space {b.spaceNumber}
                        {b.zone && <span className="ml-2 text-xs font-normal text-muted-foreground">({b.zone})</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {b.companyName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                        {b.productService || "General Exhibitor"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {b.category || stall?.category || "Exhibition Space"}
                      </td>
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
