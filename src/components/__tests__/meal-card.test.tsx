import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MealCard } from "@/components/cards/meal-card";
import type { Meal } from "@/types";

const mockMeal: Meal = {
  name: "Breakfast",
  totalCalories: 500,
  totalProtein: 30,
  totalCarbs: 60,
  totalFat: 15,
  estimatedCost: 150,
  foodItems: [
    {
      name: "Oats",
      quantity: "100g",
      calories: 350,
      proteinGrams: 12,
      carbGrams: 50,
      fatGrams: 8,
    },
    {
      name: "Banana",
      quantity: "1 medium",
      calories: 105,
      proteinGrams: 1,
      carbGrams: 27,
      fatGrams: 0,
    },
  ],
  cookingInstructions: "Mix oats with water and top with banana.",
};

describe("MealCard", () => {
  it("renders meal name and calories", () => {
    render(<MealCard meal={mockMeal} currency="INR" />);
    expect(screen.getByText("Breakfast")).toBeInTheDocument();
    expect(screen.getByText(/500 kcal/)).toBeInTheDocument();
  });

  it("renders food items", () => {
    render(<MealCard meal={mockMeal} currency="INR" />);
    expect(screen.getByText("Oats")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  it("renders cooking instructions", () => {
    render(<MealCard meal={mockMeal} currency="INR" />);
    expect(
      screen.getByText("Mix oats with water and top with banana.")
    ).toBeInTheDocument();
  });

  it("renders cost with currency", () => {
    render(<MealCard meal={mockMeal} currency="INR" />);
    expect(screen.getByText(/INR 150/)).toBeInTheDocument();
  });
});
