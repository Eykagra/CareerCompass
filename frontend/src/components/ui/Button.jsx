import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary:
    "text-white shadow-glow bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 hover:shadow-[0_0_0_1px_rgba(129,140,248,0.3),0_24px_70px_-18px_rgba(79,70,229,0.65)]",
  secondary: "glass text-ink hover:bg-white/[0.07] hover:border-white/20",
  ghost: "text-ink-soft hover:text-ink hover:bg-white/5",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  to,
  children,
  ...props
}) {
  const isExternalOrAnchor = to.startsWith("#") || to.startsWith("http") || to.startsWith("mailto:");
  
  if (isExternalOrAnchor) {
    return (
      <a
        href={to}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={to}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
