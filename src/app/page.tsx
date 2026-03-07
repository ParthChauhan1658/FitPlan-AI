import { PageBackground } from "@/components/shared/PageBackground";
import { HeroSection } from "@/components/marketing/HeroSection";
import { StatsSection } from "@/components/marketing/StatsSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Footer } from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Cinematic hero background — glowing orange energy waves */}
      <PageBackground image="hero-bg.png" overlay="light" />

      <MarketingHeader />
      <main className="relative z-10 overflow-hidden">
        <HeroSection />

        {/* Below-the-fold sections on a dark base (background fades out) */}
        <div className="relative bg-gradient-to-b from-transparent via-brand-navy/95 to-brand-navy">
          <StatsSection />
          <FeaturesSection />
          <HowItWorksSection />
          <PricingSection />
          <TestimonialsSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
