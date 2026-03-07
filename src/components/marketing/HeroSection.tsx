import Link from "next/link";
import {
  Zap,
  ArrowRight,
  Brain,
  ShieldCheck,
  Target,
  CheckCircle2,
  Flame,
  Star,
} from "lucide-react";

const TRUST_BADGES = [
  { icon: Brain, label: "LLaMA 3.3-70B AI" },
  { icon: ShieldCheck, label: "Allergen-Safe" },
  { icon: Target, label: "TDEE-Calibrated" },
  { icon: Flame, label: "Calorie Floors" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-16 px-4">
      {/* Headline group — centered, full width */}
      <div className="relative z-10 max-w-5xl mx-auto w-full text-center space-y-6">
        {/* Top badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-teal/35 bg-brand-teal/8 animate-fade-in-up"
        >
          <Zap className="w-3.5 h-3.5 text-brand-teal" aria-hidden="true" />
          <span className="text-brand-teal text-sm font-semibold tracking-wide">
            AI-Powered Nutrition Engine
          </span>
        </div>

        {/* Giant headline */}
        <h1
          className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] animate-fade-in-up animation-delay-100"
        >
          <span className="text-white">Your Perfect</span>
          <br />
          <span className="gradient-text drop-shadow-[0_0_40px_rgba(255,96,68,0.5)]">
            Meal Plan.
          </span>
          <br />
          <span className="text-white">In Seconds.</span>
        </h1>

        {/* Sub */}
        <p
          className="text-gray-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto animate-fade-in-up animation-delay-200"
        >
          Stop guessing your macros. FitPlan AI builds scientifically-backed,
          fully personalized meal plans based on your exact body metrics, goals,
          allergens, and budget — in under 30 seconds.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 animate-fade-in-up animation-delay-300"
        >
          <Link
            href="/sign-up"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-brand-teal to-brand-amber text-white font-bold text-base hover:scale-105 hover:shadow-[0_0_40px_rgba(255,96,68,0.5)] transition-all duration-300 min-h-[54px] min-w-[200px]"
            aria-label="Get started free with FitPlan AI"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
          <Link
            href="/features"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-base hover:bg-white/8 hover:border-white/35 transition-all duration-300 min-h-[54px]"
          >
            See All Features
          </Link>
        </div>

        {/* Trust badges */}
        <div
          className="flex flex-wrap items-center justify-center gap-3 pt-2 animate-fade-in-up animation-delay-400"
        >
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 font-medium"
            >
              <Icon className="w-3 h-3 text-brand-teal flex-shrink-0" aria-hidden="true" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Floating preview card */}
      <div
        aria-hidden="true"
        className="relative z-10 mt-14 w-full max-w-2xl mx-auto animate-fade-in-up animation-delay-500"
      >
        <div
          className="glass-card-coral rounded-2xl p-6 shadow-[0_24px_80px_rgba(255,96,68,0.15),0_0_0_1px_rgba(255,96,68,0.15)] animate-float"
        >
          {/* Card header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-teal/15 flex items-center justify-center">
                <Zap className="w-4 h-4 text-brand-teal" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Daily Plan — Muscle Gain</p>
                <p className="text-gray-500 text-xs">Generated in 12s</p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-mint/10 border border-brand-mint/25 text-brand-mint text-xs font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              Allergen-Free
            </div>
          </div>

          {/* Macro row */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "Calories", value: "2,800", color: "text-brand-teal" },
              { label: "Protein", value: "175g", color: "text-brand-teal" },
              { label: "Carbs", value: "320g", color: "text-brand-amber" },
              { label: "Fat", value: "72g", color: "text-brand-amber" },
            ].map((m) => (
              <div key={m.label} className="text-center p-2.5 rounded-xl bg-white/5">
                <p className={`text-base font-bold ${m.color}`}>{m.value}</p>
                <p className="text-gray-600 text-xs mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Stacked macro bar */}
          <div className="flex h-2 rounded-full overflow-hidden mb-4">
            <div className="bg-brand-teal" style={{ width: "35%" }} />
            <div className="bg-brand-amber/80" style={{ width: "40%" }} />
            <div className="bg-brand-amber" style={{ width: "25%" }} />
          </div>

          {/* Meal list */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { name: "Breakfast", kcal: "580 kcal" },
              { name: "Lunch", kcal: "720 kcal" },
              { name: "Snack", kcal: "310 kcal" },
              { name: "Dinner", kcal: "840 kcal" },
            ].map((meal) => (
              <div
                key={meal.name}
                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/8 flex flex-col gap-0.5"
              >
                <span className="text-gray-300 text-xs font-semibold">{meal.name}</span>
                <span className="text-gray-600 text-xs">{meal.kcal}</span>
                <div className="w-3 h-0.5 rounded-full bg-brand-teal mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="relative z-10 mt-12 flex flex-wrap items-center justify-center gap-10 text-center animate-fade-in-up animation-delay-600 pt-8 border-t border-white/8 w-full max-w-2xl mx-auto"
      >
        {[
          { value: "50K+", label: "Active Users" },
          { value: "1M+", label: "Plans Generated" },
          { value: "4.9 ★", label: "Average Rating" },
          { value: "150+", label: "Countries" },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-white font-extrabold text-2xl">{stat.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
