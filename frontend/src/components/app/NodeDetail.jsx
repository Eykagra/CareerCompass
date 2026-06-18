import { Check, Clock, ExternalLink, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function NodeDetail({ node, done, onToggle, onClose }) {
  if (!node) return null;
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-white/8 p-5">
        <div>
          {node.phase && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-300">
              {node.phase}
            </span>
          )}
          <h3 className="mt-1 text-lg font-semibold leading-snug">
            {node.title}
          </h3>
          {node.estimatedWeeks > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-dim">
              <Clock className="h-3.5 w-3.5" />~{node.estimatedWeeks} weeks
            </div>
          )}
        </div>
        <button
          aria-label="Close"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft hover:bg-white/5 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {node.why && (
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
              Why it matters
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {node.why}
            </p>
          </section>
        )}

        {node.skills.length > 0 && (
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
              Skills you&apos;ll build
            </h4>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {node.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-lg border border-white/8 bg-white/5 px-2.5 py-1 text-xs text-ink-soft"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {node.resources.length > 0 && (
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
              Resources
            </h4>
            <ul className="mt-2.5 space-y-2">
              {node.resources.map((r) => {
                const inner = (
                  <span className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5 text-sm transition-colors hover:border-white/15">
                    <span className="text-ink-soft">{r.name}</span>
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                          r.cost === "free"
                            ? "bg-green-500/15 text-green-300"
                            : "bg-amber-500/15 text-amber-300",
                        )}
                      >
                        {r.cost}
                      </span>
                      {r.url && (
                        <ExternalLink className="h-3.5 w-3.5 text-ink-dim" />
                      )}
                    </span>
                  </span>
                );
                return (
                  <li key={r.name}>
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noopener noreferrer">
                        {inner}
                      </a>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      <div className="border-t border-white/8 p-5">
        <Button
          variant={done ? "secondary" : "primary"}
          className="w-full"
          onClick={() => onToggle(node.id)}
        >
          {done ? (
            <>
              <RotateCcw className="h-4 w-4" /> Mark as not done
            </>
          ) : (
            <>
              <Check className="h-4 w-4" /> Mark as complete
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
