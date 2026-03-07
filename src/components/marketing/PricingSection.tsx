"use client";

import Link from "next/link";
import { Check, X, Zap } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
  badge?: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with AI meal planning.",
    features: [
      { text: "3 meal plan generations/month", included: true },
      { text: "Daily meal plans only", included: true },
      { text: "Basic macro breakdown", included: true },
      { text: "Grocery list generator", included: true },
      { text: "Weekly meal plans", included: false },
      { text: "PDF download & sharing", included: false },
      { text: "Favorites & history", included: false },
      { text: "Priority AI generation", included: false },
    ],
    cta: "Get Started Free",
    ctaHref: "/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    description: "For fitness enthusiasts who plan consistently.",
    features: [
      { text: "50 meal plan generations/month", included: true },
      { text: "Daily & weekly meal plans", included: true },
      { text: "Full macro & calorie breakdown", included: true },
      { text: "Grocery list generator", included: true },
      { text: "Weekly meal plans", included: true },
      { text: "PDF download & sharing", included: true },
      { text: "Favorites & history", included: true },
      { text: "Priority AI generation", included: false },
    ],
    cta: "Start Pro",
    ctaHref: "/sign-up?plan=pro",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Elite",
    price: "$29",
    period: "per month",
    description: "Unlimited access for serious athletes and coaches.",
    features: [
      { text: "Unlimited generations", included: true },
      { text: "Daily & weekly meal plans", included: true },
      { text: "Full macro & calorie breakdown", included: true },
      { text: "Grocery list generator", included: true },
      { text: "Weekly meal plans", included: true },
      { text: "PDF download & sharing", included: true },
      { text: "Favorites & history", included: true },
      { text: "Priority AI generation", included: true },
    ],
    cta: "Go Elite",
    ctaHref: "/sign-up?plan=elite",
    highlighted: false,
  },
];

const DELAY_CLASSES = [
  "animation-delay-100",
  "animation-delay-200",
  "animation-delay-300",
];

function PricingCardContent({
  tier,
  ctaClass,
}: {
  tier: PricingTier;
  ctaClass: string;
}) {
  return (
    <>
      <h3 className="text-white font-bold text-xl mb-1">{tier.name}</h3>
      <p className="text-gray-400 text-sm mb-6">{tier.description}</p>

      <div className="flex items-end gap-1 mb-8">
        <span className="text-4xl font-extrabold text-white">{tier.price}</span>
        <span className="text-gray-400 text-sm mb-1">/{tier.period}</span>
      </div>

      <ul className="space-y-3 mb-8">
        {tier.features.map((feature) => (
          <li key={feature.text} className="flex items-center gap-3 text-sm">
            {feature.included ? (
              <Check
                className="w-4 h-4 text-brand-teal flex-shrink-0"
                aria-hidden="true"
              />
            ) : (
              <X
                className="w-4 h-4 text-gray-600 flex-shrink-0"
                aria-hidden="true"
              />
            )}
            <span className={feature.included ? "text-gray-300" : "text-gray-600"}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={tier.ctaHref}
        className={`flex items-center justify-center w-full py-3 px-6 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 min-h-[44px] ${ctaClass}`}
        aria-label={`Get started with ${tier.name} plan`}
      >
        {tier.cta}
      </Link>
    </>
  );
}

export function PricingSection() {
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="bg-brand-dark py-24"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-brand-teal text-sm font-semibold uppercase tracking-widest mb-3">
            Simple Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Plans for Every{" "}
            <span className="gradient-text">Fitness Journey</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Start free, upgrade when you&apos;re ready. No hidden fees, cancel
            anytime.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {PRICING_TIERS.map((tier, i) => {
            const animClass = isVisible
              ? `animate-fade-in-up ${DELAY_CLASSES[i]}`
              : "opacity-0 translate-y-4";

            if (tier.highlighted) {
              return (
                <div key={tier.name} className={`relative md:scale-105 ${animClass}`}>
                  <div className="bg-gradient-to-b from-brand-purple/40 to-brand-teal/20 rounded-2xl p-[2px]">
                    <div className="bg-brand-dark rounded-2xl p-8 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(255,179,71,0.3)] transition-all duration-300">
                      {/* Badge */}
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-brand-teal to-brand-purple-light text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                          <Zap className="w-3 h-3" aria-hidden="true" />
                          {tier.badge}
                        </span>
                      </div>
                      <PricingCardContent
                        tier={tier}
                        ctaClass="bg-gradient-to-r from-brand-amber to-brand-amber-light text-brand-navy hover:shadow-[0_0_20px_rgba(255,179,71,0.4)]"
                      />
                    </div>
                  </div>
                </div>
              );
            }

            const isElite = tier.name === "Elite";
            return (
              <div
                key={tier.name}
                className={`glass-card rounded-2xl p-8 hover:-translate-y-2 transition-all duration-300 ${
                  isElite
                    ? "hover:shadow-[0_20px_40px_rgba(255,179,71,0.15)] hover:border-brand-purple/50"
                    : "hover:shadow-[0_20px_40px_rgba(255,96,68,0.10)] hover:border-brand-teal/30"
                } ${animClass}`}
              >
                <PricingCardContent
                  tier={tier}
                  ctaClass={
                    isElite
                      ? "border border-brand-purple-light/50 text-brand-purple-light hover:bg-brand-purple/10 hover:border-brand-purple-light"
                      : "border border-brand-teal/50 text-brand-teal hover:bg-brand-teal/10 hover:border-brand-teal"
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
