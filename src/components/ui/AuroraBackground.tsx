"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

const delay6: CSSProperties = { animationDelay: "-6s" };
const delay12: CSSProperties = { animationDelay: "-12s" };

/**
 * Animated aurora / mesh-gradient backdrop. Pure CSS, GPU-friendly, decorative.
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      <div className="absolute -left-[10%] -top-[20%] h-[55vh] w-[55vh] rounded-full bg-brand-600/30 blur-[120px] animate-aurora-shift" />
      <div
        className="absolute right-[-10%] top-[5%] h-[50vh] w-[50vh] rounded-full bg-accent-cyan/20 blur-[120px] animate-aurora-shift"
        style={delay6}
      />
      <div
        className="absolute bottom-[-20%] left-[30%] h-[50vh] w-[50vh] rounded-full bg-accent-violet/20 blur-[120px] animate-aurora-shift"
        style={delay12}
      />
      <div className="absolute inset-0 grain opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/40 to-bg" />
    </div>
  );
}
