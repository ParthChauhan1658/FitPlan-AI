"use client";

import { useEffect, useState } from "react";
import { PageBackground } from "@/components/shared/PageBackground";
import { Skeleton } from "@/components/ui/skeleton";
import { MealCard } from "@/components/cards/meal-card";
import { GroceryList } from "@/components/cards/grocery-list";
import { MacroBreakdown } from "@/components/cards/macro-breakdown";
import { Flame, DollarSign, Calendar, Zap } from "lucide-react";
import type { DailyPlan, GroceryItem } from "@/types";

interface SharedMealPlan {
  planType: string;
  targetCalories: number;
  fitnessGoal: string;
  dietaryPreference: string;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  proteinPercent?: number;
  carbPercent?: number;
  fatPercent?: number;
  totalDailyCost: number;
  budgetCurrency: string;
  meals: DailyPlan[];
  groceryList: GroceryItem[];
  createdAt: string;
}

export default function SharedPlanPage({
  params,
}: {
  params: { token: string };
}) {
  const [plan, setPlan] = useState<SharedMealPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/shared/${params.token}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error ?? "Failed to load shared meal plan");
        } else {
          setPlan(json.data);
        }
      } catch {
        setError("Failed to load shared meal plan");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.token]);

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-start justify-center pt-16 p-6">
        <PageBackground image="shared-bg.png" overlay="heavy" />
        <div className="relative z-10 w-full max-w-4xl space-y-6">
          <Skeleton className="h-10 w-64 bg-white/5 rounded-xl" />
          <Skeleton className="h-32 w-full bg-white/5 rounded-2xl" />
          <Skeleton className="h-48 w-full bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-6">
        <PageBackground image="shared-bg.png" overlay="heavy" />
        <div className="relative z-10 glass-card rounded-2xl p-12 text-center max-w-md">
          <p className="text-gray-400 mb-2">{error ?? "Meal plan not found"}</p>
          <p className="text-gray-600 text-sm">
            This shared link may have expired or been revoked.
          </p>
        </div>
      </div>
    );
  }

  const goalLabel = plan.fitnessGoal.replace(/_/g, " ");
  const dietLabel = plan.dietaryPreference.replace(/_/g, " ");

  return (
    <div className="min-h-screen relative">
      <PageBackground image="shared-bg.png" overlay="heavy" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 space-y-6">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-brand-teal/30 bg-brand-teal/10 text-brand-teal">
                  <Zap className="w-3 h-3" />
                  Shared Plan
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border border-white/10 bg-white/5 text-gray-400">
                  {goalLabel}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-white">
                {plan.planType} Meal Plan
              </h1>
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
                <span className="text-gray-600">{dietLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Macros */}
        <MacroBreakdown
          proteinGrams={plan.proteinGrams}
          carbGrams={plan.carbGrams}
          fatGrams={plan.fatGrams}
          targetCalories={plan.targetCalories}
          proteinPercent={plan.proteinPercent}
          carbPercent={plan.carbPercent}
          fatPercent={plan.fatPercent}
        />

        {/* Meals by day */}
        {plan.meals.map((day) => (
          <div key={day.day} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                Day {day.day}: {day.dayName}
              </h2>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-amber/10 border border-brand-amber/20">
                <Flame className="w-3.5 h-3.5 text-brand-amber" />
                <span className="text-brand-amber text-sm font-semibold">
                  {day.totalCalories.toLocaleString()} kcal
                </span>
              </div>
            </div>
            {day.meals.map((meal, idx) => (
              <MealCard key={idx} meal={meal} currency={plan.budgetCurrency} />
            ))}
          </div>
        ))}

        {/* Grocery list */}
        <GroceryList
          items={plan.groceryList}
          currency={plan.budgetCurrency}
        />

        <p className="text-xs text-center text-gray-700 pt-2">
          Generated by{" "}
          <span className="text-brand-teal font-semibold">FitPlan AI</span> on{" "}
          {new Date(plan.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
