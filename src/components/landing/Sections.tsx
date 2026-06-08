import {
  Brain,
  Compass,
  GitBranch,
  Goal,
  LineChart,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Check,
  ArrowRight,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Reveal>
        <Badge>{eyebrow}</Badge>
      </Reveal>
      <Reveal delay={60}>
        <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={120}>
          <p className="mt-4 text-pretty text-base leading-relaxed text-ink-soft">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}

const features = [
  {
    icon: GitBranch,
    title: "Branching roadmaps",
    body: "Not a flat checklist. Real decision forks — frontend vs backend, bootcamp vs self-taught — so you see your options, not just one path.",
  },
  {
    icon: Goal,
    title: "Starts where you are",
    body: "A quick intake captures your stage, skills, time, and budget. Your roadmap begins from your real starting point, skipping what you already know.",
  },
  {
    icon: MessagesSquare,
    title: "AI mentor, always on",
    body: "Ask why a step matters, what to skip, or how to adapt. The mentor knows your roadmap and re-routes it live as your constraints change.",
  },
  {
    icon: LineChart,
    title: "Progress that adapts",
    body: "Check off milestones and watch your timeline recalculate. Honest week estimates, never busywork padding.",
  },
  {
    icon: Brain,
    title: "Grounded recommendations",
    body: "Each node ships with concrete skills and real resources — curated, free-first, and matched to your budget.",
  },
  {
    icon: ShieldCheck,
    title: "Yours to keep",
    body: "Export to PDF, share a link, or revisit anytime. Your roadmap is a living plan, not a one-off answer.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Why CareerCompass"
          title="Guidance that feels like a great mentor"
          subtitle="Most career advice is generic. CareerCompass builds a plan around your actual situation and stays with you as it evolves."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 80}>
              <article className="group h-full rounded-3xl border border-white/8 bg-bg-card/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/30 hover:shadow-glow">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 text-brand-300 ring-1 ring-inset ring-white/10">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {f.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    n: "01",
    title: "Tell us your goal",
    body: "“Become a backend engineer.” Type it in plain language — no forms to wrestle with.",
  },
  {
    n: "02",
    title: "Share where you are",
    body: "A 30-second intake: your stage, current skills, weekly time, and budget. Or paste your resume.",
  },
  {
    n: "03",
    title: "Get your branching roadmap",
    body: "A personalized node-and-arrow map from today to your goal, with phases, skills, and resources.",
  },
  {
    n: "04",
    title: "Walk it with your mentor",
    body: "Ask questions, check off steps, and let the AI mentor adapt the path as life changes.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24 md:py-32">
      <div className="absolute inset-x-0 top-1/2 mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="How it works"
          title="From a vague goal to a clear plan in minutes"
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={(i % 4) * 80}>
              <div className="relative h-full rounded-3xl border border-white/8 bg-bg-card/60 p-6">
                <span className="bg-gradient-to-br from-brand-300 to-accent-violet bg-clip-text font-mono text-3xl font-bold text-transparent">
                  {s.n}
                </span>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const tiers = [
  {
    name: "Explorer",
    price: "$0",
    cadence: "forever",
    desc: "Try the full experience.",
    cta: "Start free",
    featured: false,
    perks: [
      "1 active roadmap",
      "AI mentor (fair-use)",
      "Branching paths",
      "Progress tracking",
    ],
  },
  {
    name: "Pro",
    price: "$12",
    cadence: "per month",
    desc: "For serious career moves.",
    cta: "Go Pro",
    featured: true,
    perks: [
      "Unlimited roadmaps",
      "Unlimited mentor chat",
      "Resume-based intake",
      "PDF export & sharing",
      "Priority generation",
    ],
  },
  {
    name: "Teams",
    price: "Custom",
    cadence: "per seat",
    desc: "Bootcamps, schools & coaches.",
    cta: "Contact sales",
    featured: false,
    perks: [
      "Everything in Pro",
      "Cohort dashboards",
      "Branded roadmaps",
      "SSO & admin",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Pricing"
          title="Start free. Upgrade when it pays off."
          subtitle="No credit card to begin. Cancel anytime."
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 80}>
              <div
                className={[
                  "relative flex h-full flex-col rounded-3xl border p-7",
                  t.featured
                    ? "border-brand-400/40 bg-gradient-to-b from-brand-500/10 to-bg-card/60 shadow-glow"
                    : "border-white/8 bg-bg-card/60",
                ].join(" ")}
              >
                {t.featured && (
                  <span className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white">
                    <Sparkles className="h-3 w-3" /> Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <p className="mt-1 text-sm text-ink-soft">{t.desc}</p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-tight">
                    {t.price}
                  </span>
                  <span className="text-sm text-ink-dim">/ {t.cadence}</span>
                </div>
                <ul className="mb-6 mt-6 space-y-3">
                  {t.perks.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2.5 text-sm text-ink-soft"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                      {p}
                    </li>
                  ))}
                </ul>
                <ButtonLink
                  href="/app"
                  variant={t.featured ? "primary" : "secondary"}
                  className="mt-auto w-full"
                >
                  {t.cta}
                </ButtonLink>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqs = [
  [
    "How is this different from a generic AI chatbot?",
    "CareerCompass turns your goal and current status into a structured, branching roadmap you can see and track — then the mentor reasons over that roadmap, instead of giving one-off answers.",
  ],
  [
    "Do I need to pay to try it?",
    "No. The Explorer plan is free forever and includes a full roadmap and the AI mentor. Upgrade only when you need unlimited roadmaps or exports.",
  ],
  [
    "Where does the guidance come from?",
    "A large language model generates each roadmap from your profile, constrained to a strict format and grounded with real, budget-aware resources.",
  ],
  [
    "Can the roadmap change later?",
    "Always. Tell the mentor your time or goals changed and it re-routes the path — your plan stays in sync with your life.",
  ],
];

export function FAQ() {
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading
          eyebrow="FAQ"
          title="Everything you’re wondering, before you start"
        />
        <div className="mt-12 space-y-3">
          {faqs.map(([q, a], i) => (
            <Reveal key={q} delay={(i % 4) * 60}>
              <details className="group rounded-2xl border border-white/8 bg-bg-card/60 p-5 [&_summary]:cursor-pointer">
                <summary className="flex list-none items-center justify-between gap-4 text-left text-[15px] font-medium text-ink marker:hidden">
                  {q}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 text-ink-soft transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <section className="relative py-24 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-gradient-to-br from-brand-600/30 via-bg-card to-bg-card p-10 text-center md:p-16">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent-violet/30 blur-[90px]" />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-accent-cyan/20 blur-[90px]" />
            <div className="relative">
              <span className="flex mx-auto h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-glow">
                <Compass className="h-6 w-6 text-white" />
              </span>
              <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Stop guessing. Start moving.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-pretty text-base text-ink-soft">
                Build your personalized career roadmap in minutes — free, no
                card required.
              </p>
              <div className="mt-8 flex justify-center">
                <ButtonLink href="/app" size="lg" className="group">
                  Build my roadmap
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
