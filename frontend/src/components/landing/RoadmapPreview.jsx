import { Check, Lock, MessageSquareText } from "lucide-react";

/**
 * A static, premium mock of the product surface used in the hero. Pure markup
 * (no canvas libs) so it renders instantly and looks great on first paint.
 */
const steps = [
  {
    phase: "Foundations",
    title: "Programming fundamentals",
    weeks: 4,
    done: true,
  },
  {
    phase: "Foundations",
    title: "Data structures & algorithms",
    weeks: 6,
    done: true,
  },
  {
    phase: "Core",
    title: "Databases & SQL",
    weeks: 3,
    done: false,
    active: true,
  },
  { phase: "Core", title: "Build a REST API", weeks: 4, done: false },
  {
    phase: "Specialization",
    title: "Distributed systems",
    weeks: 6,
    done: false,
    locked: true,
  },
];

export function RoadmapPreview() {
  return (
    <div className="glass mx-auto max-w-5xl rounded-4xl p-2 shadow-card">
      <div className="rounded-[1.6rem] border border-white/5 bg-bg-soft/80">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3.5">
          <span className="h-3 w-3 rounded-full bg-red-400/70" />
          <span className="h-3 w-3 rounded-full bg-amber-400/70" />
          <span className="h-3 w-3 rounded-full bg-green-400/70" />
          <span className="ml-3 text-xs text-ink-dim">
            careercompass.app / backend-engineer
          </span>
        </div>

        <div className="grid gap-0 md:grid-cols-[1.5fr_1fr]">
          {/* roadmap */}
          <div className="space-y-3 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-300">
              Backend Engineer · personalized
            </p>
            <div className="space-y-2.5">
              {steps.map((s) => (
                <div
                  key={s.title}
                  className={[
                    "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
                    s.active
                      ? "border-brand-400/50 bg-brand-500/10"
                      : "border-white/8 bg-white/[0.02]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                      s.done
                        ? "bg-brand-500 text-white"
                        : s.locked
                          ? "bg-white/5 text-ink-dim"
                          : "border border-brand-400/60 text-brand-300",
                    ].join(" ")}
                  >
                    {s.done ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : s.locked ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      "→"
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {s.title}
                    </p>
                    <p className="text-xs text-ink-dim">
                      {s.phase} · ~{s.weeks} weeks
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* mentor */}
          <div className="border-t border-white/5 p-6 md:border-l md:border-t-0">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-ink">
              <MessageSquareText className="h-4 w-4 text-brand-300" />
              AI Mentor
            </div>
            <div className="space-y-3">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand-600/30 px-3.5 py-2.5 text-sm text-ink">
                I only have weekends now — can I still finish in 6 months?
              </div>
              <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-white/8 bg-white/[0.03] px-3.5 py-2.5 text-sm leading-relaxed text-ink-soft">
                Yes. I’d trim &quot;Distributed systems&quot; for now and keep
                you on the API project — that&apos;s the highest-signal step for
                interviews. Updated your timeline.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
