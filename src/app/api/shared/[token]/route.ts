import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { APIResponse, DailyPlan, GroceryItem } from "@/types";

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const link = await prisma.sharedLink.findUnique({
      where: { token: params.token },
    });

    if (!link || !link.isActive) {
      return NextResponse.json<APIResponse<never>>(
        { success: false, error: "Shared link not found or inactive" },
        { status: 404 }
      );
    }

    if (link.expiresAt && new Date() > link.expiresAt) {
      return NextResponse.json<APIResponse<never>>(
        { success: false, error: "Shared link has expired" },
        { status: 410 }
      );
    }

    // Increment view count
    await prisma.sharedLink.update({
      where: { id: link.id },
      data: { viewCount: { increment: 1 } },
    });

    const mealPlan = await prisma.mealPlan.findFirst({
      where: { id: link.mealPlanId, deletedAt: null },
    });

    if (!mealPlan) {
      return NextResponse.json<APIResponse<never>>(
        { success: false, error: "Meal plan not found" },
        { status: 404 }
      );
    }

    const meals = mealPlan.meals as unknown as DailyPlan[];
    const groceryList = mealPlan.groceryList as unknown as GroceryItem[];

    return NextResponse.json<
      APIResponse<{
        planType: string;
        targetCalories: number;
        fitnessGoal: string;
        dietaryPreference: string;
        proteinGrams: number;
        carbGrams: number;
        fatGrams: number;
        totalDailyCost: number;
        budgetCurrency: string;
        meals: DailyPlan[];
        groceryList: GroceryItem[];
        createdAt: Date;
      }>
    >({
      success: true,
      data: {
        planType: mealPlan.planType,
        targetCalories: mealPlan.targetCalories,
        fitnessGoal: mealPlan.fitnessGoal,
        dietaryPreference: mealPlan.dietaryPreference,
        proteinGrams: mealPlan.proteinGrams,
        carbGrams: mealPlan.carbGrams,
        fatGrams: mealPlan.fatGrams,
        totalDailyCost: mealPlan.totalDailyCost,
        budgetCurrency: mealPlan.budgetCurrency,
        meals,
        groceryList,
        createdAt: mealPlan.createdAt,
      },
    });
  } catch (error) {
    console.error("Shared link GET error:", error);
    return NextResponse.json<APIResponse<never>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
