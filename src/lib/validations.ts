import { z } from "zod";

// ─── Enum Schemas ─────────────────────────────────────────────────────────────

export const genderSchema = z.enum(["MALE", "FEMALE", "OTHER"]);

export const activityLevelSchema = z.enum([
  "SEDENTARY",
  "LIGHTLY_ACTIVE",
  "MODERATELY_ACTIVE",
  "VERY_ACTIVE",
  "EXTRA_ACTIVE",
]);

export const fitnessGoalSchema = z.enum([
  "FAT_LOSS",
  "MUSCLE_GAIN",
  "MAINTENANCE",
  "ATHLETIC_PERFORMANCE",
]);

export const dietaryPreferenceSchema = z.enum([
  "VEGETARIAN",
  "NON_VEG",
  "VEGAN",
  "EGGETARIAN",
]);

export const cuisinePreferenceSchema = z.enum([
  "INDIAN",
  "CONTINENTAL",
  "MIXED",
]);

export const cookingAbilitySchema = z.enum([
  "MINIMAL",
  "MODERATE",
  "FULL_KITCHEN",
]);

export const planTypeSchema = z.enum(["DAILY", "WEEKLY"]);

export const budgetCurrencySchema = z.enum(["INR", "USD"]);

// ─── User Profile Schema (Req 1.3, 1.4, 1.6) ────────────────────────────────

export const userProfileSchema = z.object({
  weightKg: z
    .number({ required_error: "Weight is required" })
    .positive("Weight must be a positive number"),
  heightCm: z
    .number({ required_error: "Height is required" })
    .positive("Height must be a positive number"),
  age: z
    .number({ required_error: "Age is required" })
    .int("Age must be a whole number")
    .min(13, "Age must be at least 13")
    .max(120, "Age must be at most 120"),
  gender: genderSchema,
  activityLevel: activityLevelSchema,
  dietaryPreference: dietaryPreferenceSchema.default("NON_VEG"),
  cuisinePreference: cuisinePreferenceSchema.default("MIXED"),
  allergies: z.array(z.string().trim().min(1)).default([]),
  dailyBudget: z
    .number({ required_error: "Daily budget is required" })
    .positive("Daily budget must be greater than 0"),
  budgetCurrency: budgetCurrencySchema.default("INR"),
  mealsPerDay: z
    .number({ required_error: "Meals per day is required" })
    .int("Meals per day must be a whole number")
    .min(3, "Meals per day must be between 3 and 6")
    .max(6, "Meals per day must be between 3 and 6"),
  cookingAbility: cookingAbilitySchema.default("MODERATE"),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;

// ─── Onboarding Schema (subset for initial onboarding — Req 1.3) ─────────────

export const onboardingSchema = z.object({
  weightKg: z
    .number({ required_error: "Weight is required" })
    .positive("Weight must be a positive number"),
  heightCm: z
    .number({ required_error: "Height is required" })
    .positive("Height must be a positive number"),
  age: z
    .number({ required_error: "Age is required" })
    .int("Age must be a whole number")
    .min(13, "Age must be at least 13")
    .max(120, "Age must be at most 120"),
  gender: genderSchema,
  activityLevel: activityLevelSchema,
  fitnessGoal: fitnessGoalSchema,
  dietaryPreference: dietaryPreferenceSchema.default("NON_VEG"),
  allergies: z.string().optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

// ─── Generation Input Schema (Req 3.1–3.6) ───────────────────────────────────

export const generationInputSchema = z.object({
  fitnessGoal: fitnessGoalSchema,
  weightKg: z
    .number({ required_error: "Weight is required" })
    .min(30, "Weight must be at least 30 kg")
    .max(300, "Weight must be at most 300 kg"),
  heightCm: z
    .number({ required_error: "Height is required" })
    .min(100, "Height must be at least 100 cm")
    .max(250, "Height must be at most 250 cm"),
  age: z
    .number({ required_error: "Age is required" })
    .int("Age must be a whole number")
    .min(13, "Minimum age is 13")
    .max(100, "Maximum age is 100"),
  gender: genderSchema,
  activityLevel: activityLevelSchema,
  dietaryPreference: dietaryPreferenceSchema,
  cuisinePreference: cuisinePreferenceSchema,
  allergies: z.array(z.string().trim().min(1)).default([]),
  dailyBudget: z
    .number({ required_error: "Daily budget is required" })
    .positive("Daily budget must be greater than 0"),
  budgetCurrency: budgetCurrencySchema,
  mealsPerDay: z
    .number({ required_error: "Meals per day is required" })
    .int("Meals per day must be a whole number")
    .min(3, "Meals per day must be between 3 and 6")
    .max(6, "Meals per day must be between 3 and 6"),
  cookingAbility: cookingAbilitySchema,
  planType: planTypeSchema,
});

export type GenerationInputValues = z.infer<typeof generationInputSchema>;

// ─── AI Response Validation Schema (Req 4.2) ─────────────────────────────────

const foodItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().min(1),
  calories: z.number().nonnegative(),
  proteinGrams: z.number().nonnegative(),
  carbGrams: z.number().nonnegative(),
  fatGrams: z.number().nonnegative(),
});

const mealSchema = z.object({
  name: z.string().min(1),
  totalCalories: z.number().nonnegative(),
  totalProtein: z.number().nonnegative(),
  totalCarbs: z.number().nonnegative(),
  totalFat: z.number().nonnegative(),
  estimatedCost: z.number().nonnegative(),
  foodItems: z.array(foodItemSchema).min(1),
  cookingInstructions: z.string().min(1),
});

const dailyPlanSchema = z.object({
  day: z.number().int().positive(),
  dayName: z.string().min(1),
  meals: z.array(mealSchema).min(1),
  totalCalories: z.number().nonnegative(),
  totalProtein: z.number().nonnegative(),
  totalCarbs: z.number().nonnegative(),
  totalFat: z.number().nonnegative(),
  totalCost: z.number().nonnegative(),
});

const groceryItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().min(1),
  estimatedCost: z.number().nonnegative(),
  category: z.string().optional(),
});

export const mealPlanResponseSchema = z.object({
  dailyPlans: z.array(dailyPlanSchema).min(1),
  dailyGroceryList: z.array(groceryItemSchema).min(1),
  weeklyGroceryList: z.array(groceryItemSchema).optional(),
  totalDailyCost: z.number().nonnegative(),
  totalWeeklyCost: z.number().nonnegative().optional(),
});

export type MealPlanResponseValues = z.infer<typeof mealPlanResponseSchema>;

// ─── Meal Plan Management Schemas ─────────────────────────────────────────────

export const updateFavoriteSchema = z.object({
  isFavorite: z.boolean(),
});

export type UpdateFavoriteInput = z.infer<typeof updateFavoriteSchema>;

export const createShareLinkSchema = z.object({
  mealPlanId: z.string().min(1, "Meal plan ID is required"),
});

export type CreateShareLinkInput = z.infer<typeof createShareLinkSchema>;

export const createCheckoutSchema = z.object({
  priceId: z.string().min(1, "Price ID is required"),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  favorites: z.coerce.boolean().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
