import { useEffect, useMemo, useState } from "react";
import {
  Compass,
  Download,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthActions } from "@/lib/auth-client";
import { IntakeForm } from "./IntakeForm";
import { RoadmapCanvas } from "./RoadmapCanvas";
import { NodeDetail } from "./NodeDetail";
import { MentorChat } from "./MentorChat";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  clearChat,
  clearSession,
  loadSession,
  saveSession,
} from "@/lib/storage";
import {
  exportMapJson,
  fetchMap,
  patchCompleted,
  saveMap,
} from "@/lib/maps-client";

export function Workspace({ user }) {
  const { logout } = useAuthActions();
  const [phase, setPhase] = useState("intake");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [panel, setPanel] = useState("mentor");
  const [hydrated, setHydrated] = useState(false);
  const [panelWidth, setPanelWidth] = useState(380);
  const [panelOpen, setPanelOpen] = useState(true);
  const [mapId, setMapId] = useState(null);
  const [saveNotice, setSaveNotice] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("map");
    const isNew = params.get("new") === "1";

    async function init() {
      if (isNew) {
        clearSession();
        clearChat();
        window.history.replaceState(null, "", "/app");
        setHydrated(true);
        return;
      }

      if (requested) {
        try {
          const m = await fetchMap(requested);
          setMapId(m.id);
          setProfile(m.profile);
          setRoadmap(m.roadmap);
          setCompleted(m.completed);
          setPhase("ready");
          clearChat();
          setHydrated(true);
          return;
        } catch {
          /* fall through to local session */
        }
      }

      const saved = loadSession();
      if (saved) {
        if (saved.mapId) {
          try {
            await fetchMap(saved.mapId);
          } catch {
            clearSession();
            clearChat();
            setHydrated(true);
            return;
          }
        }
        setMapId(saved.mapId ?? null);
        setProfile(saved.profile);
        setRoadmap(saved.roadmap);
        setCompleted(saved.completed);
        setPhase("ready");
      }
      setHydrated(true);
    }
    init();
  }, []);

  useEffect(() => {
    if (phase === "ready" && profile && roadmap) {
      const session = {
        id: "local",
        mapId,
        profile,
        roadmap,
        completed,
        createdAt: Date.now(),
      };
      saveSession(session);
    }
  }, [phase, profile, roadmap, completed, mapId]);

  const completedSet = useMemo(() => new Set(completed), [completed]);
  const selectedNode = useMemo(
    () => roadmap?.nodes.find((n) => n.id === selectedId) ?? null,
    [roadmap, selectedId],
  );

  async function generate(p) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const data = await res.json();
      if (!res.ok || !data.roadmap) {
        throw new Error(data.error || "Could not generate your roadmap.");
      }
      const graph = data.roadmap;
      clearChat();
      setProfile(p);
      setRoadmap(graph);
      setCompleted([]);
      setSelectedId(null);
      setPanel("mentor");
      setPanelOpen(true);
      setPhase("ready");

      const result = await saveMap({ profile: p, roadmap: graph });
      if (result.ok) {
        setMapId(result.map.id);
        window.history.replaceState(null, "", `/app?map=${result.map.id}`);
      } else {
        setMapId(null);
        setSaveNotice(
          result.limitReached
            ? `${result.error} Your roadmap is still here, but won't be saved.`
            : result.error,
        );
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleComplete(id) {
    setCompleted((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      if (mapId) void patchCompleted(mapId, next);
      return next;
    });
  }

  function exportCurrent() {
    if (!profile || !roadmap) return;
    exportMapJson({
      title: roadmap.title || profile.goal,
      profile,
      roadmap,
      completed,
    });
  }

  function reset() {
    clearSession();
    clearChat();
    setProfile(null);
    setRoadmap(null);
    setCompleted([]);
    setSelectedId(null);
    setError(null);
    setMapId(null);
    setSaveNotice(null);
    window.history.replaceState(null, "", "/app");
    setPhase("intake");
  }

  function selectNode(id) {
    setSelectedId(id);
    setPanel("detail");
    setPanelOpen(true);
  }

  const MIN_PANEL = 300;
  const MAX_PANEL = 560;

  function startResize(e) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;

    function onMove(ev) {
      const next = startWidth + (startX - ev.clientX);
      setPanelWidth(Math.min(MAX_PANEL, Math.max(MIN_PANEL, next)));
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  }

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center text-ink-dim">
        <Compass className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (phase === "intake" || !roadmap || !profile) {
    return (
      <div className="relative min-h-screen">
        <TopBar onReset={null} title="New roadmap" user={user} onLogout={logout} />
        <div className="flex min-h-screen items-center justify-center px-5 py-24">
          <IntakeForm onSubmit={generate} loading={loading} error={error} />
        </div>
      </div>
    );
  }

  const progress = Math.round(
    (completed.length / Math.max(roadmap.nodes.length, 1)) * 100,
  );

  return (
    <div className="flex h-screen flex-col">
      <TopBar
        onReset={reset}
        title={roadmap.title || profile.goal}
        progress={progress}
        user={user}
        onExport={exportCurrent}
        onLogout={logout}
      />

      {saveNotice && (
        <div className="flex items-center justify-between gap-3 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
          <span>{saveNotice}</span>
          <button
            onClick={() => setSaveNotice(null)}
            className="rounded p-1 hover:bg-white/10"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div className="relative min-h-0 flex-1">
          <RoadmapCanvas
            roadmap={roadmap}
            completed={completedSet}
            onSelect={selectNode}
          />
          {roadmap.summary && (
            <div className="pointer-events-none absolute left-5 top-5 max-w-md">
              <div className="glass pointer-events-auto rounded-2xl px-4 py-3">
                <p className="text-xs leading-relaxed text-ink-soft">
                  {roadmap.summary}
                </p>
              </div>
            </div>
          )}
          {!panelOpen && (
            <button
              onClick={() => setPanelOpen(true)}
              className="glass absolute right-5 top-5 hidden items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium text-ink-soft transition-colors hover:text-ink lg:flex"
            >
              <PanelRightOpen className="h-4 w-4" /> Mentor
            </button>
          )}
        </div>

        {panelOpen && (
          <>
            <div
              onMouseDown={startResize}
              className="hidden w-1 shrink-0 cursor-col-resize bg-white/8 transition-colors hover:bg-brand-400/50 lg:block"
              role="separator"
              aria-orientation="vertical"
            />

            <aside
              className="hidden shrink-0 border-l border-white/8 bg-bg-soft/40 lg:flex lg:flex-col"
              style={{ width: `${panelWidth}px` }}
            >
              <div className="flex items-center gap-1 border-b border-white/8 p-2">
                <PanelTab
                  active={panel === "mentor"}
                  onClick={() => setPanel("mentor")}
                  icon={<MessagesSquare className="h-4 w-4" />}
                  label="Mentor"
                />
                <PanelTab
                  active={panel === "detail"}
                  onClick={() => setPanel("detail")}
                  icon={<PanelRightClose className="h-4 w-4" />}
                  label="Step"
                  disabled={!selectedNode}
                />
                <button
                  onClick={() => setPanelOpen(false)}
                  className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-white/5 hover:text-ink"
                  aria-label="Close panel"
                  title="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1">
                {panel === "mentor" ? (
                  <MentorChat profile={profile} roadmap={roadmap} />
                ) : (
                  <NodeDetail
                    node={selectedNode}
                    done={
                      selectedNode ? completedSet.has(selectedNode.id) : false
                    }
                    onToggle={toggleComplete}
                    onClose={() => setPanel("mentor")}
                  />
                )}
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

function TopBar({
  title,
  onReset,
  progress,
  user,
  onExport,
  onLogout,
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-bg/80 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600">
            <Compass className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm font-semibold">CareerCompass</span>
        </Link>
        <span className="hidden text-ink-dim sm:inline">/</span>
        <span className="hidden max-w-[40vw] truncate text-sm text-ink-soft sm:inline">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {typeof progress === "number" && (
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-cyan transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-ink-dim">{progress}%</span>
          </div>
        )}
        <ButtonLink to="/dashboard" variant="ghost" size="sm">
          <LayoutDashboard className="h-3.5 w-3.5" /> My maps
        </ButtonLink>
        {onExport && (
          <Button variant="ghost" size="sm" onClick={onExport}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        )}
        {onReset && (
          <Button variant="secondary" size="sm" onClick={onReset}>
            <RotateCcw className="h-3.5 w-3.5" /> New
          </Button>
        )}
        {user && (
          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            {user.image ? (
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
              onClick={onLogout}
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

function PanelTab({
  active,
  onClick,
  icon,
  label,
  disabled,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-white/[0.06] text-ink"
          : "text-ink-soft hover:text-ink disabled:opacity-30 disabled:hover:text-ink-soft",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
