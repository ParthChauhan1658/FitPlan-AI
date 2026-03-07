import { Sparkles, ShieldCheck, Brain } from "lucide-react";
import { GenerationForm } from "@/components/forms/generation-form";
import { PageBackground } from "@/components/shared/PageBackground";

export default function NewMealPlanPage() {
  return (
    <>
      {/* AI brain neural network background — perfect for generation page */}
      <PageBackground image="generate-bg.png" overlay="heavy" />

      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-teal/30 bg-brand-teal/8 mb-4">
            <Brain className="w-3.5 h-3.5 text-brand-teal" aria-hidden="true" />
            <span className="text-brand-teal text-xs font-semibold tracking-wide">LLaMA 3.3-70B — AI-Powered</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Generate Your Meal Plan
          </h1>
          <p className="text-gray-400 mt-2 leading-relaxed">
            Fill in your details below. Our AI calculates your TDEE, macro split, and generates
            a complete meal plan with recipes and grocery list — tailored to your exact goals.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-3">
          {[
            "Science-based TDEE formula",
            "Strict allergen exclusion",
            "Safe calorie floors",
            "Budget-matched meals",
          ].map((badge) => (
            <div key={badge} className="inline-flex items-center gap-1.5 text-xs text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-teal flex-shrink-0" aria-hidden="true" />
              {badge}
            </div>
          ))}
        </div>

        <GenerationForm />
      </div>
    </>
  );
}
