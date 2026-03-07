"use client";

import Link from "next/link";
import { Sparkles, UtensilsCrossed, Settings, ArrowRight, Star, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { PageBackground } from "@/components/shared/PageBackground";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatsCards } from "@/components/cards/stats-cards";
import { EmptyState } from "@/components/shared/empty-state";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { FITNESS_GOAL_LABELS, PLAN_TYPE_LABELS } from "@/constants";
import type { FitnessGoal } from "@/types";

const QUICK_ACTIONS = [
  {
    href: "/meal-plans/new",
    icon: Sparkles,
    title: "Generate Meal Plan",
    description: "Create a new AI-powered meal plan tailored to your goals.",
    cta: "Generate Now",
    accent: "teal" as const,
  },
  {
    href: "/meal-plans",
    icon: UtensilsCrossed,
    title: "My Meal Plans",
    description: "Browse, favorite, and manage all your saved plans.",
    cta: "View Plans",
    accent: "purple" as const,
  },
  {
    href: "/settings",
    icon: Settings,
    title: "Profile & Settings",
    description: "Update your body metrics, preferences, and subscription.",
    cta: "Manage",
    accent: "amber" as const,
  },
];

const ACCENT_CLASSES = {
  teal: {
    icon: "bg-brand-teal/10 text-brand-teal",
    border: "hover:border-brand-teal/40 hover:shadow-[0_8px_30px_rgba(255,96,68,0.12)]",
    btn: "bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/20",
  },
  purple: {
    icon: "bg-brand-purple/10 text-brand-purple-light",
    border: "hover:border-brand-purple/40 hover:shadow-[0_8px_30px_rgba(255,179,71,0.12)]",
    btn: "bg-brand-purple/10 text-brand-purple-light hover:bg-brand-purple/20",
  },
  amber: {
    icon: "bg-brand-amber/10 text-brand-amber",
    border: "hover:border-brand-amber/40 hover:shadow-[0_8px_30px_rgba(255,179,71,0.12)]",
    btn: "bg-brand-amber/10 text-brand-amber hover:bg-brand-amber/20",
  },
};

export default function DashboardPage() {
  const { stats, isLoading, isError, mutate } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52 bg-white/5 rounded-xl" />
          <Skeleton className="h-4 w-80 bg-white/5 rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 bg-white/5 rounded-2xl" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 bg-white/5 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-gray-400 mb-4">Failed to load dashboard data.</p>
          <Button
            variant="outline"
            onClick={() => mutate()}
            className="border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageBackground image="dashboard-bg.png" overlay="heavy" />
    <div className="space-y-8 relative z-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-400 mt-1">Your personalized fitness nutrition overview.</p>
      </div>

      {/* Stats */}
      <StatsCards
        tier={stats.tier}
        generationsUsed={stats.generationsUsed}
        generationsLimit={stats.generationsLimit}
        nextBillingDate={stats.nextBillingDate}
      />

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            const ac = ACCENT_CLASSES[action.accent];
            return (
              <Link key={action.href} href={action.href}>
                <div
                  className={`glass-card rounded-2xl p-5 flex flex-col gap-4 h-full transition-all duration-300 hover:-translate-y-1 border border-transparent ${ac.border} cursor-pointer`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${ac.icon}`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-base">{action.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">{action.description}</p>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 w-fit transition-colors ${ac.btn}`}>
                    {action.cta}
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Meal Plans</h2>
          <Link
            href="/meal-plans"
            className="text-brand-teal text-sm hover:text-brand-teal-dim flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {stats.recentPlans.length === 0 ? (
          <EmptyState
            title="No meal plans yet"
            description="Generate your first AI-powered meal plan to see it here."
            actionLabel="Generate Plan"
            actionHref="/meal-plans/new"
          />
        ) : (
          <div className="space-y-3">
            {stats.recentPlans.map((plan) => (
              <Link key={plan.id} href={`/meal-plans/${plan.id}`}>
                <div className="glass-card rounded-xl px-5 py-4 flex items-center justify-between hover:-translate-y-0.5 hover:border-brand-teal/20 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0">
                    {plan.isFavorite && (
                      <Star className="w-4 h-4 text-brand-amber fill-brand-amber flex-shrink-0" aria-label="Favorited" />
                    )}
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {PLAN_TYPE_LABELS[plan.planType] ?? plan.planType} Plan —{" "}
                        <span className="text-brand-teal">{plan.targetCalories.toLocaleString()} kcal</span>
                      </p>
                      <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" aria-hidden="true" />
                        {new Date(plan.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-brand-purple/15 text-brand-purple-light border-brand-purple/30 text-xs ml-3 flex-shrink-0">
                    {FITNESS_GOAL_LABELS[plan.fitnessGoal as FitnessGoal] ?? plan.fitnessGoal}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
