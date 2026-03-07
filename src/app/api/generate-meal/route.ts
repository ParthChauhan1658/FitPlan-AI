import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { generationInputSchema } from "@/lib/validations";
import {
  generateMealPlan,
  calculateTargetNutrition,
  validateAllergens,
  validateBudget,
} from "@/lib/openai";
import { canGenerate, incrementUsage } from "@/lib/stripe";
import { BUDGET_TOLERANCE_PERCENT } from "@/constants";

// ─── In-memory sliding-window rate limiter (per IP, 3 req / 60 s) ────────────
const rateLimitStore = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 3;

function checkRateLimit(ip: string): { allowed: boolean; resetIn: number } {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;
  const hits = (rateLimitStore.get(ip) ?? []).filter((t) => t > windowStart);
  if (hits.length >= RATE_MAX) {
    const resetIn = Math.ceil((hits[0] + RATE_WINDOW_MS - now) / 1000);
    return { allowed: false, resetIn };
  }
  hits.push(now);
  rateLimitStore.set(ip, hits);
  return { allowed: true, resetIn: 0 };
}

// POST /api/generate-meal — Generate AI meal plan (Req 4.1–4.10)
export async function POST(req: Request) {
  try {
    // Rate-limit check before any auth/DB work
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many requests. Try again in ${rateCheck.resetIn}s.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetIn) } }
      );
    }

    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Req 5.1–5.4: Check usage limits
    const usage = await canGenerate(user.id);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Generation limit reached",
          data: {
            used: usage.used,
            limit: usage.limit,
            tier: usage.tier,
          },
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const input = generationInputSchema.parse(body);

    const nutrition = calculateTargetNutrition(input);

    // Req 4.1: Generate with retry logic (Req 4.5)
    let output;
    let retryCount = 0;
    const maxRetries = 1;

    while (retryCount <= maxRetries) {
      try {
        output = await generateMealPlan(input);
        break;
      } catch (parseError) {
        if (retryCount < maxRetries) {
          retryCount++;
          console.warn(
            `AI response parse failed, retrying (${retryCount}/${maxRetries})...`
          );
          continue;
        }
        throw parseError;
      }
    }

    if (!output) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate meal plan after retries",
        },
        { status: 500 }
      );
    }

    // Req 4.9: Validate allergens
    const allergenViolations = validateAllergens(output, input.allergies);
    if (allergenViolations.length > 0) {
      console.warn("Allergen violations detected:", allergenViolations);
      // Retry once with the same prompt
      try {
        output = await generateMealPlan(input);
        const secondCheck = validateAllergens(output, input.allergies);
        if (secondCheck.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Generated plan contains allergens. Please try again.",
              data: { violations: secondCheck },
            },
            { status: 422 }
          );
        }
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to generate allergen-free meal plan",
          },
          { status: 500 }
        );
      }
    }

    // Req 4.10: Validate budget
    if (!validateBudget(output, input.dailyBudget, BUDGET_TOLERANCE_PERCENT)) {
      console.warn(
        `Budget exceeded: ${output.totalDailyCost} > ${input.dailyBudget} + ${BUDGET_TOLERANCE_PERCENT}%`
      );
    }

    // Save meal plan to database (Req 6.1)
    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId: user.id,
        planType: input.planType,
        targetCalories: nutrition.targetCalories,
        fitnessGoal: input.fitnessGoal,
        dietaryPreference: input.dietaryPreference,
        cuisinePreference: input.cuisinePreference,
        cookingAbility: input.cookingAbility,
        allergies: input.allergies,
        mealsPerDay: input.mealsPerDay,
        dailyBudget: input.dailyBudget,
        budgetCurrency: input.budgetCurrency,
        proteinGrams: nutrition.proteinGrams,
        carbGrams: nutrition.carbGrams,
        fatGrams: nutrition.fatGrams,
        proteinPercent: nutrition.proteinPercent,
        carbPercent: nutrition.carbPercent,
        fatPercent: nutrition.fatPercent,
        meals: output.dailyPlans as unknown as Prisma.InputJsonValue,
        groceryList: output.dailyGroceryList as unknown as Prisma.InputJsonValue,
        totalDailyCost: output.totalDailyCost,
        totalWeeklyCost: output.totalWeeklyCost ?? null,
      },
    });

    // Req 5.1: Increment usage only on success
    await incrementUsage(user.id);

    return NextResponse.json({
      success: true,
      data: {
        mealPlan,
        nutrition,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Meal plan generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate meal plan" },
      { status: 500 }
    );
  }
}
