"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { PageBackground } from "@/components/shared/PageBackground";
import { toast } from "sonner";
import { Sparkles, Star, UtensilsCrossed, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MealPlanCard } from "@/components/cards/meal-plan-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useMealPlans } from "@/hooks/use-meal-plans";

export default function MealPlansPage() {
  const [page, setPage] = useState(1);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { plans, total, totalPages, isLoading, isError, mutate } =
    useMealPlans({ page, limit: 10, favorites: favoritesOnly });

  const handleFavoriteToggle = useCallback(
    async (id: string, isFavorite: boolean) => {
      try {
        const res = await fetch(`/api/meal-plans/${id}/favorite`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFavorite }),
        });
        if (!res.ok) throw new Error("Failed to update favorite");
        toast.success(isFavorite ? "Added to favorites" : "Removed from favorites");
        mutate();
      } catch {
        toast.error("Failed to update favorite");
      }
    },
    [mutate]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this meal plan?")) return;
      try {
        const res = await fetch(`/api/meal-plans/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete meal plan");
        toast.success("Meal plan deleted");
        mutate();
      } catch {
        toast.error("Failed to delete meal plan");
      }
    },
    [mutate]
  );

  return (
    <>
      <PageBackground image="meal-plans-bg.png" overlay="heavy" />
    <div className="space-y-6 relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Meal Plans</h1>
          <p className="text-gray-400 mt-1">
            Your AI-generated plans — browse, favorite, and manage them all.
          </p>
        </div>
        <Link href="/meal-plans/new">
          <Button className="gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-brand-teal to-brand-teal/80 text-brand-navy font-semibold hover:from-brand-teal/90 hover:to-brand-teal/70 shadow-[0_4px_20px_rgba(0,212,255,0.25)] transition-all flex-shrink-0">
            <Sparkles className="w-4 h-4" />
            Generate New Plan
          </Button>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => { setFavoritesOnly(false); setPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              !favoritesOnly
                ? "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            All Plans
          </button>
          <button
            onClick={() => { setFavoritesOnly(true); setPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              favoritesOnly
                ? "bg-brand-amber/15 text-brand-amber border border-brand-amber/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            Favorites
          </button>
        </div>

        {total !== undefined && (
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <Filter className="w-3.5 h-3.5" />
            {total} plan{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52 bg-white/5 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-gray-400 mb-4">Failed to load meal plans.</p>
          <Button
            variant="outline"
            onClick={() => mutate()}
            className="border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10 rounded-xl"
          >
            Retry
          </Button>
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          title={favoritesOnly ? "No favorite meal plans" : "No meal plans yet"}
          description={
            favoritesOnly
              ? "Mark plans as favorites and they'll appear here."
              : "Generate your first AI-powered meal plan to get started."
          }
          actionLabel={favoritesOnly ? undefined : "Generate Plan"}
          actionHref={favoritesOnly ? undefined : "/meal-plans/new"}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map(
            (plan: {
              id: string;
              planType: string;
              targetCalories: number;
              fitnessGoal: string;
              dietaryPreference: string;
              isFavorite: boolean;
              createdAt: string;
              totalDailyCost: number;
              budgetCurrency: string;
            }) => (
              <MealPlanCard
                key={plan.id}
                plan={plan}
                onFavoriteToggle={handleFavoriteToggle}
                onDelete={handleDelete}
              />
            )
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="px-4 py-2 rounded-xl bg-white/5 text-sm text-gray-400 border border-white/10">
            {page} <span className="text-gray-600">of</span> {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
    </>
  );
}
