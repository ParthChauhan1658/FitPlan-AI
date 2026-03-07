import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import type { DailyPlan, Meal } from "@/types";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// POST /api/meal-plans/[id]/swap-meal — Regenerate a single meal
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { dayIndex, mealIndex } = body as { dayIndex: number; mealIndex: number };

    if (
      typeof dayIndex !== "number" ||
      typeof mealIndex !== "number" ||
      dayIndex < 0 ||
      mealIndex < 0
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid dayIndex or mealIndex" },
        { status: 400 }
      );
    }

    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id, userId: user.id, deletedAt: null },
    });

    if (!mealPlan) {
      return NextResponse.json({ success: false, error: "Meal plan not found" }, { status: 404 });
    }

    const dailyPlans = mealPlan.meals as unknown as DailyPlan[];
    const targetDay = dailyPlans[dayIndex];
    const targetMeal = targetDay?.meals[mealIndex] as Meal | undefined;

    if (!targetMeal) {
      return NextResponse.json({ success: false, error: "Meal not found" }, { status: 404 });
    }

    const allergyNote =
      mealPlan.allergies.length > 0
        ? `STRICTLY AVOID these allergens: ${mealPlan.allergies.join(", ")}`
        : "No specific allergies";

    const prompt = `You are a professional certified nutritionist. Generate a DIFFERENT replacement meal for "${targetMeal.name}" (${targetDay.dayName}).

REQUIREMENTS:
- Dietary preference: ${mealPlan.dietaryPreference.replace(/_/g, " ")}
- Cuisine: ${mealPlan.cuisinePreference.replace(/_/g, " ")}
- Cooking ability: ${mealPlan.cookingAbility.replace(/_/g, " ")}
- Budget: approx ${mealPlan.budgetCurrency} ${targetMeal.estimatedCost}
- Calories: approximately ${targetMeal.totalCalories} kcal (within ±10%)
- Protein: approximately ${targetMeal.totalProtein}g
- Carbs: approximately ${targetMeal.totalCarbs}g
- Fat: approximately ${targetMeal.totalFat}g
- ${allergyNote}
- Must be DIFFERENT from "${targetMeal.name}" — use different main ingredients

Respond ONLY with valid JSON:
{
  "name": "Replacement Meal Name",
  "totalCalories": ${targetMeal.totalCalories},
  "totalProtein": ${targetMeal.totalProtein},
  "totalCarbs": ${targetMeal.totalCarbs},
  "totalFat": ${targetMeal.totalFat},
  "estimatedCost": ${targetMeal.estimatedCost},
  "foodItems": [
    {
      "name": "Food Item",
      "quantity": "100g",
      "calories": 200,
      "proteinGrams": 15,
      "carbGrams": 20,
      "fatGrams": 5
    }
  ],
  "cookingInstructions": "Brief step-by-step instructions."
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a professional certified nutritionist. Respond with valid JSON only — no markdown, no explanations.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    const newMeal = JSON.parse(content) as Meal;

    // Patch the specific meal in the JSONB array
    const updatedPlans = dailyPlans.map((day, dIdx) => {
      if (dIdx !== dayIndex) return day;
      return {
        ...day,
        meals: day.meals.map((meal, mIdx) =>
          mIdx === mealIndex ? newMeal : meal
        ),
      };
    });

    await prisma.mealPlan.update({
      where: { id },
      data: { meals: updatedPlans as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({ success: true, data: { meal: newMeal } });
  } catch (error) {
    console.error("Swap meal error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to swap meal" },
      { status: 500 }
    );
  }
}
