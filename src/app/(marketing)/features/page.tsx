import {
  Brain,
  BarChart3,
  Target,
  ShieldCheck,
  ShoppingCart,
  Zap,
  Clock,
  Globe,
  Lock,
  RefreshCw,
  Sparkles,
  Dna,
  ChefHat,
  Scale,
  Activity,
  Leaf,
  Download,
  Share2,
  Star,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { PageBackground } from "@/components/shared/PageBackground";

export const metadata = {
  title: "Features — FitPlan AI",
  description:
    "Discover every feature powering FitPlan AI — from science-based TDEE calculation to allergen-safe, budget-matched meal plans generated in seconds.",
};

const HERO_FEATURES = [
  { icon: Brain, label: "LLaMA 3.3-70B AI Engine", color: "text-brand-teal", bg: "bg-brand-teal/10" },
  { icon: Dna, label: "Mifflin-St Jeor TDEE Formula", color: "text-brand-purple-light", bg: "bg-brand-purple/10" },
  { icon: ShieldCheck, label: "Strict Allergen Exclusion", color: "text-brand-amber", bg: "bg-brand-amber/10" },
  { icon: Scale, label: "Calorie Safety Floors", color: "text-brand-teal", bg: "bg-brand-teal/10" },
];

const FEATURE_GROUPS = [
  {
    section: "AI Intelligence",
    accent: "teal",
    features: [
      {
        icon: Brain,
        title: "LLaMA 3.3-70B Model",
        description:
          "FitPlan AI uses the state-of-the-art LLaMA 3.3-70B large language model — the same tier used in enterprise nutrition tools — running at precision temperature 0.4 for deterministic, medically consistent output.",
        bullets: [
          "12,000 token context for complete weekly plans",
          "Temperature 0.4 for reproducible nutritional data",
          "Structured JSON output validated post-generation",
          "Automatic retry on malformed responses",
        ],
      },
      {
        icon: Sparkles,
        title: "One-Click Plan Generation",
        description:
          "Fill out your profile once. Our AI generates a complete daily or weekly plan with named meals, ingredient quantities, cooking instructions, and a full grocery list — in under 30 seconds.",
        bullets: [
          "Daily or 7-day weekly plans",
          "3–6 configurable meals per day",
          "Named, categorized meals (breakfast, snack, dinner…)",
          "Step-by-step cooking instructions per meal",
        ],
      },
      {
        icon: RefreshCw,
        title: "Regeneration & Variation",
        description:
          "Not happy with a plan? Generate again instantly. Every run produces a different set of recipes while still hitting your exact calorie and macro targets.",
        bullets: [
          "Infinite regeneration within your monthly limit",
          "Different recipes every time",
          "Same nutritional targets, fresh variety",
        ],
      },
    ],
  },
  {
    section: "Nutrition Science",
    accent: "purple",
    features: [
      {
        icon: Dna,
        title: "Science-Based TDEE Calculation",
        description:
          "We use the gold-standard Mifflin-St Jeor BMR equation combined with your activity multiplier to calculate your exact Total Daily Energy Expenditure — the same formula used by registered dietitians.",
        bullets: [
          "Mifflin-St Jeor BMR (most accurate formula)",
          "5 activity multipliers: sedentary → extra active",
          "Goal-based adjustments: –20% fat loss, +15% muscle gain",
          "Live calorie preview as you fill in your profile",
        ],
      },
      {
        icon: BarChart3,
        title: "Personalized Macro Splits",
        description:
          "Every plan includes an evidence-based protein/carb/fat ratio tuned to your fitness goal — not a generic 40/30/30 default.",
        bullets: [
          "Fat Loss: 40% protein · 30% carbs · 30% fat",
          "Muscle Gain: 35% protein · 40% carbs · 25% fat",
          "Athletic Performance: 25% protein · 50% carbs · 25% fat",
          "Per-gram calorie accounting (4/4/9 kcal/g)",
        ],
      },
      {
        icon: Scale,
        title: "Calorie Safety Floors",
        description:
          "FitPlan AI enforces medically safe minimum calorie floors at both the client preview and server generation stages — protecting users from dangerously low-calorie plans.",
        bullets: [
          "Women: 1,200 kcal minimum floor",
          "Men: 1,500 kcal minimum floor",
          "Server-side enforcement — cannot be bypassed",
          "Clear warning shown if goal calories were adjusted",
        ],
      },
    ],
  },
  {
    section: "Safety & Personalization",
    accent: "amber",
    features: [
      {
        icon: ShieldCheck,
        title: "Strict Allergen Exclusion",
        description:
          "Every allergen you list is embedded as a CRITICAL SAFETY rule in the AI prompt, repeated twice, and validated post-generation. Zero tolerance for allergen violations.",
        bullets: [
          "Unlimited allergen tags (peanuts, gluten, dairy…)",
          "Hard exclusion — never suggested as optional",
          "Post-generation allergen validation step",
          "Stored in profile — auto-applied to every new plan",
        ],
      },
      {
        icon: Leaf,
        title: "Dietary Preferences",
        description:
          "From strict vegan to non-vegetarian, every dietary preference is enforced at the ingredient level — not just as a suggestion.",
        bullets: [
          "Vegetarian, Vegan, Eggetarian, Non-Veg",
          "Indian, Continental, or Mixed cuisine",
          "Minimal, Moderate, Full Kitchen cooking modes",
          "Budget-appropriate ingredient selection",
        ],
      },
      {
        icon: Target,
        title: "Goal-Optimized Recipes",
        description:
          "FitPlan AI doesn't just hit calorie targets — it selects recipes and ingredients strategically aligned to your fitness goal, maximizing protein absorption for muscle gain or fibre for fat loss.",
        bullets: [
          "High-protein sources for muscle gain plans",
          "Fibre-rich, satiating foods for fat loss",
          "Complex carb timing for athletic performance",
          "Micronutrient diversity — iron, B12, Omega-3",
        ],
      },
    ],
  },
  {
    section: "Budget & Grocery",
    accent: "teal",
    features: [
      {
        icon: ShoppingCart,
        title: "Auto-Generated Grocery Lists",
        description:
          "Every plan includes a consolidated, categorized grocery list with estimated quantities and costs — ready to screenshot and shop.",
        bullets: [
          "Quantities in grams/units per ingredient",
          "Grouped by food category",
          "Estimated cost per item",
          "Weekly total cost calculation",
        ],
      },
      {
        icon: Globe,
        title: "INR & USD Budget Support",
        description:
          "Whether you're budgeting in Indian Rupees or US Dollars, FitPlan AI calibrates ingredient selection and portion sizes to match your daily food budget.",
        bullets: [
          "INR and USD currency support",
          "Budget tolerance within ±10%",
          "Cheaper ingredient substitutions suggested",
          "Per-meal cost breakdown",
        ],
      },
      {
        icon: ChefHat,
        title: "Cooking Complexity Modes",
        description:
          "Tell the AI how equipped your kitchen is. Minimal mode focuses on no-cook or microwave meals; Full Kitchen unlocks complex multi-step recipes.",
        bullets: [
          "Minimal: no-cook, minimal prep",
          "Moderate: standard stovetop cooking",
          "Full Kitchen: oven, multi-step recipes",
          "Prep time estimated per meal",
        ],
      },
    ],
  },
  {
    section: "Plans & Sharing",
    accent: "purple",
    features: [
      {
        icon: Download,
        title: "PDF Export",
        description:
          "Download any meal plan as a beautifully formatted PDF — ready to print, share with a personal trainer, or save offline.",
        bullets: [
          "Complete plan with all meals and recipes",
          "Grocery list included",
          "Macro breakdown summary",
          "Print-ready layout",
        ],
      },
      {
        icon: Share2,
        title: "Public Share Links",
        description:
          "Generate a secure share link for any plan and send it to friends, family, or your nutritionist — no login required to view.",
        bullets: [
          "One-click share link generation",
          "No login required for viewers",
          "Revocable at any time",
          "Full plan visible including grocery list",
        ],
      },
      {
        icon: Star,
        title: "Favorites & Plan History",
        description:
          "Star your best plans to save them permanently. Browse your full generation history, filter by goal, and pick up where you left off.",
        bullets: [
          "Unlimited favorites",
          "Full plan history with pagination",
          "Filter by favorites only",
          "One-tap re-visit any plan",
        ],
      },
    ],
  },
];

function FeatureCard({
  icon: Icon,
  title,
  description,
  bullets,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  bullets: string[];
  accent: string;
}) {
  const accentMap: Record<string, { icon: string; border: string; bullet: string }> = {
    teal: {
      icon: "text-brand-teal bg-brand-teal/10",
      border: "hover:border-brand-teal/30 hover:shadow-[0_8px_30px_rgba(255,96,68,0.08)]",
      bullet: "bg-brand-teal",
    },
    purple: {
      icon: "text-brand-purple-light bg-brand-purple/10",
      border: "hover:border-brand-purple/30 hover:shadow-[0_8px_30px_rgba(255,179,71,0.08)]",
      bullet: "bg-brand-purple-light",
    },
    amber: {
      icon: "text-brand-amber bg-brand-amber/10",
      border: "hover:border-brand-amber/30 hover:shadow-[0_8px_30px_rgba(255,179,71,0.08)]",
      bullet: "bg-brand-amber",
    },
  };
  const a = accentMap[accent] ?? accentMap.teal;

  return (
    <div className={`glass-card rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 border border-transparent ${a.border}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${a.icon}`}>
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-white font-bold text-lg">{title}</h3>
        <p className="text-gray-400 text-sm mt-2 leading-relaxed">{description}</p>
      </div>
      <ul className="space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-sm text-gray-400">
            <span className={`w-1.5 h-1.5 rounded-full ${a.bullet} flex-shrink-0 mt-1.5`} />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen relative">
      <PageBackground image="features-bg.png" overlay="heavy" />
      <div className="relative z-10">
      {/* Hero */}
      <section className="relative pt-24 pb-16 px-6 text-center overflow-hidden">

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-teal/30 bg-brand-teal/5 mb-5">
            <Zap className="w-3.5 h-3.5 text-brand-teal" />
            <span className="text-brand-teal text-xs font-medium">Full Feature List</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Everything You Need,{" "}
            <span className="bg-gradient-to-r from-brand-teal to-brand-purple-light bg-clip-text text-transparent">
              Powered by AI
            </span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            FitPlan AI combines clinical-grade nutrition science with cutting-edge language models
            to deliver the most accurate, personalized, and safe meal plans available.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {HERO_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                  <Icon className={`w-4 h-4 ${f.color}`} />
                  <span className="text-sm text-gray-300 font-medium">{f.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature sections */}
      <div className="max-w-6xl mx-auto px-6 pb-20 space-y-16">
        {FEATURE_GROUPS.map((group) => (
          <section key={group.section}>
            <div className="flex items-center gap-3 mb-8">
              <div className={`h-px flex-1 bg-gradient-to-r from-transparent ${
                group.accent === "teal" ? "to-brand-teal/30"
                : group.accent === "purple" ? "to-brand-purple/30"
                : "to-brand-amber/30"
              }`} />
              <span className={`text-xs font-semibold uppercase tracking-widest ${
                group.accent === "teal" ? "text-brand-teal"
                : group.accent === "purple" ? "text-brand-purple-light"
                : "text-brand-amber"
              }`}>
                {group.section}
              </span>
              <div className={`h-px flex-1 bg-gradient-to-l from-transparent ${
                group.accent === "teal" ? "to-brand-teal/30"
                : group.accent === "purple" ? "to-brand-purple/30"
                : "to-brand-amber/30"
              }`} />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {group.features.map((f) => (
                <FeatureCard key={f.title} {...f} accent={group.accent} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-brand-border">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="w-5 h-5 text-brand-amber fill-brand-amber" />
            ))}
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to start?</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of users eating smarter with AI-powered meal plans tailored to their exact goals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-teal to-brand-teal/80 text-brand-navy font-bold text-sm hover:from-brand-teal/90 hover:to-brand-teal/70 shadow-[0_4px_24px_rgba(255,96,68,0.3)] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-gray-300 font-semibold text-sm hover:border-white/25 hover:text-white transition-all"
            >
              View Pricing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-600">
            {["Free plan available", "No credit card required", "Cancel anytime"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
