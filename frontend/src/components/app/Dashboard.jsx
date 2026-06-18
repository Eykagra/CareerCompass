import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Compass,
  Download,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuthActions } from "@/lib/auth-client";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  deleteMap as apiDeleteMap,
  exportMapJson,
  fetchMap,
  fetchMaps,
} from "@/lib/maps-client";

export function Dashboard({ user }) {
  const { logout } = useAuthActions();
  const [maps, setMaps] = useState([]);
  const [limit, setLimit] = useState(3);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  async function refresh() {
    try {
      const data = await fetchMaps();
      setMaps(data.maps);
      setLimit(data.limit);
    } catch {
      /* ignore — show empty */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onDelete(id) {
    if (!confirm("Delete this roadmap? This cannot be undone.")) return;
    setBusyId(id);
    const ok = await apiDeleteMap(id);
    if (ok) setMaps((m) => m.filter((x) => x.id !== id));
    setBusyId(null);
  }

  async function onExport(id) {
    setBusyId(id);
    try {
      const full = await fetchMap(id);
      exportMapJson(full);
    } finally {
      setBusyId(null);
    }
  }

  const atLimit = maps.length >= limit;
  const totalCompleted = maps.reduce((s, m) => s + m.completedCount, 0);
  const totalSteps = maps.reduce((s, m) => s + m.nodeCount, 0);

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-white/8 bg-bg/80 px-5 backdrop-blur">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 shadow-glow">
            <Compass className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Career<span className="text-brand-300">Compass</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <ButtonLink to="/app" variant="ghost" size="sm">
            <MapIcon className="h-3.5 w-3.5" /> Workspace
          </ButtonLink>
          {user && (
            <>
              <div className="mx-1.5 h-4 w-px bg-white/10" />
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name ?? "Account"}
                  referrerPolicy="no-referrer"
                  className="h-7 w-7 rounded-full border border-white/15"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600/30 text-xs font-semibold text-brand-300 ring-1 ring-brand-400/30">
                  {(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}
                </span>
              )}
              {user.name && (
                <span className="hidden text-sm text-ink-soft sm:block">
                  {user.name.split(" ")[0]}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-ink-dim"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        {/* Page heading */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600/20 ring-1 ring-brand-400/30">
              <LayoutDashboard className="h-5 w-5 text-brand-300" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {user?.name ? `${user.name.split(" ")[0]}'s roadmaps` : "Your roadmaps"}
              </h1>
              <p className="text-xs text-ink-dim">
                {maps.length} of {limit} saved · free plan
              </p>
            </div>
          </div>
          <ButtonLink
            to="/app?new=1"
            variant={atLimit ? "secondary" : "primary"}
            size="sm"
          >
            <Plus className="h-3.5 w-3.5" /> New roadmap
          </ButtonLink>
        </div>

        {/* Stats strip */}
        {!loading && maps.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatCard
              label="Saved maps"
              value={`${maps.length} / ${limit}`}
              sub={
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-cyan transition-all"
                    style={{
                      width: `${Math.min(100, (maps.length / limit) * 100)}%`,
                    }}
                  />
                </div>
              }
            />
            <StatCard
              label="Steps completed"
              value={totalCompleted}
              sub={
                <p className="mt-1 text-xs text-ink-dim">
                  of {totalSteps} total steps
                </p>
              }
            />
            <StatCard
              label="Overall progress"
              value={
                totalSteps > 0
                  ? `${Math.round((totalCompleted / totalSteps) * 100)}%`
                  : "—"
              }
              sub={
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-violet to-accent-cyan transition-all"
                    style={{
                      width:
                        totalSteps > 0
                          ? `${Math.round((totalCompleted / totalSteps) * 100)}%`
                          : "0%",
                    }}
                  />
                </div>
              }
            />
          </div>
        )}

        {/* Map limit banner */}
        {atLimit && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-200">
            <span className="shrink-0 text-base">⚠️</span>
            <span>
              You&apos;ve reached the 3-map free limit. Delete a roadmap to save
              a new one, or upgrade to Pro.
            </span>
          </div>
        )}

        {/* Map cards */}
        {loading ? (
          <div className="mt-20 flex flex-col items-center gap-3 text-ink-dim">
            <Compass className="h-7 w-7 animate-spin" />
            <span className="text-sm">Loading your roadmaps…</span>
          </div>
        ) : maps.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {maps.map((m) => (
              <MapCard
                key={m.id}
                map={m}
                busy={busyId === m.id}
                onExport={() => onExport(m.id)}
                onDelete={() => onDelete(m.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-bg-card/60 px-4 py-3.5">
      <p className="text-xs text-ink-dim">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {sub}
    </div>
  );
}

function MapCard({ map, busy, onExport, onDelete }) {
  const pct =
    map.nodeCount > 0
      ? Math.round((map.completedCount / map.nodeCount) * 100)
      : 0;

  return (
    <div className="group flex flex-col rounded-2xl border border-white/8 bg-bg-card/60 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400/30 hover:shadow-glow">
      <Link to={`/app?map=${map.id}`} className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold leading-snug">
          {map.title}
        </h3>
        <p className="mt-1 text-xs text-ink-dim">
          {map.nodeCount} steps · updated{" "}
          {new Date(map.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      </Link>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-ink-dim">
          <span>
            {map.completedCount} / {map.nodeCount} completed
          </span>
          <span className="font-medium text-ink-soft">{pct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-cyan transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <ButtonLink
          to={`/app?map=${map.id}`}
          variant="secondary"
          size="sm"
          className="flex-1"
        >
          Open <ArrowRight className="h-3.5 w-3.5" />
        </ButtonLink>
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={onExport}
          aria-label="Export as JSON"
          title="Export as JSON"
          className="h-8 w-8 p-0 text-ink-dim hover:text-ink"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={onDelete}
          aria-label="Delete roadmap"
          title="Delete roadmap"
          className="h-8 w-8 p-0 text-ink-dim hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-2xl" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-bg-card">
          <MapIcon className="h-7 w-7 text-brand-300" />
        </span>
      </div>
      <h2 className="mt-6 text-xl font-semibold tracking-tight">
        No roadmaps yet
      </h2>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
        Generate your first personalized career roadmap — it&apos;ll appear here
        so you can revisit, track progress, and export it anytime.
      </p>
      <ButtonLink to="/app?new=1" className="mt-7 group">
        Build my first roadmap
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </ButtonLink>
    </div>
  );
}
