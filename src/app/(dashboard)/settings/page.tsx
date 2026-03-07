"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageBackground } from "@/components/shared/PageBackground";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import {
  User,
  Mail,
  Shield,
  Crown,
  Zap,
  TrendingUp,
  Scale,
  Ruler,
  Calendar,
  Activity,
  Utensils,
  ChefHat,
  DollarSign,
  Globe,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Flame,
  Save,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { userProfileSchema, type UserProfileInput } from "@/lib/validations";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useSubscription } from "@/hooks/use-subscription";
import {
  GENDER_LABELS,
  ACTIVITY_LEVEL_LABELS,
  DIETARY_PREFERENCE_LABELS,
  CUISINE_PREFERENCE_LABELS,
  COOKING_ABILITY_LABELS,
  SUBSCRIPTION_TIER_LABELS,
  STRIPE_PRICE_IDS,
} from "@/constants";
import type { SubscriptionTier } from "@/types";

const TIER_STYLES: Record<SubscriptionTier, { border: string; glow: string; badge: string; icon: React.ElementType; color: string }> = {
  FREE: {
    border: "border-gray-500/30",
    glow: "",
    badge: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    icon: Zap,
    color: "text-gray-400",
  },
  PRO: {
    border: "border-brand-teal/30",
    glow: "shadow-[0_0_30px_rgba(255,96,68,0.08)]",
    badge: "bg-brand-teal/15 text-brand-teal border-brand-teal/30",
    icon: Crown,
    color: "text-brand-teal",
  },
  ULTIMATE: {
    border: "border-brand-amber/30",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.08)]",
    badge: "bg-brand-amber/15 text-brand-amber border-brand-amber/30",
    icon: Crown,
    color: "text-brand-amber",
  },
};

