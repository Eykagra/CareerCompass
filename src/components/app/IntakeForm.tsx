"use client";

import { useState } from "react";
import { ArrowRight, Compass, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Budget, Stage, UserProfile } from "@/lib/schema";

const STAGES: Array<{ label: string; value: Stage }> = [
  { label: "High school", value: "high_school" },
  { label: "In college", value: "college" },
  { label: "New grad", value: "new_grad" },
  { label: "Switching careers", value: "career_switcher" },
  { label: "Self-taught", value: "self_taught" },
];

const TIME: Array<{ label: string; value: number }> = [
  { label: "< 5 hrs/wk", value: 4 },
  { label: "5–10 hrs/wk", value: 8 },
  { label: "10–20 hrs/wk", value: 15 },
  { label: "20+ hrs/wk", value: 25 },
];

const BUDGETS: Array<{ label: string; value: Budget }> = [
  { label: "Free only", value: "free" },
  { label: "Up to ~$50/mo", value: "low" },
  { label: "Flexible", value: "flexible" },
];

const TIMELINE: Array<{ label: string; value: number }> = [
  { label: "3 months", value: 3 },
  { label: "6 months", value: 6 },
  { label: "1 year", value: 12 },
  { label: "2 years", value: 24 },
];

export function IntakeForm({
  onSubmit,
  loading,
  error,
}: {
  onSubmit: (profile: UserProfile) => void;
  loading: boolean;
  error?: string | null;
}) {
  const [goal, setGoal] = useState("");
  const [stage, setStage] = useState<Stage>("new_grad");
  const [hoursPerWeek, setHoursPerWeek] = useState(8);
  const [budget, setBudget] = useState<Budget>("free");
  const [timelineMonths, setTimelineMonths] = useState(6);
  const [skillsText, setSkillsText] = useState("");

  const canSubmit = goal.trim().length > 2 && !loading;

  function handleSubmit() {
    const knownSkills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40)
      .map((s) => s.slice(0, 60));
    onSubmit({
      goal: goal.trim().slice(0, 120),
      stage,
      knownSkills,
      hoursPerWeek,
      budget,
      timelineMonths,
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8 text-center">
        <span className="flex mx-auto h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-glow">
          <Compass className="h-6 w-6 text-white" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          Let’s map your path
        </h1>
        <p className="mt-2 text-ink-soft">
          Tell us your goal and where you are today. Takes about 30 seconds.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) handleSubmit();
        }}
        className="glass space-y-7 rounded-3xl p-6 sm:p-8"
      >
        <Field label="What do you want to become?" required>
          <input
            autoFocus
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Backend engineer, UX designer, data scientist…"
            className="w-full rounded-xl border border-white/10 bg-bg/60 px-4 py-3 text-sm outline-none placeholder:text-ink-dim focus:border-brand-400/50"
          />
        </Field>

        <Field label="Where are you now?">
          <Chips
            options={STAGES}
            value={stage}
            onChange={(v) => setStage(v as Stage)}
          />
        </Field>

        <div className="grid gap-7 sm:grid-cols-2">
          <Field label="Time per week">
            <Chips
              options={TIME}
              value={hoursPerWeek}
              onChange={(v) => setHoursPerWeek(v as number)}
              small
            />
          </Field>
          <Field label="Target timeline">
            <Chips
              options={TIMELINE}
              value={timelineMonths}
              onChange={(v) => setTimelineMonths(v as number)}
              small
            />
          </Field>
        </div>

        <Field label="Budget">
          <Chips
            options={BUDGETS}
            value={budget}
            onChange={(v) => setBudget(v as Budget)}
            small
          />
        </Field>

        <Field label="Skills you already have (optional)">
          <input
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="Comma separated — e.g. Python, Git, basic SQL"
            className="w-full rounded-xl border border-white/10 bg-bg/60 px-4 py-3 text-sm outline-none placeholder:text-ink-dim focus:border-brand-400/50"
          />
        </Field>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={!canSubmit}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Building your
              roadmap…
            </>
          ) : (
            <>
              Generate my roadmap
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-brand-300">*</span>}
      </label>
      {children}
    </div>
  );
}

function Chips<T extends string | number>({
  options,
  value,
  onChange,
  small,
}: {
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (v: T) => void;
  small?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-xl border px-3.5 py-2 text-sm transition-all",
            small && "px-3 py-1.5 text-xs",
            value === o.value
              ? "border-brand-400/60 bg-brand-500/15 text-ink"
              : "border-white/10 bg-white/[0.02] text-ink-soft hover:border-white/20",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
