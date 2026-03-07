import Link from "next/link";
import {
  Star,
  Flame,
  Calendar,
  DollarSign,
  ArrowRight,
  Trash2,
  Zap,
  Target,
} from "lucide-react";
import {
  FITNESS_GOAL_LABELS,
  DIETARY_PREFERENCE_LABELS,
  PLAN_TYPE_LABELS,
} from "@/constants";

interface MealPlanCardProps {
  plan: {
    id: string;
    planType: string;
    targetCalories: number;
    fitnessGoal: string;
    dietaryPreference: string;
    isFavorite: boolean;
    createdAt: string;
    totalDailyCost: number;
    budgetCurrency: string;
  };
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
  onDelete?: (id: string) => void;
}

const GOAL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  FAT_LOSS: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  MUSCLE_GAIN: { bg: "bg-brand-teal/10", text: "text-brand-teal", border: "border-brand-teal/20" },
  MAINTENANCE: { bg: "bg-brand-purple/10", text: "text-brand-purple-light", border: "border-brand-purple/20" },
  ATHLETIC_PERFORMANCE: { bg: "bg-brand-amber/10", text: "text-brand-amber", border: "border-brand-amber/20" },
};

export function MealPlanCard({
  plan,
  onFavoriteToggle,
  onDelete,
}: MealPlanCardProps) {
  const goalColor = GOAL_COLORS[plan.fitnessGoal] ?? {
    bg: "bg-gray-500/10",
    text: "text-gray-400",
    border: "border-gray-500/20",
  };
  const isWeekly = plan.planType === "WEEKLY";

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 hover:-translate-y-1 hover:border-brand-teal/20 hover:shadow-[0_8px_30px_rgba(255,96,68,0.08)] transition-all duration-300">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isWeekly
              ? "bg-brand-purple/10 text-brand-purple-light border-brand-purple/25"
              : "bg-brand-teal/10 text-brand-teal border-brand-teal/25"
          }`}>
            <Zap className="w-3 h-3" />
            {PLAN_TYPE_LABELS[plan.planType] ?? plan.planType}
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${goalColor.bg} ${goalColor.text} ${goalColor.border}`}>
            <Target className="w-3 h-3" />
            {FITNESS_GOAL_LABELS[plan.fitnessGoal as keyof typeof FITNESS_GOAL_LABELS] ?? plan.fitnessGoal}
          </span>
        </div>

        {onFavoriteToggle && (
          <button
            onClick={() => onFavoriteToggle(plan.id, !plan.isFavorite)}
            aria-label={plan.isFavorite ? "Remove from favorites" : "Add to favorites"}
            className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
              plan.isFavorite
                ? "text-brand-amber"
                : "text-gray-600 hover:text-brand-amber"
            }`}
          >
            <Star className={`w-4 h-4 ${plan.isFavorite ? "fill-brand-amber" : ""}`} />
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-white/5">
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-brand-amber" />
            <span className="text-xs text-gray-500 font-medium">Calories</span>
          </div>
          <span className="text-white font-bold text-sm leading-none mt-0.5">{plan.targetCalories.toLocaleString()}</span>
          <span className="text-gray-600 text-xs">kcal/day</span>
        </div>
        <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-white/5">
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-brand-teal" />
            <span className="text-xs text-gray-500 font-medium">Budget</span>
          </div>
          <span className="text-white font-bold text-sm leading-none mt-0.5">{plan.totalDailyCost.toFixed(0)}</span>
          <span className="text-gray-600 text-xs">{plan.budgetCurrency}/day</span>
        </div>
        <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-white/5">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-brand-purple-light" />
            <span className="text-xs text-gray-500 font-medium">Created</span>
          </div>
          <span className="text-white font-bold text-sm leading-none mt-0.5">
            {new Date(plan.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <span className="text-gray-600 text-xs">{new Date(plan.createdAt).getFullYear()}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        {DIETARY_PREFERENCE_LABELS[plan.dietaryPreference] ?? plan.dietaryPreference} diet
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
        <Link href={`/meal-plans/${plan.id}`} className="flex-1">
          <div className="w-full flex items-center justify-center gap-1.5 h-9 rounded-xl bg-brand-teal/10 border border-brand-teal/25 text-brand-teal text-sm font-semibold hover:bg-brand-teal/20 transition-colors cursor-pointer">
            View Plan
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(plan.id)}
            aria-label="Delete plan"
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-500/8 border border-red-500/20 text-red-500/70 hover:bg-red-500/15 hover:text-red-400 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
