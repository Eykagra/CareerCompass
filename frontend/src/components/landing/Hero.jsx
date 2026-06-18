import { ArrowRight, Sparkles, Star } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RoadmapPreview } from "./RoadmapPreview";

export function Hero() {
  return (
    <section className="relative pt-32 md:pt-40">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="animate-fade-up">
            <Badge>
              <Sparkles className="h-3.5 w-3.5 text-brand-300" />
              AI mentor + branching roadmaps
            </Badge>
          </div>

          <h1 className="mt-6 animate-fade-up text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            <span className="text-gradient">Your career,</span>
            <br />
            mapped step by step.
          </h1>

          <p className="mt-6 max-w-xl animate-fade-up text-pretty text-lg leading-relaxed text-ink-soft">
            Tell CareerCompass your goal and where you are today. Get a
            personalized, branching roadmap — and an AI mentor that explains
            every step and adapts as your life changes.
          </p>

          <div className="mt-9 flex animate-fade-up flex-col items-center gap-3 sm:flex-row">
            <ButtonLink to="/app" size="lg" className="group">
              Build my roadmap
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </ButtonLink>
            <ButtonLink to="#how" variant="secondary" size="lg">
              See how it works
            </ButtonLink>
          </div>

          <div className="mt-8 flex animate-fade-up items-center gap-3 text-sm text-ink-soft">
            <div className="flex">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span>Loved by 12,000+ learners and career switchers</span>
          </div>
        </div>

        <div className="relative mt-16 md:mt-20">
          <div className="absolute inset-x-0 -top-10 mx-auto h-40 max-w-3xl rounded-full bg-brand-500/20 blur-[100px]" />
          <RoadmapPreview />
        </div>
      </div>
    </section>
  );
}
