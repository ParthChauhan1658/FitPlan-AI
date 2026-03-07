import { describe, it, expect } from "vitest";
import {
  userProfileSchema,
  onboardingSchema,
  generationInputSchema,
  updateFavoriteSchema,
  createCheckoutSchema,
  paginationSchema,
} from "@/lib/validations";

describe("userProfileSchema", () => {
  const validProfile = {
    weightKg: 70,
    heightCm: 175,
    age: 25,
    gender: "MALE",
    activityLevel: "MODERATELY_ACTIVE",
    dietaryPreference: "NON_VEG",
    cuisinePreference: "MIXED",
    allergies: [],
    dailyBudget: 500,
    budgetCurrency: "INR",
    mealsPerDay: 4,
    cookingAbility: "MODERATE",
  };

  it("validates a correct profile", () => {
    const result = userProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it("rejects negative weight", () => {
    const result = userProfileSchema.safeParse({ ...validProfile, weightKg: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects age below 13", () => {
    const result = userProfileSchema.safeParse({ ...validProfile, age: 10 });
    expect(result.success).toBe(false);
  });

  it("rejects age above 120", () => {
    const result = userProfileSchema.safeParse({ ...validProfile, age: 130 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid gender", () => {
    const result = userProfileSchema.safeParse({
      ...validProfile,
      gender: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("rejects meals per day below 3", () => {
    const result = userProfileSchema.safeParse({
      ...validProfile,
      mealsPerDay: 2,
    });
    expect(result.success).toBe(false);
  });

  it("rejects meals per day above 6", () => {
    const result = userProfileSchema.safeParse({
      ...validProfile,
      mealsPerDay: 7,
    });
    expect(result.success).toBe(false);
  });

  it("applies defaults for optional fields", () => {
    const minimal = {
      weightKg: 70,
      heightCm: 175,
      age: 25,
      gender: "MALE",
      activityLevel: "MODERATELY_ACTIVE",
      dailyBudget: 500,
      mealsPerDay: 4,
    };
    const result = userProfileSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dietaryPreference).toBe("NON_VEG");
      expect(result.data.cuisinePreference).toBe("MIXED");
      expect(result.data.cookingAbility).toBe("MODERATE");
      expect(result.data.allergies).toEqual([]);
    }
  });
});

describe("onboardingSchema", () => {
  it("validates correct onboarding data", () => {
    const result = onboardingSchema.safeParse({
      weightKg: 65,
      heightCm: 160,
      age: 30,
      gender: "FEMALE",
      activityLevel: "LIGHTLY_ACTIVE",
      fitnessGoal: "FAT_LOSS",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-integer age", () => {
    const result = onboardingSchema.safeParse({
      weightKg: 65,
      heightCm: 160,
      age: 25.5,
      gender: "FEMALE",
      activityLevel: "LIGHTLY_ACTIVE",
      fitnessGoal: "FAT_LOSS",
    });
    expect(result.success).toBe(false);
  });
});

describe("generationInputSchema", () => {
  const validInput = {
    fitnessGoal: "MUSCLE_GAIN",
    weightKg: 80,
    heightCm: 180,
    age: 28,
    gender: "MALE",
    activityLevel: "VERY_ACTIVE",
    dietaryPreference: "NON_VEG",
    cuisinePreference: "INDIAN",
    allergies: ["peanuts"],
    dailyBudget: 300,
    budgetCurrency: "INR",
    mealsPerDay: 5,
    cookingAbility: "FULL_KITCHEN",
    planType: "WEEKLY",
  };

  it("validates correct generation input", () => {
    const result = generationInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects invalid plan type", () => {
    const result = generationInputSchema.safeParse({
      ...validInput,
      planType: "MONTHLY",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = generationInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateFavoriteSchema", () => {
  it("validates boolean", () => {
    expect(updateFavoriteSchema.safeParse({ isFavorite: true }).success).toBe(
      true
    );
    expect(updateFavoriteSchema.safeParse({ isFavorite: false }).success).toBe(
      true
    );
  });

  it("rejects non-boolean", () => {
    expect(
      updateFavoriteSchema.safeParse({ isFavorite: "yes" }).success
    ).toBe(false);
  });
});

describe("createCheckoutSchema", () => {
  it("validates with price ID", () => {
    expect(
      createCheckoutSchema.safeParse({ priceId: "price_123" }).success
    ).toBe(true);
  });

  it("rejects empty price ID", () => {
    expect(createCheckoutSchema.safeParse({ priceId: "" }).success).toBe(false);
  });
});

describe("paginationSchema", () => {
  it("applies defaults", () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    }
  });

  it("coerces string numbers", () => {
    const result = paginationSchema.safeParse({ page: "3", limit: "20" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects limit above 50", () => {
    const result = paginationSchema.safeParse({ limit: 100 });
    expect(result.success).toBe(false);
  });
});
