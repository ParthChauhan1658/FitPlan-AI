// ─── Enum Types (mirror Prisma enums for client-side use) ─────────────────────

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type ActivityLevel =
  | "SEDENTARY"
  | "LIGHTLY_ACTIVE"
  | "MODERATELY_ACTIVE"
  | "VERY_ACTIVE"
  | "EXTRA_ACTIVE";

export type FitnessGoal =
  | "FAT_LOSS"
  | "MUSCLE_GAIN"
  | "MAINTENANCE"
  | "ATHLETIC_PERFORMANCE";

export type DietaryPreference =
  | "VEGETARIAN"
  | "NON_VEG"
  | "VEGAN"
  | "EGGETARIAN";

export type CuisinePreference = "INDIAN" | "CONTINENTAL" | "MIXED";

export type CookingAbility = "MINIMAL" | "MODERATE" | "FULL_KITCHEN";

export type PlanType = "DAILY" | "WEEKLY";

export type SubscriptionTier = "FREE" | "PRO" | "ULTIMATE";

export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELED"
  | "PAST_DUE"
  | "INCOMPLETE";

export type BudgetCurrency = "INR" | "USD";

// ─── Domain Interfaces ───────────────────────────────────────────────────────

/** User record — maps to DB User + Clerk (Req 1.1, 1.2) */
export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** User profile — body metrics and preferences (Req 1.3, 1.4) */
export interface UserProfile {
  id: string;
  userId: string;
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  dietaryPreference: DietaryPreference;
  cuisinePreference: CuisinePreference;
  allergies: string[];
  dailyBudget: number;
  budgetCurrency: BudgetCurrency;
  mealsPerDay: number;
  cookingAbility: CookingAbility;
  createdAt: Date;
  updatedAt: Date;
}

/** Macro breakdown — protein, carbs, fat grams and percentages (Req 9.1–9.5) */
export interface MacroBreakdown {
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  proteinPercent: number;
  carbPercent: number;
  fatPercent: number;
}

/** Individual food item within a meal (Req 4.2) */
export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
}

/** Individual meal with food items, instructions, and cost (Req 4.2) */
export interface Meal {
  name: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  estimatedCost: number;
  foodItems: FoodItem[];
  cookingInstructions: string;
}

/** Daily plan — one day's worth of meals (Req 4.2) */
export interface DailyPlan {
  day: number;
  dayName: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCost: number;
}

/** Grocery list item (Req 4.2) */
export interface GroceryItem {
  name: string;
  quantity: string;
  estimatedCost: number;
  category?: string;
}

/** Complete meal plan with all metadata (Req 4.2, 6.1) */
export interface MealPlan {
  id: string;
  userId: string;
  planType: PlanType;
  targetCalories: number;
  fitnessGoal: FitnessGoal;
  dietaryPreference: DietaryPreference;
  cuisinePreference: CuisinePreference;
  cookingAbility: CookingAbility;
  allergies: string[];
  mealsPerDay: number;
  dailyBudget: number;
  budgetCurrency: BudgetCurrency;
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
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Meal plan summary — used in list views (Req 6.2) */
export interface MealPlanSummary {
  id: string;
  planType: PlanType;
  targetCalories: number;
  fitnessGoal: FitnessGoal;
  dietaryPreference: DietaryPreference;
  isFavorite: boolean;
  createdAt: Date;
}

/** Subscription record (Req 5.1–5.10) */
export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  generationsUsed: number;
  generationsLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Generation input — form data for meal plan generation (Req 3.1) */
export interface GenerationInput {
  fitnessGoal: FitnessGoal;
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  dietaryPreference: DietaryPreference;
  cuisinePreference: CuisinePreference;
  allergies: string[];
  dailyBudget: number;
  budgetCurrency: BudgetCurrency;
  mealsPerDay: number;
  cookingAbility: CookingAbility;
  planType: PlanType;
}

/** Generation output — AI response structure (Req 4.2) */
export interface GenerationOutput {
  dailyPlans: DailyPlan[];
  dailyGroceryList: GroceryItem[];
  weeklyGroceryList?: GroceryItem[];
  totalDailyCost: number;
  totalWeeklyCost?: number;
}

/** Dashboard stats (Req 8.1) */
export interface DashboardStats {
  tier: SubscriptionTier;
  generationsUsed: number;
  generationsLimit: number;
  nextBillingDate: Date | null;
  recentPlans: MealPlanSummary[];
}

// ─── API Response Types ─────────────────────────────────────────────────────

/** Standard API response wrapper */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
