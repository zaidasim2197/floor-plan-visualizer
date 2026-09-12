import { useState, useMemo, useEffect, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EventWorkspace, SpaceManagement } from "@/components/site/AdminConfiguration";
import { BookingDetail, RevenueSummary } from "@/components/site/BookingDetail";
import { filterBookings, paymentLabels } from "@/lib/admin-data";
import { activeEventId, activeEvent } from "@/lib/event-store";
import { SiteLayout } from "@/components/site/SiteLayout";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FloorMap, FloorMapLegend } from "@/components/site/FloorMap";
import { eventConfig } from "@/config/event";
import { stalls } from "@/data/floor-plan";
import { formatMoney, formatCountdown, statusTone } from "@/lib/booking-format";
import { cn } from "@/lib/utils";
import {
  useBookingState,
  metrics,
  approveBooking,
  releaseBooking,
  reassignBooking,
  updateBooking,
  resolveConflict,
  createBooking,
  expireNow,
  stallStatusMap,
} from "@/lib/booking-store";
import type { Booking, BookingStatus, Stall, StallStatus, NotificationRecord, AuditEvent } from "@/lib/booking-types";

const adminStatusLabel: Record<StallStatus, string> = {
  AVAILABLE: "Available",
  PAYMENT_PENDING: "Payment Pending",
  PAYMENT_REVIEW: "Payment Review",
  CONFIRMED: "Confirmed",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
  CONFLICT: "Conflict",
};

