import type { ActivityLevel, FitnessGoal, SubscriptionTier } from "@/types";

// ─── Activity Level Multipliers (Req 2.2) ────────────────────────────────────

export const ACTIVITY_MULTIPLIERS = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTRA_ACTIVE: 1.9,
} as const satisfies Record<ActivityLevel, number>;

// ─── Goal-Based Calorie Adjustments (Req 2.3) ────────────────────────────────

export const GOAL_CALORIE_ADJUSTMENTS = {
  FAT_LOSS: 0.8,
  MUSCLE_GAIN: 1.15,
  MAINTENANCE: 1.0,
  ATHLETIC_PERFORMANCE: 1.1,
} as const satisfies Record<FitnessGoal, number>;

// ─── Macro Split Percentages per Goal (Req 9.1–9.4) ──────────────────────────

export const MACRO_SPLITS = {
  FAT_LOSS: { proteinPercent: 40, carbPercent: 30, fatPercent: 30 },
  MUSCLE_GAIN: { proteinPercent: 35, carbPercent: 40, fatPercent: 25 },
  MAINTENANCE: { proteinPercent: 30, carbPercent: 40, fatPercent: 30 },
  ATHLETIC_PERFORMANCE: { proteinPercent: 25, carbPercent: 50, fatPercent: 25 },
} as const satisfies Record<
  FitnessGoal,
  { proteinPercent: number; carbPercent: number; fatPercent: number }
>;

// ─── Subscription Tier Limits (Req 5.1–5.3) ──────────────────────────────────

export const SUBSCRIPTION_LIMITS = {
  FREE: 3,
  PRO: 50,
  ULTIMATE: 9999,
} as const satisfies Record<SubscriptionTier, number>;

// ─── Stripe Price IDs ─────────────────────────────────────────────────────────

export const STRIPE_PRICE_IDS = {
  PRO: process.env.STRIPE_PRO_PRICE_ID ?? "price_pro_monthly",
  ULTIMATE: process.env.STRIPE_ULTIMATE_PRICE_ID ?? "price_ultimate_monthly",
} as const;

// ─── Generation Config ────────────────────────────────────────────────────────

export const MAX_GENERATION_TIMEOUT_MS = 30_000;
export const BUDGET_TOLERANCE_PERCENT = 10;

// ─── Display Constants ────────────────────────────────────────────────────────

export const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const;

export const MEAL_PLANS_PER_PAGE = 10;
export const RECENT_PLANS_COUNT = 5;
export const UPGRADE_PROMPT_THRESHOLD = 2 / 3;

// ─── UI Label Maps ────────────────────────────────────────────────────────────

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  FAT_LOSS: "Fat Loss",
  MUSCLE_GAIN: "Muscle Gain",
  MAINTENANCE: "Maintenance",
  ATHLETIC_PERFORMANCE: "Athletic Performance",
};

export const DIETARY_PREFERENCE_LABELS: Record<string, string> = {
  VEGETARIAN: "Vegetarian",
  NON_VEG: "Non-Veg",
  VEGAN: "Vegan",
  EGGETARIAN: "Eggetarian",
};

export const CUISINE_PREFERENCE_LABELS: Record<string, string> = {
  INDIAN: "Indian",
  CONTINENTAL: "Continental",
  MIXED: "Mixed",
};

export const COOKING_ABILITY_LABELS: Record<string, string> = {
  MINIMAL: "Minimal / Hostel",
  MODERATE: "Moderate",
  FULL_KITCHEN: "Full Kitchen",
};

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  SEDENTARY: "Sedentary (little to no exercise)",
  LIGHTLY_ACTIVE: "Lightly Active (1–3 days/week)",
  MODERATELY_ACTIVE: "Moderately Active (3–5 days/week)",
  VERY_ACTIVE: "Very Active (6–7 days/week)",
  EXTRA_ACTIVE: "Extra Active (twice/day or physical job)",
};

export const GENDER_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

export const PLAN_TYPE_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
};

export const SUBSCRIPTION_TIER_LABELS: Record<SubscriptionTier, string> = {
  FREE: "Free",
  PRO: "Pro",
  ULTIMATE: "Ultimate",
};
