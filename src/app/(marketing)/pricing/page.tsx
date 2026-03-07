import { PricingSection } from "@/components/marketing/PricingSection";
import { PageBackground } from "@/components/shared/PageBackground";

export const metadata = {
  title: "Pricing — FitPlan AI",
  description:
    "Simple, transparent pricing. Start free, upgrade when ready. Plans for every fitness journey.",
};

export default function PricingPage() {
  return (
    <main className="relative min-h-screen">
      <PageBackground image="pricing-bg.png" overlay="heavy" />
      {/* Page hero */}
      <div className="relative z-10 pt-16 pb-4 text-center px-4">
        <p className="text-brand-teal text-sm font-semibold uppercase tracking-widest mb-3">
          Pricing
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
          Simple,{" "}
          <span className="gradient-text">Transparent Pricing</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          No hidden fees. No surprise charges. Cancel anytime.
        </p>
      </div>

      <div className="relative z-10">
        <PricingSection />
      </div>
    </main>
  );
}
