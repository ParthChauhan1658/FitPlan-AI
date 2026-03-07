import { describe, it, expect, vi } from "vitest";

// Mock OpenAI before importing the module that uses it
vi.mock("openai", () => ({
  default: class MockOpenAI {
    constructor() {}
    chat = { completions: { create: vi.fn() } };
  },
}));

import { calculateTargetNutrition } from "@/lib/openai";
import type { GenerationInput } from "@/types";

const baseInput: GenerationInput = {
  fitnessGoal: "MAINTENANCE",
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
  planType: "DAILY",
};

describe("calculateTargetNutrition", () => {
  it("returns correct TDEE for a moderately active male", () => {
    const result = calculateTargetNutrition(baseInput);
    // BMR = 10 * 70 + 6.25 * 175 - 5 * 25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
    // TDEE = 1673.75 * 1.55 = 2594.3125
    // Maintenance multiplier = 1.0 → 2594 kcal
    expect(result.targetCalories).toBe(2594);
  });

  it("applies fat loss calorie adjustment", () => {
    const result = calculateTargetNutrition({
      ...baseInput,
      fitnessGoal: "FAT_LOSS",
    });
    // TDEE * 0.8 = 2594.3125 * 0.8 ≈ 2075
    expect(result.targetCalories).toBe(2075);
  });

  it("applies muscle gain calorie adjustment", () => {
    const result = calculateTargetNutrition({
      ...baseInput,
      fitnessGoal: "MUSCLE_GAIN",
    });
    // TDEE * 1.15 = 2594.3125 * 1.15 ≈ 2983
    expect(result.targetCalories).toBe(2983);
  });

  it("uses different BMR for females", () => {
    const result = calculateTargetNutrition({
      ...baseInput,
      gender: "FEMALE",
    });
    // BMR_female = 10 * 70 + 6.25 * 175 - 5 * 25 - 161 = 700 + 1093.75 - 125 - 161 = 1507.75
    // TDEE = 1507.75 * 1.55 = 2337.0125 → 2337
    expect(result.targetCalories).toBe(2337);
  });

  it("uses averaged BMR for OTHER gender", () => {
    const result = calculateTargetNutrition({
      ...baseInput,
      gender: "OTHER",
    });
    // male BMR = 1673.75, female BMR = 1507.75
    // avg = 1590.75 → TDEE = 1590.75 * 1.55 = 2465.6625 → 2466
    expect(result.targetCalories).toBe(2466);
  });

  it("applies correct activity multiplier", () => {
    const sedentary = calculateTargetNutrition({
      ...baseInput,
      activityLevel: "SEDENTARY",
    });
    const veryActive = calculateTargetNutrition({
      ...baseInput,
      activityLevel: "VERY_ACTIVE",
    });
    // Sedentary should be significantly less than very active
    expect(sedentary.targetCalories).toBeLessThan(veryActive.targetCalories);
  });

  it("returns correct macro splits for fat loss", () => {
    const result = calculateTargetNutrition({
      ...baseInput,
      fitnessGoal: "FAT_LOSS",
    });
    // Fat loss: protein 40%, carbs 30%, fat 30%
    expect(result.proteinPercent).toBe(40);
    expect(result.carbPercent).toBe(30);
    expect(result.fatPercent).toBe(30);
  });

  it("returns correct macro splits for muscle gain", () => {
    const result = calculateTargetNutrition({
      ...baseInput,
      fitnessGoal: "MUSCLE_GAIN",
    });
    expect(result.proteinPercent).toBe(35);
    expect(result.carbPercent).toBe(40);
    expect(result.fatPercent).toBe(25);
  });

  it("calculates macro grams correctly", () => {
    const result = calculateTargetNutrition(baseInput);
    // Maintenance: protein 30%, carbs 40%, fat 30%
    // protein grams = round(targetCal * 0.30 / 4) 
    // carb grams = round(targetCal * 0.40 / 4)
    // fat grams = round(targetCal * 0.30 / 9)
    const expectedProtein = Math.round((result.targetCalories * 30) / 100 / 4);
    const expectedCarbs = Math.round((result.targetCalories * 40) / 100 / 4);
    const expectedFat = Math.round((result.targetCalories * 30) / 100 / 9);

    expect(result.proteinGrams).toBe(expectedProtein);
    expect(result.carbGrams).toBe(expectedCarbs);
    expect(result.fatGrams).toBe(expectedFat);
  });
});
