import { cn } from "@/lib/cn";

export function Badge({ children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-ink-soft backdrop-blur",
        className,
      )}
    >
      {children}
    </span>
  );
}
