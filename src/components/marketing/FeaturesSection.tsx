"use client";

import { Brain, BarChart3, Target, Leaf, ShoppingCart, TrendingUp } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

const FEATURES = [
  {
    icon: Brain,
    title: "AI Meal Planning",
    description:
      "GPT-4o generates complete daily and weekly meal plans tailored to your exact macros, preferences, and budget.",
    iconColor: "teal",
  },
  {
    icon: BarChart3,
    title: "Macro Tracking",
    description:
      "Automatic protein, carb, and fat calculations based on your fitness goal using science-backed TDEE formulas.",
    iconColor: "purple",
  },
  {
    icon: Target,
    title: "Goal Alignment",
    description:
      "Fat loss, muscle gain, maintenance, or athletic performance — your plan is precisely calibrated to your target.",
    iconColor: "teal",
  },
  {
    icon: Leaf,
    title: "Dietary Preferences",
    description:
      "Supports vegetarian, vegan, non-veg, and eggetarian diets with allergy exclusions and cuisine preferences.",
    iconColor: "purple",
  },
  {
    icon: ShoppingCart,
    title: "Grocery Lists",
    description:
      "Auto-generated daily and weekly grocery lists with quantities and estimated costs matched to your budget.",
    iconColor: "teal",
  },
  {
    icon: TrendingUp,
    title: "Progress Adaptation",
    description:
      "Update your metrics and goals anytime — the AI adapts your next plan to reflect your current progress.",
    iconColor: "purple",
  },
];

const DELAY_CLASSES = [
  "animation-delay-100",
  "animation-delay-200",
  "animation-delay-300",
  "animation-delay-400",
  "animation-delay-500",
  "animation-delay-600",
];

export function FeaturesSection() {
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      id="features"
      ref={sectionRef}
      className="bg-brand-dark py-24"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-brand-teal text-sm font-semibold uppercase tracking-widest mb-3">
            Everything You Need
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Nutrition Intelligence,{" "}
            <span className="gradient-text">Fully Automated</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From calorie calculation to grocery lists — FitPlan AI handles the
            entire nutrition planning workflow so you can focus on your training.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            const isTeal = feature.iconColor === "teal";
            return (
              <div
                key={feature.title}
                className={`glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:border-brand-teal/50 hover:shadow-[0_20px_40px_rgba(255,96,68,0.15),_0_0_20px_rgba(255,96,68,0.10)] ${
                  isVisible
                    ? `animate-fade-in-up ${DELAY_CLASSES[i]}`
                    : "opacity-0 translate-y-4"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    isTeal
                      ? "bg-brand-teal/10 text-brand-teal"
                      : "bg-brand-purple/10 text-brand-purple-light"
                  }`}
                >
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-white font-semibold text-lg mt-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
