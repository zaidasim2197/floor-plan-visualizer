import { Link } from "@tanstack/react-router";
import { eventConfig } from "@/config/event";
import { BrandLogo } from "@/components/site/BrandLogo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-ink text-ink-foreground">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-8 w-8" />
            <p className="text-lg font-bold tracking-tight">{eventConfig.name}</p>
          </div>
          <p className="mt-2 max-w-md text-sm opacity-70">{eventConfig.description}</p>
          <p className="mt-4 text-sm opacity-70">
            {eventConfig.dateLabel} · {eventConfig.venue.name}, {eventConfig.venue.city}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-60">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/" className="opacity-80 hover:opacity-100">Home</Link></li>
            <li><Link to="/floor-plan" className="opacity-80 hover:opacity-100">Floor Plan</Link></li>
            <li><Link to="/about" className="opacity-80 hover:opacity-100">About</Link></li>
            <li><Link to="/attendees" className="opacity-80 hover:opacity-100">Attendees</Link></li>
            <li><Link to="/contact" className="opacity-80 hover:opacity-100">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-60">Contact</p>
          <ul className="mt-3 space-y-2 text-sm opacity-80">
            <li>{eventConfig.contact.email}</li>
            <li>{eventConfig.contact.phone}</li>
            <li>{eventConfig.venue.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 text-[11px] opacity-60 sm:px-6">
          © {new Date().getFullYear()} {eventConfig.name}. Demo prototype — floor plan and bookings are illustrative.
        </div>
      </div>
    </footer>
  );
}
