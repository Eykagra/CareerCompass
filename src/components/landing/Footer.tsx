import Link from "next/link";
import { Compass } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-bg-soft/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600">
              <Compass className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
            </span>
            <span className="text-[15px] font-semibold">CareerCompass</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
            Personalized, branching career roadmaps with an AI mentor. From
            where you are to where you want to be.
          </p>
        </div>

        <FooterCol
          title="Product"
          items={[
            ["Features", "#features"],
            ["How it works", "#how"],
            ["Pricing", "#pricing"],
            ["Launch app", "/app"],
          ]}
        />
        <FooterCol
          title="Company"
          items={[
            ["About", "#"],
            ["Blog", "#"],
            ["Careers", "#"],
          ]}
        />
        <FooterCol
          title="Legal"
          items={[
            ["Privacy", "#"],
            ["Terms", "#"],
          ]}
        />
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-ink-dim md:flex-row">
          <span>
            © {new Date().getFullYear()} CareerCompass. All rights reserved.
          </span>
          <span>Built with Next.js · Ready for AWS</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: Array<[string, string]>;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-ink">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {items.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