function StyledSelect({
  id,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { id: string }) {
  return (
    <select
      id={id}
      className="flex h-11 w-full rounded-xl border border-white/10 bg-[#1e1f21] px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal/50 focus:ring-1 focus:ring-brand-teal/30 transition-colors appearance-none cursor-pointer [&>option]:bg-[#1e1f21] [&>option]:text-white"
      {...props}
    >
      {children}
    </select>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  color = "text-brand-teal",
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-white font-semibold text-base">{title}</h2>
        <p className="text-gray-500 text-sm mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user: clerkUser } = useUser();
  const { data: profileData, isLoading: profileLoading, mutate: mutateProfile } = useUserProfile();
  const { subscription, isLoading: subLoading, mutate: mutateSub } = useSubscription();
  const [saving, setSaving] = useState(false);
  const [allergyInput, setAllergyInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserProfileInput>({
    resolver: zodResolver(userProfileSchema),
  });

  const allergies = watch("allergies") ?? [];

  useEffect(() => {
    if (profileData?.user?.profile) {
      const p = profileData.user.profile as Record<string, unknown>;
      reset({
        weightKg: p.weightKg as number,
        heightCm: p.heightCm as number,
        age: p.age as number,
        gender: p.gender as UserProfileInput["gender"],
        activityLevel: p.activityLevel as UserProfileInput["activityLevel"],
        dietaryPreference: p.dietaryPreference as UserProfileInput["dietaryPreference"],
        cuisinePreference: p.cuisinePreference as UserProfileInput["cuisinePreference"],
        allergies: (p.allergies as string[]) ?? [],
        dailyBudget: p.dailyBudget as number,
        budgetCurrency: p.budgetCurrency as UserProfileInput["budgetCurrency"],
        mealsPerDay: p.mealsPerDay as number,
        cookingAbility: p.cookingAbility as UserProfileInput["cookingAbility"],
      });
    }
  }, [profileData, reset]);

  const onSubmit = async (data: UserProfileInput) => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Profile updated successfully!");
      mutateProfile();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async (tier: "PRO" | "ULTIMATE") => {
    try {
      const priceId = STRIPE_PRICE_IDS[tier];
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const json = await res.json();
      if (json.success && json.data?.url) {
        window.location.href = json.data.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch {
      toast.error("Failed to start upgrade");
    }
  };

  const handleAllergyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && allergyInput.trim()) {
      e.preventDefault();
      const trimmed = allergyInput.trim().replace(/,$/, "");
      if (trimmed && !allergies.includes(trimmed)) {
        setValue("allergies", [...allergies, trimmed], { shouldValidate: true });
      }
      setAllergyInput("");
    }
  };

  const removeAllergy = (tag: string) => {
    setValue("allergies", allergies.filter((a) => a !== tag), { shouldValidate: true });
  };

  if (profileLoading || subLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40 bg-white/5 rounded-xl" />
          <Skeleton className="h-4 w-72 bg-white/5 rounded-lg" />
        </div>
        <Skeleton className="h-32 bg-white/5 rounded-2xl" />
        <Skeleton className="h-80 bg-white/5 rounded-2xl" />
        <Skeleton className="h-48 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  const sub = subscription;
  const profileSub = profileData?.user?.subscription;
  const tier: SubscriptionTier = ((sub?.tier ?? profileSub?.plan ?? "FREE") as SubscriptionTier);
  const used = sub?.generationsUsed ?? profileSub?.generationsUsed ?? 0;
  const limit = sub?.generationsLimit ?? profileSub?.generationsLimit ?? 3;
  const isUnlimited = limit === -1 || limit >= 9999;
  const usagePercent = isUnlimited ? 100 : limit > 0 ? Math.round((used / limit) * 100) : 0;
  const periodEnd = sub?.currentPeriodEnd ?? null;
  const tierStyle = TIER_STYLES[tier] ?? TIER_STYLES.FREE;
  const TierIcon = tierStyle.icon;

  const displayName = clerkUser
    ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "User"
    : profileData?.user?.firstName
    ? `${profileData.user.firstName} ${profileData.user.lastName ?? ""}`.trim()
    : "User";
  const displayEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? profileData?.user?.email ?? "";
  const avatarUrl = clerkUser?.imageUrl ?? profileData?.user?.imageUrl ?? null;
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <PageBackground image="settings-bg.png" overlay="heavy" />
    <div className="space-y-6 max-w-3xl relative z-10">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Account Settings</h1>
        <p className="text-gray-400 mt-1">Manage your profile, body metrics, and subscription.</p>
      </div>

      {/* Account Identity Card */}
      <div className="glass-card rounded-2xl p-6">
        <SectionHeader icon={User} title="Account Identity" description="Your public profile and authentication details." />
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-teal/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-teal/30 to-brand-purple/30 border-2 border-brand-teal/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{initials}</span>
              </div>
            )}
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-brand-teal flex items-center justify-center border-2 border-brand-navy">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-navy" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-white truncate">{displayName}</p>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <p className="text-gray-400 text-sm truncate">{displayEmail}</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${tierStyle.badge}`}>
                <TierIcon className="w-3 h-3" />
                {SUBSCRIPTION_TIER_LABELS[tier]} Plan
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-400 border border-white/10">
                <Shield className="w-3 h-3 text-brand-teal" />
                Verified
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile & Preferences Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Body Metrics */}
        <div className="glass-card rounded-2xl p-6">
          <SectionHeader
            icon={Scale}
            title="Body Metrics"
            description="Your physical stats used to calculate your personalized TDEE and macros."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="weightKg" className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                <Scale className="w-3.5 h-3.5 text-gray-500" />
                Weight (kg)
              </label>
              <Input
                id="weightKg"
                type="number"
                step="0.1"
                placeholder="70"
                className="h-11 rounded-xl bg-[#1e1f21] border-white/10 text-white placeholder:text-gray-400 focus:border-brand-teal/50 focus:ring-brand-teal/20"
                {...register("weightKg", { valueAsNumber: true })}
              />
              {errors.weightKg && <p className="text-xs text-red-400">{errors.weightKg.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="heightCm" className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                <Ruler className="w-3.5 h-3.5 text-gray-500" />
                Height (cm)
              </label>
              <Input
                id="heightCm"
                type="number"
                step="0.1"
                placeholder="175"
                className="h-11 rounded-xl bg-[#1e1f21] border-white/10 text-white placeholder:text-gray-400 focus:border-brand-teal/50 focus:ring-brand-teal/20"
                {...register("heightCm", { valueAsNumber: true })}
              />
              {errors.heightCm && <p className="text-xs text-red-400">{errors.heightCm.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="age" className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                Age
              </label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                className="h-11 rounded-xl bg-[#1e1f21] border-white/10 text-white placeholder:text-gray-400 focus:border-brand-teal/50 focus:ring-brand-teal/20"
                {...register("age", { valueAsNumber: true })}
              />
              {errors.age && <p className="text-xs text-red-400">{errors.age.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="gender" className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                <User className="w-3.5 h-3.5 text-gray-500" />
                Gender
              </label>
              <StyledSelect id="gender" {...register("gender")}>
                {Object.entries(GENDER_LABELS).map(([val, label]) => (
                  <option key={val} value={val} className="bg-gray-900">{label}</option>
                ))}
              </StyledSelect>
            </div>
          </div>
        </div>

        {/* Lifestyle */}
        <div className="glass-card rounded-2xl p-6">
          <SectionHeader
            icon={Activity}
            title="Lifestyle"
            description="Your activity level determines your daily energy expenditure multiplier."
            color="text-brand-purple-light"
          />
          <div className="space-y-2">
            <label htmlFor="activityLevel" className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
              <Activity className="w-3.5 h-3.5 text-gray-500" />
              Activity Level
            </label>
            <StyledSelect id="activityLevel" {...register("activityLevel")}>
              {Object.entries(ACTIVITY_LEVEL_LABELS).map(([val, label]) => (
                <option key={val} value={val} className="bg-gray-900">{label}</option>
              ))}
            </StyledSelect>
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="glass-card rounded-2xl p-6">
          <SectionHeader
            icon={Utensils}
            title="Dietary Preferences"
            description="Used to filter recipes and allergens in every generated plan."
            color="text-brand-amber"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="dietaryPreference" className="text-sm font-medium text-gray-300">Dietary Preference</label>
              <StyledSelect id="dietaryPreference" {...register("dietaryPreference")}>
                {Object.entries(DIETARY_PREFERENCE_LABELS).map(([val, label]) => (
                  <option key={val} value={val} className="bg-gray-900">{label}</option>
                ))}
              </StyledSelect>
            </div>
            <div className="space-y-2">
              <label htmlFor="cuisinePreference" className="text-sm font-medium text-gray-300">Cuisine Preference</label>
              <StyledSelect id="cuisinePreference" {...register("cuisinePreference")}>
                {Object.entries(CUISINE_PREFERENCE_LABELS).map(([val, label]) => (
                  <option key={val} value={val} className="bg-gray-900">{label}</option>
                ))}
              </StyledSelect>
            </div>
          </div>

          {/* Allergies */}
          <div className="space-y-2 mt-4">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
              <AlertTriangle className="w-3.5 h-3.5 text-brand-amber" />
              Food Allergies &amp; Intolerances
            </label>
            <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 rounded-xl border border-white/10 bg-white/5">
              {allergies.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeAllergy(tag)}
                    className="ml-0.5 hover:text-red-300 transition-colors"
                    aria-label={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={handleAllergyKeyDown}
                placeholder={allergies.length === 0 ? "Type and press Enter (e.g. peanuts, gluten)…" : "Add more…"}
                className="flex-1 min-w-[140px] bg-transparent text-sm text-white placeholder:text-gray-400 outline-none"
              />
            </div>
            <p className="text-xs text-gray-600">Strictly excluded from every AI-generated plan.</p>
          </div>
        </div>

        {/* Budget & Cooking */}
        <div className="glass-card rounded-2xl p-6">
          <SectionHeader
            icon={ChefHat}
            title="Budget &amp; Cooking"
            description="Controls recipe complexity and ingredient cost targets."
            color="text-brand-teal"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="dailyBudget" className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                Daily Budget
              </label>
              <Input
                id="dailyBudget"
                type="number"
                step="1"
                placeholder="500"
                className="h-11 rounded-xl bg-[#1e1f21] border-white/10 text-white placeholder:text-gray-400 focus:border-brand-teal/50 focus:ring-brand-teal/20"
                {...register("dailyBudget", { valueAsNumber: true })}
              />
              {errors.dailyBudget && <p className="text-xs text-red-400">{errors.dailyBudget.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="budgetCurrency" className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                <Globe className="w-3.5 h-3.5 text-gray-500" />
                Currency
              </label>
              <StyledSelect id="budgetCurrency" {...register("budgetCurrency")}>
                <option value="INR" className="bg-gray-900">INR — Indian Rupee</option>
                <option value="USD" className="bg-gray-900">USD — US Dollar</option>
              </StyledSelect>
            </div>
            <div className="space-y-2">
              <label htmlFor="mealsPerDay" className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                <Flame className="w-3.5 h-3.5 text-gray-500" />
                Meals / Day
              </label>
              <Input
                id="mealsPerDay"
                type="number"
                min={3}
                max={6}
                placeholder="4"
                className="h-11 rounded-xl bg-[#1e1f21] border-white/10 text-white placeholder:text-gray-400 focus:border-brand-teal/50 focus:ring-brand-teal/20"
                {...register("mealsPerDay", { valueAsNumber: true })}
              />
              {errors.mealsPerDay && <p className="text-xs text-red-400">{errors.mealsPerDay.message}</p>}
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <label htmlFor="cookingAbility" className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
              <ChefHat className="w-3.5 h-3.5 text-gray-500" />
              Cooking Ability
            </label>
            <StyledSelect id="cookingAbility" {...register("cookingAbility")}>
              {Object.entries(COOKING_ABILITY_LABELS).map(([val, label]) => (
                <option key={val} value={val} className="bg-gray-900">{label}</option>
              ))}
            </StyledSelect>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="gap-2 h-11 px-8 rounded-xl bg-gradient-to-r from-brand-teal to-brand-teal/80 text-brand-navy font-semibold hover:from-brand-teal/90 hover:to-brand-teal/70 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Billing & Subscription */}
      <div className={`glass-card rounded-2xl p-6 border ${tierStyle.border} ${tierStyle.glow}`}>
        <SectionHeader
          icon={Settings2}
          title="Billing &amp; Subscription"
          description="Manage your plan, view usage, and upgrade for more generations."
          color={tierStyle.color}
        />

        {/* Tier card */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5`}>
              <TierIcon className={`w-6 h-6 ${tierStyle.color}`} />
            </div>
            <div>
              <p className={`text-xl font-extrabold ${tierStyle.color}`}>
                {SUBSCRIPTION_TIER_LABELS[tier]}
              </p>
              <p className="text-xs text-gray-500">
                {periodEnd
                  ? `Renews ${new Date(periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                  : "Free tier — no billing"}
              </p>
            </div>
          </div>
          {tier !== "ULTIMATE" && (
            <div className="flex gap-2 flex-wrap">
              {tier === "FREE" && (
                <button
                  onClick={() => handleUpgrade("PRO")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-teal/10 border border-brand-teal/30 text-brand-teal text-sm font-semibold hover:bg-brand-teal/20 transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Pro — $9/mo
                </button>
              )}
              <button
                onClick={() => handleUpgrade("ULTIMATE")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-amber/10 border border-brand-amber/30 text-brand-amber text-sm font-semibold hover:bg-brand-amber/20 transition-colors"
              >
                <Crown className="w-3.5 h-3.5" />
                Ultimate — $29/mo
              </button>
            </div>
          )}
        </div>

        {/* Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-purple-light" />
              <span className="text-sm font-medium text-gray-300">Generations Used</span>
            </div>
            <span className="text-sm font-bold text-white">
              {used} <span className="text-gray-500 font-normal">/ {isUnlimited ? "∞" : limit}</span>
            </span>
          </div>
          {!isUnlimited && (
            <>
              <div
                className="h-2 w-full bg-white/10 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={usagePercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    usagePercent >= 90 ? "bg-red-400" : usagePercent >= 66 ? "bg-brand-amber" : "bg-brand-teal"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">{usagePercent}% of monthly limit used • {Math.max(0, limit - used)} remaining</p>
            </>
          )}
          {isUnlimited && (
            <p className="text-xs text-brand-amber font-medium">Unlimited generations — no cap</p>
          )}
        </div>

        {/* Plan features comparison */}
        {tier === "FREE" && (
          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            {[
              { tier: "Pro", price: "$9/mo", gens: "50 plans/mo", color: "brand-teal", action: () => handleUpgrade("PRO") },
              { tier: "Ultimate", price: "$29/mo", gens: "Unlimited", color: "brand-amber", action: () => handleUpgrade("ULTIMATE") },
            ].map((plan) => (
              <div
                key={plan.tier}
                className={`p-4 rounded-xl border border-${plan.color}/20 bg-${plan.color}/5 cursor-pointer hover:border-${plan.color}/40 transition-all`}
                onClick={plan.action}
              >
                <p className={`text-sm font-bold text-${plan.color}`}>{plan.tier}</p>
                <p className="text-xs text-gray-500 mt-0.5">{plan.gens} · {plan.price}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
