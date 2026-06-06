import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import {
  CTA,
  FAQ,
  Features,
  HowItWorks,
  Pricing,
} from "@/components/landing/Sections";

export default function HomePage() {
  return (
    <div className="relative">
      <AuroraBackground />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
