"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Check, Clock, Lock } from "lucide-react";
import { cn } from "@/lib/cn";

export type PhaseNodeData = {
  title: string;
  phase: string;
  weeks: number;
  skills: string[];
  done: boolean;
  active: boolean;
  locked: boolean;
};

const phaseTone: Record<string, string> = {
  Foundations: "text-accent-cyan",
  Core: "text-brand-300",
  Specialization: "text-accent-violet",
  "Job-ready": "text-accent-pink",
};

export function PhaseNode({ data, selected }: NodeProps) {
  const d = data as unknown as PhaseNodeData;
  return (
    <div
      className={cn(
        "w-64 rounded-2xl border bg-bg-card/95 p-4 backdrop-blur transition-all duration-200",
        selected
          ? "border-brand-400 shadow-glow"
          : d.active
            ? "border-brand-400/50"
            : "border-white/10 hover:border-white/20",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-0 !bg-brand-400"
      />

      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-wider",
            phaseTone[d.phase] || "text-ink-dim",
          )}
        >
          {d.phase || "Step"}
        </span>
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold",
            d.done
              ? "bg-brand-500 text-white"
              : d.locked
                ? "bg-white/5 text-ink-dim"
                : "border border-brand-400/60 text-brand-300",
          )}
        >
          {d.done ? (
            <Check className="h-3.5 w-3.5" />
          ) : d.locked ? (
            <Lock className="h-3 w-3" />
          ) : (
            "→"
          )}
        </span>
      </div>

      <h4 className="mt-2 text-sm font-semibold leading-snug text-ink">
        {d.title}
      </h4>

      {d.skills.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {d.skills.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-ink-soft"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {d.weeks > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-dim">
          <Clock className="h-3 w-3" />~{d.weeks} weeks
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-0 !bg-brand-400"
      />
    </div>
  );
}
