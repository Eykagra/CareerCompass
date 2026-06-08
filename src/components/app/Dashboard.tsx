"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Download,
  LogOut,
  Map as MapIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  deleteMap as apiDeleteMap,
  exportMapJson,
  fetchMap,
  fetchMaps,
  type MapSummary,
} from "@/lib/maps-client";

type AccountUser = {
  name: string | null;
  email: string | null;
  image: string | null;
};

export function Dashboard({ user }: { user?: AccountUser | null }) {
  const [maps, setMaps] = useState<MapSummary[]>([]);
  const [limit, setLimit] = useState(3);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  async function onDelete(id: string) {
    if (!confirm("Delete this roadmap? This cannot be undone.")) return;
    setBusyId(id);
    const ok = await apiDeleteMap(id);
    if (ok) setMaps((m) => m.filter((x) => x.id !== id));
    setBusyId(null);
  }

  async function onExport(id: string) {
    setBusyId(id);
    try {
      const full = await fetchMap(id);
      exportMapJson(full);
    } finally {
      setBusyId(null);
    }
  }

  const atLimit = maps.length >= limit;

  return (
    <div className="min-h-screen">
      <header className="flex h-14 items-center justify-between border-b border-white/8 bg-bg/80 px-4 backdrop-blur">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600">
            <Compass className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm font-semibold">CareerCompass</span>
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "Account"}
                  referrerPolicy="no-referrer"
                  className="h-7 w-7 rounded-full border border-white/10"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
                  {(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Your maps</h1>
            <p className="mt-1 text-sm text-ink-soft">
              {maps.length} of {limit} saved roadmaps used on the free plan.
            </p>
          </div>
          <ButtonLink
            href="/app?new=1"
            variant={atLimit ? "secondary" : "primary"}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" /> New roadmap
          </ButtonLink>
        </div>

        {/* Usage meter */}
        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-cyan transition-all"
            style={{ width: `${Math.min(100, (maps.length / limit) * 100)}%` }}
          />
        </div>

        {loading ? (
          <div className="mt-16 flex justify-center text-ink-dim">
            <Compass className="h-6 w-6 animate-spin" />
          </div>
        ) : maps.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-inset ring-white/10">
              <MapIcon className="h-6 w-6 text-ink-soft" />
            </span>
            <h2 className="mt-5 text-lg font-semibold">No saved maps yet</h2>
            <p className="mt-1 max-w-sm text-sm text-ink-soft">
              Generate your first personalized roadmap and it&apos;ll show up
              here, ready to revisit and export.
            </p>
            <ButtonLink href="/app?new=1" className="mt-6">
              <Plus className="h-4 w-4" /> Build my first roadmap
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {maps.map((m) => (
              <div
                key={m.id}
                className="flex flex-col rounded-2xl border border-white/8 bg-bg-card/60 p-5 transition-colors hover:border-brand-400/30"
              >
                <Link href={`/app?map=${m.id}`} className="flex-1">
                  <h3 className="text-base font-semibold leading-snug">
                    {m.title}
                  </h3>
                  <p className="mt-1 text-xs text-ink-dim">
                    {m.nodeCount} steps · {m.completedCount} completed ·{" "}
                    {new Date(m.updatedAt).toLocaleDateString()}
                  </p>
                </Link>
                <div className="mt-4 flex items-center gap-2">
                  <ButtonLink
                    href={`/app?map=${m.id}`}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                  >
                    Open
                  </ButtonLink>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busyId === m.id}
                    onClick={() => onExport(m.id)}
                    aria-label="Export"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busyId === m.id}
                    onClick={() => onDelete(m.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
