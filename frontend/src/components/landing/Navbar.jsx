import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Compass, Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useSession } from "@/lib/auth-client";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar() {
  const { data: session } = useSession();
  const authed = Boolean(session?.user);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-bg/70 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-glow">
            <Compass className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Career<span className="text-brand-300">Compass</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {authed ? (
            <>
              <ButtonLink to="/dashboard" variant="ghost" size="sm">
                My maps
              </ButtonLink>
              <ButtonLink to="/app" size="sm">
                Open app
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink to="/signin" variant="ghost" size="sm">
                Sign in
              </ButtonLink>
              <ButtonLink to="/signin" size="sm">
                Start free
              </ButtonLink>
            </>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft hover:text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-bg/95 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-ink-soft hover:bg-white/5 hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <ButtonLink
              to={authed ? "/dashboard" : "/signin"}
              variant="ghost"
              className="mt-2 w-full"
            >
              {authed ? "My maps" : "Sign in"}
            </ButtonLink>
            <ButtonLink
              to={authed ? "/app" : "/signin"}
              className="mt-1 w-full"
            >
              {authed ? "Open app" : "Start free"}
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
