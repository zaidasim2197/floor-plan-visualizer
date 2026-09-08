import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { DemoBanner } from "@/components/site/DemoBanner";
import { useEventCatalog, selectEvent } from "@/lib/event-store";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";

export function SiteLayout({ children }: { children: ReactNode }) {
  const catalog = useEventCatalog();
  const navigate = useNavigate();
  const path = useRouterState({ select: (state) => state.location.pathname });
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* <DemoBanner /> */}
      <SiteHeader />
      {catalog && path !== "/admin" && (
        <div className="border-b border-border bg-surface-2">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2 sm:px-6">
            <label htmlFor="public-event" className="text-xs font-semibold text-muted-foreground">
              Explore event
            </label>
            <select
              id="public-event"
              className="max-w-full bg-transparent py-1 text-xs font-semibold"
              value={catalog.activeId}
              onChange={async (e) => {
                const id = e.target.value;
                try {
                  await navigate({ to: "/" });
                  selectEvent(id);
                } catch {
                  toast.error("Could not switch events. Check browser storage.");
                }
              }}
            >
              {catalog.events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.config.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
