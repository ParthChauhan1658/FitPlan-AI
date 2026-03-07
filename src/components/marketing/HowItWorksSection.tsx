"use client";

import { Target, Sparkles, TrendingUp } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

const STEPS = [
  {
    number: "01",
    icon: Target,
    title: "Set Your Goals",
    description:
      "Tell us your fitness goal, body metrics, dietary preferences, cuisine style, and daily budget. Takes less than 2 minutes.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI Generates Your Plan",
    description:
      "Our GPT-4o engine calculates your TDEE, macro split, and builds a complete meal plan with recipes and a grocery list.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Track & Adapt",
    description:
      "Save favorites, download PDFs, share with your trainer, and regenerate as your body and goals evolve.",
  },
];

const STEP_DELAYS = ["", "animation-delay-200", "animation-delay-400"];

export function HowItWorksSection() {
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="bg-brand-navy py-24"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-brand-teal text-sm font-semibold uppercase tracking-widest mb-3">
            Simple Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            From Goals to{" "}
            <span className="gradient-text">Meal Plan in Minutes</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            No nutritionist needed. Just answer a few questions and let the AI
            do the heavy lifting.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {/* Desktop connecting line */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-brand-teal via-brand-purple to-brand-teal opacity-30"
          />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`flex flex-col items-center text-center ${
                  isVisible
                    ? `animate-fade-in-up ${STEP_DELAYS[i]}`
                    : "opacity-0 translate-y-4"
                }`}
              >
                {/* Number badge */}
                <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-brand-teal to-brand-purple flex items-center justify-center text-white font-extrabold text-lg mb-6 shadow-[0_0_20px_rgba(255,96,68,0.3)]">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 animate-float">
                  <Icon className="w-6 h-6 text-brand-teal" aria-hidden="true" />
                </div>

                <h3 className="text-white font-semibold text-xl mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-base leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
