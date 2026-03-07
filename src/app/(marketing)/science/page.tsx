import {
  Dna,
  FlaskConical,
  BarChart3,
  ShieldCheck,
  Brain,
  Zap,
  Activity,
  Scale,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Star,
} from "lucide-react";
import Link from "next/link";
import { PageBackground } from "@/components/shared/PageBackground";

export const metadata = {
  title: "The Science — FitPlan AI",
  description:
    "The clinical nutrition science and AI engineering powering FitPlan AI — from Mifflin-St Jeor TDEE to LLaMA 3.3-70B meal generation.",
};

const FORMULA_STEPS = [
  {
    step: "1",
    label: "BMR Calculation",
    formula: "Men: 10×W + 6.25×H − 5×A + 5",
    formula2: "Women: 10×W + 6.25×H − 5×A − 161",
    note: "W = weight (kg), H = height (cm), A = age (years)",
    color: "brand-teal",
  },
  {
    step: "2",
    label: "Activity Multiplier",
    formula: "TDEE = BMR × Activity Factor",
    note: "Sedentary 1.2 → Lightly Active 1.375 → Moderately Active 1.55 → Very Active 1.725 → Extra Active 1.9",
    color: "brand-purple-light",
  },
  {
    step: "3",
    label: "Goal Adjustment",
    formula: "Target = TDEE × Goal Factor",
    note: "Fat Loss 0.8 · Maintenance 1.0 · Muscle Gain 1.15 · Athletic Performance 1.1",
    color: "brand-amber",
  },
  {
    step: "4",
    label: "Safety Floor",
    formula: "Final = max(Target, MinSafe)",
    note: "Women minimum 1,200 kcal/day · Men minimum 1,500 kcal/day — never compromised",
    color: "brand-teal",
  },
];

const MACRO_SPLITS = [
  {
    goal: "Fat Loss",
    protein: 40,
    carbs: 30,
    fat: 30,
    reason: "High protein preserves lean mass during deficit; lower carbs reduce insulin spikes.",
    color: "text-red-400",
  },
  {
    goal: "Muscle Gain",
    protein: 35,
    carbs: 40,
    fat: 25,
    reason: "Carbohydrates fuel resistance training and protein synthesis; moderate fat supports hormones.",
    color: "text-brand-teal",
  },
  {
    goal: "Maintenance",
    protein: 30,
    carbs: 40,
    fat: 30,
    reason: "Balanced split supports daily energy, muscle retention, and long-term metabolic health.",
    color: "text-brand-purple-light",
  },
  {
    goal: "Athletic Performance",
    protein: 25,
    carbs: 50,
    fat: 25,
    reason: "Carbohydrate loading maximizes glycogen stores for endurance and explosive output.",
    color: "text-brand-amber",
  },
];

const AI_PIPELINE = [
  {
    step: "A",
    title: "Input Validation",
    description:
      "All profile inputs are validated server-side with strict bounds (weight 30–300kg, height 100–250cm) before any computation begins.",
    icon: ShieldCheck,
    color: "text-brand-teal bg-brand-teal/10",
  },
  {
    step: "B",
    title: "TDEE Computation",
    description:
      "Server calculates BMR using Mifflin-St Jeor, applies activity multiplier and goal factor, then enforces calorie safety floor.",
    icon: FlaskConical,
    color: "text-brand-purple-light bg-brand-purple/10",
  },
  {
    step: "C",
    title: "Macro Calculation",
    description:
      "Gram targets for protein, carbohydrates, and fat are derived from the validated calorie target using evidence-based split ratios.",
    icon: BarChart3,
    color: "text-brand-amber bg-brand-amber/10",
  },
  {
    step: "D",
    title: "Prompt Engineering",
    description:
      "A precision-engineered 2,000-character prompt embeds all user parameters, allergen hard-exclusions (flagged CRITICAL SAFETY), and 10 nutritional rules before calling LLaMA 3.3-70B.",
    icon: Brain,
    color: "text-brand-teal bg-brand-teal/10",
  },
  {
    step: "E",
    title: "Structured Generation",
    description:
      "The model outputs strict JSON at temperature 0.4 with a 12,000-token budget — enough for a full 7-day plan with every meal, ingredient, and grocery item.",
    icon: Sparkles,
    color: "text-brand-purple-light bg-brand-purple/10",
  },
  {
    step: "F",
    title: "Post-Generation Validation",
    description:
      "The parsed plan is validated for allergen exclusions, calorie accuracy, and structural completeness before being saved and returned to the user.",
    icon: CheckCircle2,
    color: "text-brand-amber bg-brand-amber/10",
  },
];

