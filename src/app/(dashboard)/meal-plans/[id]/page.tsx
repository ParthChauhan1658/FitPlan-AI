"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { PageBackground } from "@/components/shared/PageBackground";
import { toast } from "sonner";
import { MealCard } from "@/components/cards/meal-card";
import { GroceryList } from "@/components/cards/grocery-list";
import { MacroBreakdown } from "@/components/cards/macro-breakdown";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatContext } from "@/context/ChatContext";
import {
  Star,
  Share2,
  Download,
  Trash2,
  ArrowLeft,
  Calendar,
  Flame,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

// react-pdf/renderer must be loaded client-side only
const MealPlanPDFButton = dynamic(
  () => import("@/components/pdf/MealPlanPDFButton").then((m) => m.MealPlanPDFButton),
  {
    ssr: false,
    loading: () => (
      <button
        disabled
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-brand-teal/25 bg-brand-teal/8 text-brand-teal opacity-60 cursor-wait"
      >
        <Download className="w-3.5 h-3.5" />
        PDF
      </button>
    ),
  }
);
import {
  FITNESS_GOAL_LABELS,
  DIETARY_PREFERENCE_LABELS,
  PLAN_TYPE_LABELS,
} from "@/constants";
import type { DailyPlan, GroceryItem, Meal } from "@/types";

interface MealPlanData {
  id: string;
  planType: string;
  targetCalories: number;
  fitnessGoal: string;
  dietaryPreference: string;
  cuisinePreference: string;
  cookingAbility: string;
  mealsPerDay: number;
  dailyBudget: number;
  budgetCurrency: string;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  proteinPercent: number;
  carbPercent: number;
  fatPercent: number;
  meals: DailyPlan[];
  groceryList: GroceryItem[];
  totalDailyCost: number;
  totalWeeklyCost: number | null;
  isFavorite: boolean;
  createdAt: string;
  sharedLink?: { token: string; isActive: boolean } | null;
}

const GOAL_COLORS: Record<string, string> = {
  FAT_LOSS: "bg-red-500/10 text-red-400 border-red-500/20",
  MUSCLE_GAIN: "bg-brand-teal/10 text-brand-teal border-brand-teal/20",
  MAINTENANCE: "bg-brand-purple/10 text-brand-purple-light border-brand-purple/20",
  ATHLETIC_PERFORMANCE: "bg-brand-amber/10 text-brand-amber border-brand-amber/20",
};

export default function MealPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { setPlanContext } = useChatContext();
  const [plan, setPlan] = useState<MealPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  // Check-in: keyed by "dayIndex-mealIndex"
  const [eatenMeals, setEatenMeals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchPlan() {
      try {
        const { id } = await params;
        const res = await fetch(`/api/meal-plans/${id}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error ?? "Failed to load meal plan");
        setPlan(json.data);

        // Restore check-in state from localStorage
        const stored = localStorage.getItem(`fitplan-checkin-${json.data.id}`);
        if (stored) setEatenMeals(JSON.parse(stored));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [params]);

  // Push plan context to chat whenever plan is loaded
  useEffect(() => {
    if (plan) {
      setPlanContext({
        id: plan.id,
        planType: plan.planType,
        fitnessGoal: plan.fitnessGoal,
        dietaryPreference: plan.dietaryPreference,
        targetCalories: plan.targetCalories,
        proteinGrams: plan.proteinGrams,
        carbGrams: plan.carbGrams,
        fatGrams: plan.fatGrams,
        dailyBudget: plan.dailyBudget,
        budgetCurrency: plan.budgetCurrency,
        meals: plan.meals,
      });
    }
    return () => setPlanContext(null);
  }, [plan, setPlanContext]);

  const toggleMealEaten = useCallback(
    (dayIdx: number, mealIdx: number) => {
      if (!plan) return;
      const key = `${dayIdx}-${mealIdx}`;
      setEatenMeals((prev) => {
        const updated = { ...prev, [key]: !prev[key] };
        localStorage.setItem(`fitplan-checkin-${plan.id}`, JSON.stringify(updated));
        return updated;
      });
    },
    [plan]
  );

  const handleMealSwap = useCallback(
    (dayIdx: number, mealIdx: number, newMeal: Meal) => {
      setPlan((prev) => {
        if (!prev) return prev;
        const updatedMeals = prev.meals.map((day, dIdx) => {
          if (dIdx !== dayIdx) return day;
          return {
            ...day,
            meals: day.meals.map((m, mIdx) => (mIdx === mealIdx ? newMeal : m)),
          };
        });
        return { ...prev, meals: updatedMeals };
      });
    },
    []
  );

  const handleFavoriteToggle = async () => {
    if (!plan) return;
    const newVal = !plan.isFavorite;
    setPlan({ ...plan, isFavorite: newVal });
    try {
      await fetch(`/api/meal-plans/${plan.id}/favorite`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: newVal }),
      });
      toast.success(newVal ? "Added to favorites" : "Removed from favorites");
    } catch {
      setPlan({ ...plan, isFavorite: !newVal });
      toast.error("Failed to update favorite");
    }
  };

  const handleShare = async () => {
    if (!plan) return;
    try {
      const res = await fetch(`/api/meal-plans/${plan.id}/share`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        const url = `${window.location.origin}/shared/${json.data.token}`;
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied to clipboard!");
        setPlan({ ...plan, sharedLink: { token: json.data.token, isActive: true } });
      }
    } catch {
      toast.error("Failed to create share link");
    }
  };

  const handleDelete = async () => {
    if (!plan || !confirm("Are you sure you want to delete this meal plan?")) return;
    try {
      await fetch(`/api/meal-plans/${plan.id}`, { method: "DELETE" });
      toast.success("Meal plan deleted");
      router.push("/meal-plans");
    } catch {
      toast.error("Failed to delete meal plan");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-10 w-64 bg-white/5 rounded-xl" />
        <Skeleton className="h-32 w-full bg-white/5 rounded-2xl" />
        <Skeleton className="h-48 w-full bg-white/5 rounded-2xl" />
        <Skeleton className="h-64 w-full bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center max-w-md mx-auto">
        <p className="text-gray-400 mb-4">{error ?? "Plan not found"}</p>
        <button
          onClick={() => router.push("/meal-plans")}
          className="px-5 py-2 rounded-xl border border-brand-teal/30 text-brand-teal text-sm font-medium hover:bg-brand-teal/10 transition-colors"
        >
          Back to Meal Plans
        </button>
      </div>
    );
  }

  const dailyPlans = plan.meals as DailyPlan[];
  const currentDay = dailyPlans[selectedDay];
  const goalColor = GOAL_COLORS[plan.fitnessGoal] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20";

  // Check-in progress for current day
  const totalMealsToday = currentDay?.meals.length ?? 0;
  const eatenTodayCount = currentDay?.meals.filter((_, mIdx) =>
    eatenMeals[`${selectedDay}-${mIdx}`]
  ).length ?? 0;
  const adherencePct = totalMealsToday > 0 ? Math.round((eatenTodayCount / totalMealsToday) * 100) : 0;

  return (
    <>
      <PageBackground image="meal-detail-bg.png" overlay="heavy" />
    <div className="space-y-6 max-w-4xl relative z-10">
      {/* Back link */}
      <button
        onClick={() => router.push("/meal-plans")}
        className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Meal Plans
      </button>

      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">
                {PLAN_TYPE_LABELS[plan.planType] ?? plan.planType} Meal Plan
              </h1>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${goalColor}`}>
                {FITNESS_GOAL_LABELS[plan.fitnessGoal as keyof typeof FITNESS_GOAL_LABELS] ?? plan.fitnessGoal}
              </span>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-brand-amber" />
                {plan.targetCalories.toLocaleString()} kcal/day
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-brand-teal" />
                {plan.budgetCurrency} {plan.totalDailyCost.toFixed(0)}/day
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-purple-light" />
                {new Date(plan.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-gray-600">
                {DIETARY_PREFERENCE_LABELS[plan.dietaryPreference] ?? plan.dietaryPreference}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleFavoriteToggle}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                plan.isFavorite
                  ? "bg-brand-amber/15 text-brand-amber border-brand-amber/30 hover:bg-brand-amber/25"
                  : "bg-white/5 text-gray-400 border-white/10 hover:text-brand-amber hover:border-brand-amber/30"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${plan.isFavorite ? "fill-brand-amber" : ""}`} />
              {plan.isFavorite ? "Favorited" : "Favorite"}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <MealPlanPDFButton plan={plan} />
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-red-500/20 bg-red-500/8 text-red-500/80 hover:bg-red-500/15 hover:text-red-400 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Macro Breakdown */}
      <MacroBreakdown
        targetCalories={plan.targetCalories}
        proteinGrams={plan.proteinGrams}
        carbGrams={plan.carbGrams}
        fatGrams={plan.fatGrams}
        proteinPercent={plan.proteinPercent}
        carbPercent={plan.carbPercent}
        fatPercent={plan.fatPercent}
      />

      {/* Day selector */}
      {dailyPlans.length > 1 && (
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Select Day</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {dailyPlans.map((day, i) => {
              const totalM = day.meals.length;
              const eatenM = day.meals.filter((_, mIdx) => eatenMeals[`${i}-${mIdx}`]).length;
              const pct = totalM > 0 ? Math.round((eatenM / totalM) * 100) : 0;
              return (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(i)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
                    selectedDay === i
                      ? "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
                      : "bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
                  }`}
                >
                  {day.dayName}
                  {eatenM > 0 && (
                    <span className="ml-1.5 text-xs text-brand-teal/70">
                      {pct}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Day navigation */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <button
              disabled={selectedDay === 0}
              onClick={() => setSelectedDay((d) => d - 1)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-xs text-gray-600">
              Day {selectedDay + 1} of {dailyPlans.length}
            </span>
            <button
              disabled={selectedDay === dailyPlans.length - 1}
              onClick={() => setSelectedDay((d) => d + 1)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Meals for selected day */}
      {currentDay && (
        <div className="space-y-4">
          {/* Day header with check-in progress */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{currentDay.dayName}</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-amber/10 border border-brand-amber/20">
                <Flame className="w-3.5 h-3.5 text-brand-amber" />
                <span className="text-brand-amber text-sm font-semibold">
                  {currentDay.totalCalories.toLocaleString()} kcal
                </span>
              </div>
              {/* Check-in progress pill */}
              {eatenTodayCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-teal/10 border border-brand-teal/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                  <span className="text-brand-teal text-sm font-semibold">
                    {eatenTodayCount}/{totalMealsToday} eaten
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Adherence progress bar */}
          {totalMealsToday > 0 && (
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-teal to-brand-teal/70 rounded-full transition-all duration-500"
                style={{ width: `${adherencePct}%` }}
              />
            </div>
          )}

          {currentDay.meals.map((meal, i) => (
            <MealCard
              key={`${selectedDay}-${i}`}
              meal={meal as Meal}
              currency={plan.budgetCurrency}
              isEaten={!!eatenMeals[`${selectedDay}-${i}`]}
              onToggleEaten={() => toggleMealEaten(selectedDay, i)}
              onSwap={(newMeal) => handleMealSwap(selectedDay, i, newMeal)}
              planId={plan.id}
              dayIndex={selectedDay}
              mealIndex={i}
            />
          ))}
        </div>
      )}

      {/* Grocery List */}
      <GroceryList
        items={plan.groceryList as GroceryItem[]}
        title="Grocery List"
        currency={plan.budgetCurrency}
      />
    </div>
    </>
  );
}
