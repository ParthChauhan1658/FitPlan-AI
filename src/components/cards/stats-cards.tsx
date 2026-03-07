"use client";

import Link from "next/link";
import { Crown, Zap, TrendingUp, ArrowRight, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SUBSCRIPTION_TIER_LABELS, UPGRADE_PROMPT_THRESHOLD } from "@/constants";
import type { SubscriptionTier } from "@/types";

interface StatsCardProps {
  tier: SubscriptionTier;
  generationsUsed: number;
  generationsLimit: number;
  nextBillingDate: string | Date | null;
}

const TIER_CONFIG: Record<
  SubscriptionTier,
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  FREE: {
    icon: Zap,
    color: "text-gray-400",
    bg: "bg-gray-400/10",
    border: "border-gray-400/20",
  },
  PRO: {
    icon: Crown,
    color: "text-brand-teal",
    bg: "bg-brand-teal/10",
    border: "border-brand-teal/20",
  },
  ULTIMATE: {
    icon: Crown,
    color: "text-brand-amber",
    bg: "bg-brand-amber/10",
    border: "border-brand-amber/20",
  },
};

export function StatsCards({
  tier,
  generationsUsed,
  generationsLimit,
  nextBillingDate,
}: StatsCardProps) {
  const isUnlimited = generationsLimit === -1;
  const usagePercent =
    isUnlimited || generationsLimit <= 0
      ? 100
      : Math.min(100, Math.round((generationsUsed / generationsLimit) * 100));
  const remaining = isUnlimited ? "∞" : Math.max(0, generationsLimit - generationsUsed);
  const showUpgradePrompt =
    tier === "FREE" &&
    !isUnlimited &&
    generationsLimit > 0 &&
    generationsUsed / generationsLimit >= UPGRADE_PROMPT_THRESHOLD;

  const tierCfg = TIER_CONFIG[tier] ?? TIER_CONFIG.FREE;
  const TierIcon = tierCfg.icon;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Current Plan */}
      <div className={`glass-card rounded-2xl p-5 border ${tierCfg.border}`}>
        <div className="flex items-start justify-between mb-4">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Current Plan</p>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tierCfg.bg}`}>
            <TierIcon className={`w-5 h-5 ${tierCfg.color}`} aria-hidden="true" />
          </div>
        </div>
        <p className={`text-2xl font-extrabold ${tierCfg.color}`}>
          {SUBSCRIPTION_TIER_LABELS[tier]}
        </p>
        {nextBillingDate ? (
          <p className="text-xs text-gray-600 mt-2">
            Next billing:{" "}
            {new Date(nextBillingDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        ) : (
          <p className="text-xs text-gray-600 mt-2">Free tier — no billing</p>
        )}
      </div>

      {/* Usage */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-start justify-between mb-4">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Generations Used</p>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-purple/10">
            <TrendingUp className="w-5 h-5 text-brand-purple-light" aria-hidden="true" />
          </div>
        </div>
        <div className="flex items-end gap-1.5 mb-3">
          <span className="text-2xl font-extrabold text-white">{generationsUsed}</span>
          <span className="text-gray-500 text-sm pb-0.5">
            / {isUnlimited ? "∞" : generationsLimit}
          </span>
        </div>
        {!isUnlimited && (
          <div className="space-y-1.5">
            <div
              className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={usagePercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercent >= 90
                    ? "bg-red-400"
                    : usagePercent >= 66
                    ? "bg-brand-amber"
                    : "bg-brand-teal"
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-600">{usagePercent}% of monthly limit used</p>
          </div>
        )}
        {isUnlimited && (
          <p className="text-xs text-brand-amber">Unlimited generations</p>
        )}
      </div>

      {/* Remaining / Upgrade */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-start justify-between mb-4">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Remaining</p>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-amber/10">
            <Zap className="w-5 h-5 text-brand-amber" aria-hidden="true" />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-white">{remaining}</p>
        <p className="text-xs text-gray-600 mt-1">generations left this period</p>

        {showUpgradePrompt && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-brand-amber/8 border border-brand-amber/20">
            <AlertTriangle className="w-3.5 h-3.5 text-brand-amber flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-xs text-brand-amber font-medium">Running low!</p>
              <Link
                href="/settings"
                className="text-xs text-gray-400 hover:text-brand-teal flex items-center gap-1 mt-0.5 transition-colors"
              >
                Upgrade to Pro
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