const SAFETY_RULES = [
  "Allergens listed TWICE as CRITICAL SAFETY rules in the prompt",
  "Safe calorie floors enforced server-side — client cannot override",
  "Validated input bounds prevent impossible physiological values",
  "Post-generation allergen scan before saving to database",
  "No unverified health claims — only established nutritional science",
  "Medical disclaimer shown on every plan generation form",
  "Temperature 0.4 ensures reproducible, non-hallucinated nutritional data",
  "Max tokens 12,000 ensures complete plans — no truncated recipes",
];

export default function SciencePage() {
  return (
    <div className="min-h-screen relative">
      <PageBackground image="science-bg.png" overlay="heavy" />
      <div className="relative z-10">
      {/* Hero */}
      <section className="relative pt-24 pb-16 px-6 text-center overflow-hidden">

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-purple/30 bg-brand-purple/5 mb-5">
            <FlaskConical className="w-3.5 h-3.5 text-brand-purple-light" />
            <span className="text-brand-purple-light text-xs font-medium">Nutrition Science + AI Engineering</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            The Science Behind{" "}
            <span className="bg-gradient-to-r from-brand-purple-light to-brand-teal bg-clip-text text-transparent">
              FitPlan AI
            </span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Every calorie target, macro split, and recipe is grounded in peer-reviewed nutritional science
            and generated by a medically-constrained AI pipeline — not random templates.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-20 space-y-20">

        {/* TDEE Formula Section */}
        <section>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <Dna className="w-5 h-5 text-brand-teal" />
              <h2 className="text-2xl font-extrabold text-white">Mifflin-St Jeor TDEE Formula</h2>
            </div>
            <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
              The most validated BMR equation in clinical nutrition — more accurate than Harris-Benedict,
              especially for overweight individuals. Used by registered dietitians worldwide.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {FORMULA_STEPS.map((s) => (
              <div key={s.step} className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-${s.color}/15 text-${s.color} border border-${s.color}/25`}>
                    {s.step}
                  </div>
                  <h3 className="text-white font-semibold">{s.label}</h3>
                </div>
                <div className="space-y-2">
                  <p className={`font-mono text-sm text-${s.color} bg-${s.color}/8 px-3 py-2 rounded-lg`}>
                    {s.formula}
                  </p>
                  {s.formula2 && (
                    <p className={`font-mono text-sm text-${s.color} bg-${s.color}/8 px-3 py-2 rounded-lg`}>
                      {s.formula2}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">{s.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Macro Splits */}
        <section>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-brand-purple-light" />
              <h2 className="text-2xl font-extrabold text-white">Evidence-Based Macro Splits</h2>
            </div>
            <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
              Macro ratios are not one-size-fits-all. Each fitness goal has a distinct optimal split
              derived from sports nutrition research and ISSN guidelines.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {MACRO_SPLITS.map((m) => (
              <div key={m.goal} className="glass-card rounded-2xl p-6">
                <h3 className={`font-bold text-base mb-4 ${m.color}`}>{m.goal}</h3>

                {/* Stacked bar */}
                <div className="flex h-3 rounded-full overflow-hidden mb-3">
                  <div className="bg-brand-teal" style={{ width: `${m.protein}%` }} title={`Protein ${m.protein}%`} />
                  <div className="bg-brand-purple-light" style={{ width: `${m.carbs}%` }} title={`Carbs ${m.carbs}%`} />
                  <div className="bg-brand-amber" style={{ width: `${m.fat}%` }} title={`Fat ${m.fat}%`} />
                </div>

                <div className="flex gap-4 text-xs mb-3">
                  <span className="flex items-center gap-1 text-brand-teal">
                    <Beef className="w-3 h-3" /> Protein {m.protein}%
                  </span>
                  <span className="flex items-center gap-1 text-brand-purple-light">
                    <Wheat className="w-3 h-3" /> Carbs {m.carbs}%
                  </span>
                  <span className="flex items-center gap-1 text-brand-amber">
                    <Droplets className="w-3 h-3" /> Fat {m.fat}%
                  </span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">{m.reason}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AI Pipeline */}
        <section>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-brand-amber" />
              <h2 className="text-2xl font-extrabold text-white">The AI Generation Pipeline</h2>
            </div>
            <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
              Six deterministic stages from profile input to validated meal plan —
              every step engineered for accuracy and safety.
            </p>
          </div>

          <div className="relative">
            {/* Vertical connector */}
            <div className="absolute left-[27px] top-12 bottom-12 w-px bg-gradient-to-b from-brand-teal/40 via-brand-purple/30 to-brand-amber/30 hidden sm:block" />

            <div className="space-y-4">
              {AI_PIPELINE.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="glass-card rounded-2xl p-5 flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Step {step.step}</span>
                        <h3 className="text-white font-semibold text-sm">{step.title}</h3>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Safety Commitments */}
        <section>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-brand-teal" />
              <h2 className="text-2xl font-extrabold text-white">Our Safety Commitments</h2>
            </div>
            <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
              Meal planning touches people&apos;s health. We take that seriously — here&apos;s every safeguard built into the platform.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="grid sm:grid-cols-2 gap-3">
              {SAFETY_RULES.map((rule) => (
                <div key={rule} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300 leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why LLaMA 3.3-70B */}
        <section>
          <div className="glass-card rounded-2xl p-8 border border-brand-purple/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-brand-purple/10 flex-shrink-0">
                <Brain className="w-6 h-6 text-brand-purple-light" />
              </div>
              <div>
                <h2 className="text-white font-extrabold text-xl mb-2">Why LLaMA 3.3-70B?</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  We evaluated multiple large language models for nutritional plan generation.
                  LLaMA 3.3-70B was selected for its superior instruction-following on structured JSON output,
                  superior factual accuracy on nutritional data, and ability to maintain hard safety constraints
                  across a 12,000-token generation window without hallucinating allergen-containing ingredients.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { icon: Zap, label: "70 Billion Parameters", sub: "Enterprise-grade model" },
                    { icon: Activity, label: "Temperature 0.4", sub: "Deterministic output" },
                    { icon: Scale, label: "12,000 Token Budget", sub: "Complete weekly plans" },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="p-3 rounded-xl bg-white/5 border border-white/8">
                        <Icon className="w-4 h-4 text-brand-purple-light mb-2" />
                        <p className="text-white text-sm font-semibold">{stat.label}</p>
                        <p className="text-gray-600 text-xs">{stat.sub}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-brand-border">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="w-5 h-5 text-brand-amber fill-brand-amber" />
            ))}
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Science you can trust</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Start with our free plan — no credit card needed. Generate your first
            AI-powered, clinically-grounded meal plan in under a minute.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-teal to-brand-teal/80 text-brand-navy font-bold text-sm hover:from-brand-teal/90 hover:to-brand-teal/70 shadow-[0_4px_24px_rgba(255,96,68,0.3)] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Generate Free Plan
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-gray-300 font-semibold text-sm hover:border-white/25 hover:text-white transition-all"
            >
              View All Features
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
