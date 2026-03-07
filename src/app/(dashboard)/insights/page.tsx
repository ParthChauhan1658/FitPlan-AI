"use client";

import { useEffect, useState, useCallback } from "react";
import { PageBackground } from "@/components/shared/PageBackground";
import {
  BarChart3,
  Flame,
  Beef,
  Wheat,
  Droplets,
  TrendingUp,
  Target,
  Zap,
  Calendar,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface PlanSummary {
  id: string;
  planType: string;
  targetCalories: number;
  fitnessGoal: string;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  createdAt: string;
}

interface InsightStats {
  totalPlans: number;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  topGoal: string | null;
  mostRecentDate: string | null;
  calorieHistory: { date: string; calories: number }[];
}

const GOAL_LABEL: Record<string, string> = {
  FAT_LOSS: "Fat Loss",
  MUSCLE_GAIN: "Muscle Gain",
  MAINTENANCE: "Maintenance",
  ATHLETIC_PERFORMANCE: "Athletic Performance",
};

const GOAL_COLOR: Record<string, string> = {
  FAT_LOSS: "text-red-400 bg-red-500/10 border-red-500/20",
  MUSCLE_GAIN: "text-brand-teal bg-brand-teal/10 border-brand-teal/20",
  MAINTENANCE: "text-brand-purple-light bg-brand-purple/10 border-brand-purple/20",
  ATHLETIC_PERFORMANCE: "text-brand-amber bg-brand-amber/10 border-brand-amber/20",
};

function computeInsights(plans: PlanSummary[]): InsightStats {
  if (plans.length === 0) {
    return {
      totalPlans: 0,
      avgCalories: 0,
      avgProtein: 0,
      avgCarbs: 0,
      avgFat: 0,
      topGoal: null,
      mostRecentDate: null,
      calorieHistory: [],
    };
  }

  const avg = (arr: number[]) => arr.reduce((s, n) => s + n, 0) / arr.length;

  const goalCounts: Record<string, number> = {};
  for (const p of plans) goalCounts[p.fitnessGoal] = (goalCounts[p.fitnessGoal] ?? 0) + 1;
  const topGoal = Object.entries(goalCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const sorted = [...plans].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const calorieHistory = sorted.slice(-10).map((p) => ({
    date: new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    calories: p.targetCalories,
  }));

  const mostRecentDate = sorted[sorted.length - 1]?.createdAt ?? null;

  return {
    totalPlans: plans.length,
    avgCalories: Math.round(avg(plans.map((p) => p.targetCalories))),
    avgProtein: Math.round(avg(plans.map((p) => p.proteinGrams))),
    avgCarbs: Math.round(avg(plans.map((p) => p.carbGrams))),
    avgFat: Math.round(avg(plans.map((p) => p.fatGrams))),
    topGoal,
    mostRecentDate,
    calorieHistory,
  };
}

function MacroBar({
  label,
  value,
  total,
  color,
  icon: Icon,
  textColor,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  icon: React.ElementType;
  textColor: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-white/5`}>
            <Icon className={`w-3.5 h-3.5 ${textColor}`} aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-gray-300">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${textColor}`}>{value}g</span>
          <span className="text-xs text-gray-600">({pct}%)</span>
        </div>
      </div>
      <div className="h-2 w-full bg-white/8 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CalorieChart({ history }: { history: { date: string; calories: number }[] }) {
  if (history.length < 2) return null;
  const vals = history.map((h) => h.calories);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-4 h-4 text-brand-teal" />
        <h2 className="text-white font-bold">Calorie Target History</h2>
        <span className="text-xs text-gray-600">(last {history.length} plans)</span>
      </div>
      <div className="flex items-end gap-2 h-28">
        {history.map((h, i) => {
          const pct = ((h.calories - minV) / range) * 100;
          const barH = Math.max(8, pct);
          const isLast = i === history.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative flex items-end justify-center" style={{ height: "100px" }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                  {h.calories} kcal
                </div>
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    isLast ? "bg-brand-teal" : "bg-brand-teal/35 group-hover:bg-brand-teal/60"
                  }`}
                  style={{ height: `${barH}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 truncate w-full text-center">{h.date}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
        <span>{minV.toLocaleString()} kcal (min)</span>
        <span>{maxV.toLocaleString()} kcal (max)</span>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/meal-plans?limit=50&page=1");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to load");
      setPlans(json.data?.plans ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const insights = computeInsights(plans);
  const totalMacroGrams = insights.avgProtein + insights.avgCarbs + insights.avgFat;

  const GOAL_DIST = plans.reduce<Record<string, number>>((acc, p) => {
    acc[p.fitnessGoal] = (acc[p.fitnessGoal] ?? 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-4 w-72 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-white/5 rounded-2xl animate-pulse" />
        <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center max-w-md">
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchPlans}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-teal/30 text-brand-teal text-sm font-medium hover:bg-brand-teal/10 transition-colors mx-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Nutrition Insights</h1>
          <p className="text-gray-400 mt-1">Patterns and analytics across all your meal plans.</p>
        </div>
        <div className="glass-card rounded-2xl p-14 text-center">
          <BarChart3 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-white font-semibold mb-1">No data yet</p>
          <p className="text-gray-500 text-sm mb-6">Generate your first meal plan to see insights here.</p>
          <Link
            href="/meal-plans/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-teal/10 border border-brand-teal/30 text-brand-teal text-sm font-semibold hover:bg-brand-teal/20 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generate First Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageBackground image="insights-bg.png" overlay="heavy" />
    <div className="space-y-6 max-w-3xl relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Nutrition Insights</h1>
          <p className="text-gray-400 mt-1">
            Aggregated patterns from {insights.totalPlans} meal plan{insights.totalPlans !== 1 ? "s" : ""}.
          </p>
        </div>
        <button
          onClick={fetchPlans}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-400 text-sm hover:text-white hover:border-white/20 transition-colors flex-shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Zap, label: "Total Plans", value: String(insights.totalPlans), sub: "generated", color: "bg-brand-teal/10 text-brand-teal" },
          { icon: Flame, label: "Avg Calories", value: insights.avgCalories.toLocaleString(), sub: "kcal per plan", color: "bg-brand-amber/10 text-brand-amber" },
          { icon: Target, label: "Top Goal", value: GOAL_LABEL[insights.topGoal ?? ""] ?? insights.topGoal ?? "—", sub: "most selected", color: "bg-brand-purple/10 text-brand-purple-light" },
          { icon: Calendar, label: "Last Plan", value: insights.mostRecentDate ? new Date(insights.mostRecentDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—", sub: String(insights.mostRecentDate ? new Date(insights.mostRecentDate).getFullYear() : ""), color: "bg-brand-mint/10 text-brand-mint" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card rounded-2xl p-4 flex flex-col gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon className="w-4.5 h-4.5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                <p className="text-lg font-extrabold text-white leading-snug">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Calorie history chart */}
      <CalorieChart history={insights.calorieHistory} />

      {/* Average macros */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-4 h-4 text-brand-teal" />
          <h2 className="text-white font-bold">Average Macro Profile</h2>
          <span className="text-xs text-gray-600 ml-1">across all plans</span>
        </div>
        <div className="space-y-4 mb-5">
          <MacroBar
            label="Protein"
            value={insights.avgProtein}
            total={totalMacroGrams}
            color="bg-brand-teal"
            textColor="text-brand-teal"
            icon={Beef}
          />
          <MacroBar
            label="Carbohydrates"
            value={insights.avgCarbs}
            total={totalMacroGrams}
            color="bg-brand-purple-light"
            textColor="text-brand-purple-light"
            icon={Wheat}
          />
          <MacroBar
            label="Fat"
            value={insights.avgFat}
            total={totalMacroGrams}
            color="bg-brand-amber"
            textColor="text-brand-amber"
            icon={Droplets}
          />
        </div>
        {/* Ratio bar */}
        <div className="flex h-2.5 overflow-hidden rounded-full mt-4">
          {totalMacroGrams > 0 && (
            <>
              <div className="bg-brand-teal" style={{ width: `${(insights.avgProtein / totalMacroGrams) * 100}%` }} />
              <div className="bg-brand-purple-light" style={{ width: `${(insights.avgCarbs / totalMacroGrams) * 100}%` }} />
              <div className="bg-brand-amber" style={{ width: `${(insights.avgFat / totalMacroGrams) * 100}%` }} />
            </>
          )}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          {[
            { label: "Protein", color: "bg-brand-teal" },
            { label: "Carbs", color: "bg-brand-purple-light" },
            { label: "Fat", color: "bg-brand-amber" },
          ].map((m) => (
            <span key={m.label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${m.color}`} />
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* Goal distribution */}
      {Object.keys(GOAL_DIST).length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Target className="w-4 h-4 text-brand-amber" />
            <h2 className="text-white font-bold">Goal Distribution</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(GOAL_DIST)
              .sort((a, b) => b[1] - a[1])
              .map(([goal, count]) => {
                const pct = Math.round((count / plans.length) * 100);
                const colorClass = GOAL_COLOR[goal] ?? "text-gray-400 bg-gray-500/10 border-gray-500/20";
                return (
                  <div key={goal} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
                        {GOAL_LABEL[goal] ?? goal}
                      </span>
                      <span className="text-sm text-gray-400">
                        {count} plan{count !== 1 ? "s" : ""} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/8 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          goal === "FAT_LOSS" ? "bg-red-400" :
                          goal === "MUSCLE_GAIN" ? "bg-brand-teal" :
                          goal === "MAINTENANCE" ? "bg-brand-purple-light" :
                          "bg-brand-amber"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
