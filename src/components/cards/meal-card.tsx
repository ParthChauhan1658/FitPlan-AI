"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { SnapToMeal } from "@/components/snap/SnapToMeal";
import type { Meal, FoodItem } from "@/types";

interface MealCardProps {
  meal: Meal;
  currency?: string;
  isEaten?: boolean;
  onToggleEaten?: () => void;
  onSwap?: (newMeal: Meal) => void;
  planId?: string;
  dayIndex?: number;
  mealIndex?: number;
}

const MEAL_COLORS: Record<string, string> = {
  Breakfast: "border-brand-amber/40",
  Lunch: "border-brand-teal/40",
  Dinner: "border-brand-coral/40",
  "Morning Snack": "border-brand-purple/40",
  "Evening Snack": "border-brand-purple/40",
  Snack: "border-brand-purple/40",
};

const MEAL_ICONS: Record<string, string> = {
  Breakfast: "🌅",
  Lunch: "☀️",
  Dinner: "🌙",
  "Morning Snack": "🍎",
  "Evening Snack": "🥜",
  Snack: "🍎",
};

export function MealCard({
  meal,
  currency = "INR",
  isEaten = false,
  onToggleEaten,
  onSwap,
  planId,
  dayIndex,
  mealIndex,
}: MealCardProps) {
  const [swapping, setSwapping] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const mealBorder = MEAL_COLORS[meal.name] ?? "border-white/10";
  const mealIcon = MEAL_ICONS[meal.name] ?? "🍽️";

  const handleSwap = async () => {
    if (!planId || dayIndex === undefined || mealIndex === undefined) return;
    setSwapping(true);
    try {
      const res = await fetch(`/api/meal-plans/${planId}/swap-meal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayIndex, mealIndex }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Swap failed");
      onSwap?.(json.data.meal);
      toast.success(`${meal.name} swapped successfully!`);
    } catch {
      toast.error("Failed to swap meal. Try again.");
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div
      className={`glass-card rounded-2xl border-l-[3px] ${mealBorder} transition-all duration-300 ${
        isEaten ? "opacity-60" : ""
      }`}
    >
      {/* Meal Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{mealIcon}</span>
          <div>
            <h3
              className={`font-bold text-base ${isEaten ? "line-through text-gray-500" : "text-white"}`}
            >
              {meal.name}
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span className="text-brand-amber font-semibold">
                {meal.totalCalories} kcal
              </span>
              <span>P: {meal.totalProtein}g</span>
              <span>C: {meal.totalCarbs}g</span>
              <span>F: {meal.totalFat}g</span>
              <span className="ml-1 text-gray-600">
                {currency} {meal.estimatedCost}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {/* Snap-to-Meal */}
          <SnapToMeal plannedMeal={meal} currency={currency} />

          {onSwap && (
            <button
              onClick={handleSwap}
              disabled={swapping}
              title="Swap this meal for a different one"
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-all disabled:opacity-50 disabled:cursor-wait"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${swapping ? "animate-spin" : ""}`}
              />
            </button>
          )}
          {onToggleEaten && (
            <button
              onClick={onToggleEaten}
              title={isEaten ? "Mark as not eaten" : "Mark as eaten"}
              className={`p-1.5 rounded-lg transition-all ${
                isEaten
                  ? "text-brand-teal hover:text-gray-400"
                  : "text-gray-600 hover:text-brand-teal hover:bg-brand-teal/10"
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 ${isEaten ? "fill-brand-teal/20" : ""}`}
              />
            </button>
          )}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/8 transition-all"
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Food items table */}
          <div className="overflow-hidden rounded-xl border border-white/5">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-white/3">
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">
                    Item
                  </th>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">
                    Qty
                  </th>
                  <th className="px-3 py-2 text-right text-gray-500 font-medium">
                    Cal
                  </th>
                  <th className="px-3 py-2 text-right text-gray-500 font-medium hidden sm:table-cell">
                    P
                  </th>
                  <th className="px-3 py-2 text-right text-gray-500 font-medium hidden sm:table-cell">
                    C
                  </th>
                  <th className="px-3 py-2 text-right text-gray-500 font-medium hidden sm:table-cell">
                    F
                  </th>
                </tr>
              </thead>
              <tbody>
                {(meal.foodItems as FoodItem[]).map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-3 py-2 text-white/80">{item.name}</td>
                    <td className="px-3 py-2 text-gray-500">{item.quantity}</td>
                    <td className="px-3 py-2 text-right text-brand-amber/90 font-medium">
                      {item.calories}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-600 hidden sm:table-cell">
                      {item.proteinGrams}g
                    </td>
                    <td className="px-3 py-2 text-right text-gray-600 hidden sm:table-cell">
                      {item.carbGrams}g
                    </td>
                    <td className="px-3 py-2 text-right text-gray-600 hidden sm:table-cell">
                      {item.fatGrams}g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cooking instructions */}
          {meal.cookingInstructions && (
            <div className="rounded-xl bg-white/3 border border-white/5 px-3 py-2.5">
              <p className="text-xs text-gray-400 italic leading-relaxed">
                {meal.cookingInstructions}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