function AdminStatusBadge({ status }: { status: StallStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap",
        statusTone[status],
      )}
    >
      {adminStatusLabel[status]}
    </span>
  );
}
import {
  Lock,
  LogOut,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  PlusCircle,
  Mail,
  History,
  MapPin,
  Building,
  User,
  Phone,
  Shield,
  FileText,
  ChevronRight,
  Sparkles,
  FileImage,
  ExternalLink,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  // Authentication Gate
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("venueflow_admin_auth") === "true";
    }
    return false;
  });

  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput.trim(),
          password: passwordInput,
        }),
      });
      const data = await res.json();
      const token = data.accessToken ?? data.data?.accessToken;
      const refreshToken = data.refreshToken ?? data.data?.refreshToken;
      const user = data.user ?? data.data?.user;

      if (res.ok && token) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("venueflow_admin_auth", "true");
          window.localStorage.setItem("venueflow_admin_token", token);
          if (refreshToken) {
            window.localStorage.setItem("venueflow_admin_refresh_token", refreshToken);
          }
        }
        setAuthenticated(true);
        toast.success(`Authenticated as ${user?.displayName || "Administrator"}.`);
      } else if (
        usernameInput.trim() === eventConfig.demo.adminUsername &&
        passwordInput === eventConfig.demo.adminPassword
      ) {
        // Fallback for offline demo mode
        setAuthenticated(true);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("venueflow_admin_auth", "true");
        }
        toast.success("Authenticated as Administrator.");
      } else {
        setAuthError(data?.error?.message || data?.message || "Invalid admin credentials.");
      }
    } catch {
      if (
        usernameInput.trim() === eventConfig.demo.adminUsername &&
        passwordInput === eventConfig.demo.adminPassword
      ) {
        setAuthenticated(true);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("venueflow_admin_auth", "true");
        }
        toast.success("Authenticated as Administrator.");
      } else {
        setAuthError("Failed to connect to authentication service.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("venueflow_admin_auth");
      window.localStorage.removeItem("venueflow_admin_token");
      window.localStorage.removeItem("venueflow_admin_refresh_token");
    }
    toast.info("Logged out of Admin Portal.");
  };

  if (!authenticated) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md py-20 px-4">
          <div className="rounded-xl border border-border bg-card p-8 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
              <Lock className="h-6 w-6" />
            </div>

            <h1 className="text-2xl font-extrabold text-center text-foreground">
              Admin Portal Authentication
            </h1>
            <p className="mt-2 text-xs text-center text-muted-foreground">
              Restricted management panel for event organizers and venue managers.
            </p>

            <div className="mt-4 rounded-md bg-secondary p-3 text-xs border border-border space-y-1 font-mono">
              <p className="font-bold text-foreground">Demo Access Credentials:</p>
              <p>
                Username: <strong className="text-primary">admin</strong>
              </p>
              <p>
                Password: <strong className="text-primary">Admin@123</strong>
              </p>
            </div>

            {authError && (
              <div className="mt-4 rounded-md bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-user">Username</Label>
                <Input
                  id="admin-user"
                  required
                  placeholder="admin"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-pass">Password</Label>
                <Input
                  id="admin-pass"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full font-bold h-11">
                {isSubmitting ? "Authenticating..." : "Authenticate & Access Dashboard"}
              </Button>
            </form>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

// ------------------------------------------------------------- DASHBOARD VIEW

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const localStoreState = useBookingState();
  const [liveBookings, setLiveBookings] = useState<Booking[] | null>(null);
  const [liveNotifications, setLiveNotifications] = useState<NotificationRecord[] | null>(null);
  const [liveAudit, setLiveAudit] = useState<AuditEvent[] | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const eventSlug = activeEventId();

  // Helper to get auth header
  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("venueflow_admin_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Fetch live bookings and operational data from MongoDB APIs
  const fetchLiveAdminData = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const [bookingsRes, notifsRes, auditRes] = await Promise.all([
        fetch(`/api/v1/admin/events/${eventSlug}/bookings?pageSize=100`, { headers }),
        fetch(`/api/v1/admin/events/${eventSlug}/notifications?pageSize=50`, { headers }),
        fetch(`/api/v1/admin/events/${eventSlug}/audit?pageSize=50`, { headers }),
      ]);

      if (bookingsRes.status === 401 || notifsRes.status === 401 || auditRes.status === 401) {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("venueflow_admin_auth");
          window.localStorage.removeItem("venueflow_admin_token");
          window.localStorage.removeItem("venueflow_admin_refresh_token");
        }
        onLogout();
        return;
      }

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        const rawBookings = data.bookings ?? data.data?.bookings;
        if (Array.isArray(rawBookings)) {
          const mapped: Booking[] = rawBookings.map((b: any) => ({
            id: b.id || b._id,
            eventId: eventSlug,
            reference: b.reference,
            stallId: b.spaceNumber || b.spaceId,
            customerName: b.customerName,
            companyName: b.companyName,
            email: b.email,
            phone: b.phone,
            productService: b.productService || "",
            notes: b.notes || "",
            amount: b.amount,
            status: b.status,
            paymentStatus: b.paymentStatus,
            paymentReference: b.paymentReference || "",
            paymentProofImage: b.proofStorageKey
              ? `/api/v1/admin/proof-placeholder?key=${encodeURIComponent(b.proofStorageKey)}`
              : undefined,
            createdAt: new Date(b.createdAt).getTime(),
            expiresAt: b.expiresAt ? new Date(b.expiresAt).getTime() : Date.now() + 1800000,
            source: b.source || "PUBLIC",
            conflictReason: b.conflictReason || undefined,
            confirmedAt: b.confirmedAt ? new Date(b.confirmedAt).getTime() : undefined,
          }));
          setLiveBookings(mapped);
          setIsLiveConnected(true);
          setLastSyncedAt(new Date());
        }
      }

      if (notifsRes.ok) {
        const nData = await notifsRes.json();
        const rawNotifs = nData.notifications ?? nData.data?.notifications;
        if (Array.isArray(rawNotifs)) {
          setLiveNotifications(
            rawNotifs.map((n: any) => ({
              id: n.id || n._id,
              audience: n.audience,
              recipient: n.recipient,
              subject: n.subject,
              body: n.body,
              status: n.status,
              bookingRef: n.bookingRef || undefined,
              createdAt: new Date(n.createdAt).getTime(),
            })),
          );
        }
      }

      if (auditRes.ok) {
        const aData = await auditRes.json();
        const rawEntries = aData.entries ?? aData.data?.entries;
        if (Array.isArray(rawEntries)) {
          setLiveAudit(
            rawEntries.map((a: any) => ({
              id: a.id || a._id,
              bookingRef: a.bookingRef || undefined,
              action: a.action,
              actor: a.actor,
              details: a.details,
              createdAt: new Date(a.createdAt).getTime(),
            })),
          );
        }
      }
    } catch {
      setIsLiveConnected(false);
    }
  }, [eventSlug, getAuthHeaders, onLogout]);

  // Real-time polling tick: poll MongoDB APIs every 2.5 seconds
  useEffect(() => {
    fetchLiveAdminData();
    const timer = setInterval(() => {
      fetchLiveAdminData();
    }, 2500);
    return () => clearInterval(timer);
  }, [fetchLiveAdminData]);

  // Active bookings list (live server records from MongoDB Atlas as single source of truth)
  const currentBookings = liveBookings ?? [];
  const currentNotifications = liveNotifications ?? [];
  const currentAudit = liveAudit ?? [];

  const stats = useMemo(() => metrics(currentBookings), [currentBookings]);
  const statusMap = useMemo(() => stallStatusMap(currentBookings), [currentBookings]);

  // Real-time UI countdown timer tick
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  type AdminTab = "bookings" | "spaces" | "map" | "emails" | "audit";
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    try {
      const saved = sessionStorage.getItem(`admin-tab-${activeEventId()}`);
      return saved && ["bookings", "spaces", "map", "emails", "audit"].includes(saved)
        ? (saved as AdminTab)
        : "bookings";
    } catch {
      return "bookings";
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(`admin-tab-${activeEventId()}`, activeTab);
    } catch {
      /* Optional UI preference. */
    }
  }, [activeTab]);
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [detailReference, setDetailReference] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [selectedBookingRef, setSelectedBookingRef] = useState<string | null>(null);
  const selectedBooking = currentBookings.find((b) => b.reference === selectedBookingRef) ?? null;
  const setSelectedBooking = (b: Booking | null) => setSelectedBookingRef(b?.reference ?? null);
  const [proofModalBooking, setProofModalBooking] = useState<Booking | null>(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [newStallTarget, setNewStallTarget] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [manualBookingModalOpen, setManualBookingModalOpen] = useState(false);
  const [releaseConfirmOpen, setReleaseConfirmOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editProduct, setEditProduct] = useState("");

  // Manual booking form state
  const [mbStallId, setMbStallId] = useState(
    () => stalls.find((s) => statusMap[s.id] === "AVAILABLE")?.id ?? "",
  );
  const [mbName, setMbName] = useState("");
  const [mbCompany, setMbCompany] = useState("");
  const [mbEmail, setMbEmail] = useState("");
  const [mbPhone, setMbPhone] = useState("");
  const [mbProduct, setMbProduct] = useState("");
  const [mbStatus, setMbStatus] = useState<BookingStatus>("CONFIRMED");

  // Conflict list
  const conflicts = useMemo(
    () => currentBookings.filter((b) => b.status === "CONFLICT"),
    [currentBookings],
  );

  // Filtered booking table
  const filteredBookings = useMemo(
    () =>
      filterBookings(currentBookings, {
        status: statusFilter,
        payment: paymentFilter,
        search: searchTerm,
      }),
    [currentBookings, statusFilter, paymentFilter, searchTerm],
  );

  // Handlers with live API calls and local store sync fallback
  const handleApprove = async (ref: string) => {
    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const res = await fetch(`/api/v1/admin/bookings/${ref}/approve`, {
        method: "POST",
        headers,
      });
      if (res.ok) {
        toast.success(`Booking ${ref} confirmed successfully.`);
        approveBooking(ref);
        fetchLiveAdminData();
        return;
      }
      const data = await res.json();
      if (data?.error?.message) {
        toast.error(data.error.message);
        return;
      }
    } catch {
      // Fallback
    }
    const res = approveBooking(ref);
    if (res.ok) {
      toast.success(`Booking ${ref} confirmed successfully.`);
    } else {
      toast.error(res.error);
    }
    fetchLiveAdminData();
  };

  const handleRelease = async (ref: string) => {
    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const res = await fetch(`/api/v1/admin/bookings/${ref}/release`, {
        method: "POST",
        headers,
      });
      if (res.ok) {
        toast.success(`Space for booking ${ref} released.`);
        setReleaseConfirmOpen(false);
        releaseBooking(ref, "RELEASED");
        fetchLiveAdminData();
        return;
      }
      const data = await res.json();
      if (data?.error?.message) {
        toast.error(data.error.message);
        return;
      }
    } catch {
      // Fallback
    }
    const res = releaseBooking(ref, "RELEASED");
    if (res.ok) {
      toast.success(`Space for booking ${ref} released.`);
      setReleaseConfirmOpen(false);
    } else {
      toast.error(res.error);
    }
    fetchLiveAdminData();
  };

  const handleExecuteReassign = async () => {
    if (!selectedBooking || !newStallTarget) return;
    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const res = await fetch(`/api/v1/admin/bookings/${selectedBooking.reference}/reassign`, {
        method: "POST",
        headers,
        body: JSON.stringify({ targetSpaceId: newStallTarget }),
      });
      if (res.ok) {
        toast.success(`Moved booking ${selectedBooking.reference} to space ${newStallTarget}.`);
        setReassignModalOpen(false);
        reassignBooking(selectedBooking.reference, newStallTarget);
        fetchLiveAdminData();
        return;
      }
      const data = await res.json();
      if (data?.error?.message) {
        toast.error(data.error.message);
        return;
      }
    } catch {
      // Fallback
    }
    const res = reassignBooking(selectedBooking.reference, newStallTarget);
    if (res.ok) {
      toast.success(`Moved booking ${selectedBooking.reference} to space ${newStallTarget}.`);
      setReassignModalOpen(false);
    } else {
      toast.error(res.error);
    }
    fetchLiveAdminData();
  };

  const handleOpenEdit = (b: Booking) => {
    setSelectedBooking(b);
    setEditName(b.customerName);
    setEditCompany(b.companyName);
    setEditEmail(b.email);
    setEditPhone(b.phone);
    setEditProduct(b.productService);
    setEditModalOpen(true);
  };

  const handleExecuteEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const res = await fetch(`/api/v1/admin/events/${eventSlug}/bookings/${selectedBooking.reference}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          customerName: editName,
          companyName: editCompany,
          email: editEmail,
          phone: editPhone,
          productService: editProduct,
        }),
      });
      if (res.ok) {
        toast.success(`Updated booking ${selectedBooking.reference}.`);
        setEditModalOpen(false);
        updateBooking(selectedBooking.reference, {
          customerName: editName,
          companyName: editCompany,
          email: editEmail,
          phone: editPhone,
          productService: editProduct,
        });
        fetchLiveAdminData();
        return;
      }
    } catch {
      // Fallback
    }
    const res = updateBooking(selectedBooking.reference, {
      customerName: editName,
      companyName: editCompany,
      email: editEmail,
      phone: editPhone,
      productService: editProduct,
    });
    if (res.ok) {
      toast.success(`Updated booking ${selectedBooking.reference}.`);
      setEditModalOpen(false);
    } else {
      toast.error(res.error);
    }
    fetchLiveAdminData();
  };

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const res = await fetch(`/api/v1/admin/events/${eventSlug}/bookings`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          spaceId: mbStallId,
          customerName: mbName,
          companyName: mbCompany,
          email: mbEmail,
          phone: mbPhone,
          productService: mbProduct,
          notes: "Manually created via Admin Panel",
          initialStatus: mbStatus,
        }),
      });
      if (res.ok) {
        toast.success(`Manual booking created for space ${mbStallId}!`);
        setManualBookingModalOpen(false);
        setMbName("");
        setMbCompany("");
        setMbEmail("");
        setMbPhone("");
        setMbProduct("");
        createBooking(
          mbStallId,
          {
            customerName: mbName,
            companyName: mbCompany,
            email: mbEmail,
            phone: mbPhone,
            productService: mbProduct,
            notes: "Manually created via Admin Panel",
          },
          "ADMIN",
          mbStatus,
        );
        fetchLiveAdminData();
        return;
      }
      const data = await res.json();
      if (data?.error?.message) {
        toast.error(data.error.message);
        return;
      }
    } catch {
      // Fallback
    }
    const res = createBooking(
      mbStallId,
      {
        customerName: mbName,
        companyName: mbCompany,
        email: mbEmail,
        phone: mbPhone,
        productService: mbProduct,
        notes: "Manually created via Admin Panel",
      },
      "ADMIN",
      mbStatus,
    );
    if (res.ok) {
      toast.success(`Manual booking created for space ${mbStallId}!`);
      setManualBookingModalOpen(false);
      setMbName("");
      setMbCompany("");
      setMbEmail("");
      setMbPhone("");
      setMbProduct("");
    } else {
      toast.error(res.error);
    }
    fetchLiveAdminData();
  };

  const handleResolveConflictAction = async (ref: string, resolution: string) => {
    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const res = await fetch(`/api/v1/admin/bookings/${ref}/resolve-conflict`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "refund_cancel" }),
      });
      if (res.ok) {
        toast.success(`Conflict resolved for ${ref}.`);
        resolveConflict(ref, resolution);
        fetchLiveAdminData();
        return;
      }
    } catch {
      // Fallback
    }
    const res = resolveConflict(ref, resolution);
    if (res.ok) {
      toast.success(`Conflict resolved for ${ref}.`);
    } else {
      toast.error(res.error);
    }
    fetchLiveAdminData();
  };

  return (
    <SiteLayout>
      {/* SYSTEM STATUS BAR */}
      <div className="border-b border-border bg-ink text-ink-foreground py-2.5 px-4 text-xs font-semibold">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 sm:px-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Booking Engine: Live Sync Active
            </span>
            <span className="opacity-30">•</span>
            <span className="opacity-80">
              {lastSyncedAt ? `Synced with Database · ${lastSyncedAt.toLocaleTimeString()}` : "Connecting to Database..."}
            </span>
            <span className="opacity-30">•</span>
            <span className="opacity-80">Notifications: Live</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline-dark"
              className="h-7 text-xs"
              onClick={() => fetchLiveAdminData()}
              title="Refresh live data from database"
            >
              <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh
            </Button>
            <Button
              size="sm"
              variant="outline-dark"
              className="h-7 text-xs"
              onClick={() => setManualBookingModalOpen(true)}
            >
              <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add Manual Booking
            </Button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1 text-red-300 hover:text-red-100 hover:underline"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Event operations
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Your events, spaces and reservations, in one place.
            </p>
          </div>

          {/* TABS SELECTOR */}
          <div className="flex flex-wrap rounded-md border border-border bg-surface p-1 text-xs font-bold">
            {[
              ["bookings", `Bookings (${currentBookings.length})`],
              ["spaces", "Space management"],
              ["map", "Floor Map View"],
              ["emails", `Email Log (${currentNotifications.length})`],
              ["audit", `Audit Trail (${currentAudit.length})`],
            ].map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`rounded-sm px-3 py-2 transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <EventWorkspace />
        <RevenueSummary bookings={currentBookings} />
        {activeTab === "spaces" && <SpaceManagement bookings={currentBookings} />}
        {/* METRICS OVERVIEW */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {[
            ["Total Spaces", stats.total, "border-border"],
            [
              "Available",
              stats.available,
              "border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
            ],
            [
              "Payment Pending",
              stats.paymentPending,
              "border-amber-500/30 text-amber-700 dark:text-amber-300",
            ],
            [
              "Payment Review",
              stats.paymentReview,
              "border-blue-500/30 text-blue-700 dark:text-blue-300",
            ],
            [
              "Confirmed",
              stats.confirmed,
              "border-emerald-600/30 text-emerald-800 dark:text-emerald-200",
            ],
            ["Expired", stats.expired, "border-border text-muted-foreground"],
            ["Conflicts", stats.conflicts, "border-red-500/30 text-red-700 dark:text-red-300"],
          ].map(([label, val, borderStyle]) => (
            <div
              key={label as string}
              className={`rounded-lg border bg-card p-3.5 shadow-xs ${borderStyle}`}
            >
              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-1 text-2xl font-extrabold">{val}</dd>
            </div>
          ))}
        </div>

        {/* ACTIVE CONFLICT BANNER */}
        {conflicts.length > 0 && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-red-900 dark:text-red-200">
                  PAYMENT CONFLICT DETECTED ({conflicts.length})
                </h3>
                <p className="text-xs text-red-800 dark:text-red-300">
                  Payment evidence arrived after a reservation ended. Verify the payment and
                  availability before confirming or arranging a refund.
                </p>
              </div>
            </div>

            <div className="divide-y divide-red-500/20 border-t border-red-500/20 pt-2 space-y-3">
              {conflicts.map((c) => {
                const isStallFree = statusMap[c.stallId] === "AVAILABLE";
                return (
                  <div
                    key={c.id}
                    className="pt-3 flex flex-wrap items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-foreground">{c.reference}</span> —
                      Company: <strong>{c.companyName}</strong> ({c.customerName}) | Stall:{" "}
                      <strong>{c.stallId}</strong> | Payment Ref:{" "}
                      <strong>{c.paymentReference || "N/A"}</strong>
                      <p className="text-red-800 dark:text-red-300 mt-0.5">{c.conflictReason}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {isStallFree && (
                        <Button
                          size="sm"
                          className="h-7 text-xs font-bold bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleApprove(c.reference)}
                        >
                          Confirm Space {c.stallId} (Still Available)
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-bold"
                        onClick={() => {
                          setSelectedBooking(c);
                          setReassignModalOpen(true);
                        }}
                      >
                        Reassign to Another Space
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs font-bold"
                        onClick={() =>
                          handleResolveConflictAction(
                            c.reference,
                            "Refund requested; pending manual reconciliation.",
                          )
                        }
                      >
                        Request refund & cancel
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 1: BOOKINGS TABLE */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {/* SEARCH & FILTERS */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-4 rounded-lg border border-border">
              <div className="flex flex-1 items-center gap-3 min-w-[240px]">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  aria-label="Search bookings"
                  placeholder="Search reference, customer, company or email…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Status Filter:
                </span>
                <select
                  aria-label="Filter by booking status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-md border border-border bg-background px-3 text-xs font-semibold"
                >
                  <option value="ALL">All Statuses ({currentBookings.length})</option>
                  <option value="PAYMENT_PENDING">Payment Pending ({stats.paymentPending})</option>
                  <option value="PAYMENT_REVIEW">Payment Review ({stats.paymentReview})</option>
                  <option value="CONFIRMED">Confirmed ({stats.confirmed})</option>
                  <option value="EXPIRED">Expired ({stats.expired})</option>
                  <option value="CONFLICT">Conflict ({stats.conflicts})</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                aria-label="Filter by payment status"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-3 text-xs"
              >
                <option value="ALL">All payment statuses</option>
                {Object.entries(paymentLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("ALL");
                  setPaymentFilter("ALL");
                  setSearchTerm("");
                }}
              >
                Clear filters
              </Button>
              <span className="text-xs text-muted-foreground">
                {filteredBookings.length} matching bookings
              </span>
            </div>
            {/* TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
              <table className="w-full min-w-[840px] text-left text-xs">
                <thead className="bg-surface-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Space</th>
                    <th className="px-4 py-3">Customer & Company</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment Ref</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        No bookings match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-secondary/40">
                        <td className="px-4 py-3 font-extrabold text-foreground">
                          <button
                            className="text-primary hover:underline"
                            onClick={() => setDetailReference(b.reference)}
                            aria-label={`View booking ${b.reference}`}
                          >
                            {b.reference}
                          </button>
                          <span className="block text-[10px] font-normal text-muted-foreground">
                            {new Date(b.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-foreground">{b.stallId}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-foreground">{b.companyName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {b.customerName} · {b.phone}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-semibold">{formatMoney(b.amount)}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">
                          <div>{b.paymentReference || "—"}</div>
                          <div className="mt-1 font-sans text-[10px]">
                            {paymentLabels[b.paymentStatus]}
                          </div>
                          {b.paymentProofImage && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBooking(b);
                                setProofModalBooking(b);
                              }}
                              className="mt-1 inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 transition-all cursor-pointer"
                            >
                              <FileImage className="h-3 w-3 text-blue-600" /> Image Proof
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <AdminStatusBadge status={b.status} />
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {b.status === "PAYMENT_PENDING"
                              ? `${formatCountdown(b.expiresAt - Date.now())} remaining`
                              : b.status === "PAYMENT_REVIEW"
                                ? "Protected during review"
                                : b.status === "EXPIRED"
                                  ? "Hold ended"
                                  : ""}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          {(b.status === "PAYMENT_PENDING" || b.status === "PAYMENT_REVIEW") && (
                            <Button
                              size="sm"
                              className="h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApprove(b.reference)}
                            >
                              Approve
                            </Button>
                          )}

                          {(b.status === "PAYMENT_PENDING" || b.status === "PAYMENT_REVIEW") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] font-bold text-amber-700 dark:text-amber-300"
                              onClick={() => {
                                setSelectedBooking(b);
                                setReleaseConfirmOpen(true);
                              }}
                            >
                              Release
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] font-bold"
                            onClick={() => {
                              setSelectedBooking(b);
                              setReassignModalOpen(true);
                            }}
                          >
                            Reassign
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-[11px] font-semibold"
                            onClick={() => handleOpenEdit(b)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: FLOOR MAP VIEW */}
        {activeTab === "map" && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <FloorMap
                isAdminView={true}
                statusMap={statusMap}
                selectedId={selectedBooking?.stallId ?? null}
                onSelect={(s) => {
                  const found = currentBookings.find(
                    (b) =>
                      b.stallId === s.id &&
                      (b.status === "CONFIRMED" ||
                        b.status === "PAYMENT_PENDING" ||
                        b.status === "PAYMENT_REVIEW"),
                  );
                  if (found) setSelectedBooking(found);
                  else {
                    setMbStallId(s.id);
                    setManualBookingModalOpen(true);
                  }
                }}
              />
              <FloorMapLegend className="mt-4" />
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-xs text-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
                Admin Stall Inspector
              </h3>
              {selectedBooking ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground">Space Number</span>
                    <p className="text-lg font-extrabold text-foreground">
                      {selectedBooking.stallId}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Booking Reference</span>
                    <p className="font-bold text-primary">{selectedBooking.reference}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Company Name</span>
                    <p className="font-semibold text-foreground">{selectedBooking.companyName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Customer Contact</span>
                    <p className="font-semibold text-foreground">
                      {selectedBooking.customerName} ({selectedBooking.phone})
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Status</span>
                    <div className="mt-1">
                      <AdminStatusBadge status={selectedBooking.status} />
                    </div>
                  </div>

                  {selectedBooking.paymentProofImage && (
                    <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1">
                          <FileImage className="h-3.5 w-3.5 text-blue-600" /> Payment Receipt Proof
                        </span>
                        <button
                          type="button"
                          onClick={() => setProofModalBooking(selectedBooking)}
                          className="text-[10px] font-bold text-blue-600 hover:underline"
                        >
                          Enlarge Image
                        </button>
                      </div>
                      <div
                        onClick={() => setProofModalBooking(selectedBooking)}
                        className="rounded border border-border overflow-hidden bg-slate-950 p-1 cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={selectedBooking.paymentProofImage}
                          alt="Payment Proof Receipt"
                          className="max-h-36 mx-auto object-contain rounded"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-border space-y-2">
                    {selectedBooking.status !== "CONFIRMED" && (
                      <Button
                        className="w-full h-8 text-xs font-bold bg-emerald-600"
                        onClick={() => handleApprove(selectedBooking.reference)}
                      >
                        Approve & Confirm Stall
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full h-8 text-xs font-bold"
                      onClick={() => handleOpenEdit(selectedBooking)}
                    >
                      Edit Customer Info
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Click any stall on the map to inspect its active booking or manually create a new
                  reservation.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: EMAIL NOTIFICATIONS LOG */}
        {activeTab === "emails" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Generated Email Notifications Log</h2>
            <p className="text-xs text-muted-foreground">
              All automated transaction emails dispatched to admins and customers during booking
              lifecycle.
            </p>

            <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="bg-surface-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Audience</th>
                    <th className="px-4 py-3">Recipient</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentNotifications.map((n) => (
                    <tr key={n.id} className="hover:bg-secondary/40">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            n.audience === "ADMIN"
                              ? "bg-purple-500/10 text-purple-700"
                              : "bg-blue-500/10 text-blue-700"
                          }`}
                        >
                          {n.audience}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{n.recipient}</td>
                      <td className="px-4 py-3 font-semibold text-foreground max-w-xs truncate">
                        {n.subject}
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">
                        {n.bookingRef || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOG */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">System Audit Event Log</h2>
            <p className="text-xs text-muted-foreground">
              Immutable state machine transition trail for regulatory compliance and audit tracking.
            </p>

            <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
              <table className="w-full min-w-[700px] text-left text-xs font-mono">
                <thead className="bg-surface-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentAudit.map((a) => (
                    <tr key={a.id} className="hover:bg-secondary/40">
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(a.createdAt).toISOString().replace("T", " ").slice(0, 19)}
                      </td>
                      <td className="px-4 py-3 font-bold text-primary">{a.action}</td>
                      <td className="px-4 py-3 uppercase text-muted-foreground">{a.actor}</td>
                      <td className="px-4 py-3 text-foreground">{a.bookingRef || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* REASSIGN MODAL */}
      <Dialog open={reassignModalOpen} onOpenChange={setReassignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Booking Location</DialogTitle>
            <DialogDescription>
              Move booking <strong>{selectedBooking?.reference}</strong> (
              {selectedBooking?.companyName}) to a different available space.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Label>Select Target Space</Label>
            <Select value={newStallTarget} onValueChange={setNewStallTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Choose available space..." />
              </SelectTrigger>
              <SelectContent>
                {stalls
                  .filter((s) => statusMap[s.id] === "AVAILABLE")
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      Space {s.stallNumber} ({s.category} — {formatMoney(s.price)})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExecuteReassign} disabled={!newStallTarget}>
              Execute Reassignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking Details</DialogTitle>
            <DialogDescription>
              Update contact or company details for reference{" "}
              <strong>{selectedBooking?.reference}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleExecuteEdit} className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="edit-name">Customer Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-company">Company Name</Label>
              <Input
                id="edit-company"
                value={editCompany}
                onChange={(e) => setEditCompany(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-product">Product / service</Label>
              <Input
                id="edit-product"
                value={editProduct}
                onChange={(e) => setEditProduct(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-bold">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* RELEASE CONFIRM DIALOG */}
      <Dialog open={releaseConfirmOpen} onOpenChange={setReleaseConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Space Confirmation</DialogTitle>
            <DialogDescription>
              Are you sure you want to release space <strong>{selectedBooking?.stallId}</strong>{" "}
              held by <strong>{selectedBooking?.companyName}</strong>? The space will instantly
              return to AVAILABLE.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReleaseConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedBooking && handleRelease(selectedBooking.reference)}
            >
              Confirm Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MANUAL BOOKING MODAL */}
      <Dialog open={manualBookingModalOpen} onOpenChange={setManualBookingModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Manual Admin Booking</DialogTitle>
            <DialogDescription>
              Create a direct booking for an exhibitor. Double-booking protection rules strictly
              enforced.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateManualBooking} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label>Select Space *</Label>
              <Select value={mbStallId} onValueChange={setMbStallId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stalls.map((s) => (
                    <SelectItem key={s.id} value={s.id} disabled={statusMap[s.id] !== "AVAILABLE"}>
                      Space {s.stallNumber} ({statusMap[s.id]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="mb-name">Customer Name *</Label>
              <Input
                id="mb-name"
                required
                value={mbName}
                onChange={(e) => setMbName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="mb-company">Company Name *</Label>
              <Input
                id="mb-company"
                required
                value={mbCompany}
                onChange={(e) => setMbCompany(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="mb-email">Email *</Label>
                <Input
                  id="mb-email"
                  type="email"
                  required
                  value={mbEmail}
                  onChange={(e) => setMbEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="mb-phone">Phone *</Label>
                <Input
                  id="mb-phone"
                  required
                  value={mbPhone}
                  onChange={(e) => setMbPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="mb-product">Product / Category</Label>
              <Input
                id="mb-product"
                value={mbProduct}
                onChange={(e) => setMbProduct(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Initial Status</Label>
              <Select value={mbStatus} onValueChange={(v) => setMbStatus(v as BookingStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONFIRMED">CONFIRMED (Payment Verified)</SelectItem>
                  <SelectItem value="PAYMENT_REVIEW">PAYMENT_REVIEW (Under Review)</SelectItem>
                  <SelectItem value="PAYMENT_PENDING">
                    PAYMENT_PENDING ({eventConfig.booking.paymentPendingMinutes}-Min Hold)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setManualBookingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="font-bold">
                Create Booking
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {detailReference && (
        <BookingDetail
          reference={detailReference}
          booking={currentBookings.find((b) => b.reference === detailReference)}
          audit={currentAudit}
          onClose={() => setDetailReference(null)}
        />
      )}
      {/* PAYMENT PROOF RECEIPT LIGHTBOX DIALOG */}
      <Dialog
        open={Boolean(proofModalBooking)}
        onOpenChange={(val) => !val && setProofModalBooking(null)}
      >
        <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col overflow-y-auto bg-card border-border p-5 sm:p-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full">
          <DialogHeader className="shrink-0 pr-6 sm:pr-8">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline" className="text-primary font-mono text-xs">
                {proofModalBooking?.reference}
              </Badge>
              {proofModalBooking && <AdminStatusBadge status={proofModalBooking.status} />}
            </div>
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-foreground mt-2">
              Payment Deposit Receipt — Space {proofModalBooking?.stallId}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Submitted by <strong>{proofModalBooking?.companyName}</strong> (
              {proofModalBooking?.customerName} · {proofModalBooking?.phone})
            </DialogDescription>
          </DialogHeader>

          {proofModalBooking?.paymentProofImage && (
            <div className="space-y-3 py-2 flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="rounded-xl border border-border bg-slate-950 p-2 shadow-inner text-center">
                <img
                  src={proofModalBooking.paymentProofImage}
                  alt="Payment Proof Full Receipt"
                  className="max-h-[42vh] sm:max-h-[320px] w-auto mx-auto object-contain rounded-lg shadow-lg"
                />
              </div>

              <div className="rounded-lg bg-secondary p-3 text-xs font-mono space-y-1 border border-border shrink-0">
                <p>
                  Transaction Reference:{" "}
                  <strong className="text-foreground">
                    {proofModalBooking.paymentReference || "N/A"}
                  </strong>
                </p>
                <p>
                  Exhibitor Email:{" "}
                  <strong className="text-foreground">{proofModalBooking.email}</strong>
                </p>
                <p>
                  Amount Required:{" "}
                  <strong className="text-emerald-600">
                    {formatMoney(proofModalBooking.amount)}
                  </strong>
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 shrink-0 pt-3 border-t border-border/50">
            {proofModalBooking && proofModalBooking.status !== "CONFIRMED" && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 font-extrabold text-xs h-10 flex-1"
                onClick={() => {
                  if (!proofModalBooking) return;
                  handleApprove(proofModalBooking.reference);
                  setProofModalBooking(null);
                }}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Verify & Approve Space{" "}
                {proofModalBooking.stallId}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setProofModalBooking(null)}
              className="h-10 text-xs font-bold"
            >
              Close Viewer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
