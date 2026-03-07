import OpenAI from "openai";
import { MACRO_SPLITS, CALORIES_PER_GRAM, ACTIVITY_MULTIPLIERS, GOAL_CALORIE_ADJUSTMENTS } from "@/constants";
import type { GenerationInput, GenerationOutput } from "@/types";
import { mealPlanResponseSchema } from "@/lib/validations";

// ─── Groq Client (OpenAI-compatible) ─────────────────────────────────────────

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ─── Minimum safe calorie floors (medical guidelines) ────────────────────────
// Below these thresholds, restrictive diets can cause nutrient deficiencies,
// muscle loss, metabolic suppression, and serious health complications.
const MIN_SAFE_CALORIES: Record<string, number> = {
  FEMALE: 1200,
  MALE: 1500,
  OTHER: 1200,
};

// ─── Calculate target nutrition ───────────────────────────────────────────────

export function calculateTargetNutrition(input: GenerationInput) {
  const { gender, weightKg, heightCm, age, activityLevel, fitnessGoal } = input;

  let bmr: number;
  if (gender === "MALE") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else if (gender === "FEMALE") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  } else {
    // "OTHER" — average of male and female formulas
    const maleBmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    const femaleBmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    bmr = (maleBmr + femaleBmr) / 2;
  }

  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];
  const rawTargetCalories = Math.round(tdee * GOAL_CALORIE_ADJUSTMENTS[fitnessGoal]);

  // Apply safety floor — never go below the minimum medically safe threshold
  const minSafe = MIN_SAFE_CALORIES[gender] ?? 1200;
  const targetCalories = Math.max(rawTargetCalories, minSafe);

  const macros = MACRO_SPLITS[fitnessGoal];
  const proteinGrams = Math.round(
    (targetCalories * macros.proteinPercent) / 100 / CALORIES_PER_GRAM.protein
  );
  const carbGrams = Math.round(
    (targetCalories * macros.carbPercent) / 100 / CALORIES_PER_GRAM.carbs
  );
  const fatGrams = Math.round(
    (targetCalories * macros.fatPercent) / 100 / CALORIES_PER_GRAM.fat
  );

  return {
    targetCalories,
    rawTargetCalories,
    proteinGrams,
    carbGrams,
    fatGrams,
    proteinPercent: macros.proteinPercent,
    carbPercent: macros.carbPercent,
    fatPercent: macros.fatPercent,
  };
}

// ─── Build prompt ─────────────────────────────────────────────────────────────

function buildPrompt(
  input: GenerationInput,
  nutrition: ReturnType<typeof calculateTargetNutrition>
): string {
  const days = input.planType === "WEEKLY" ? 7 : 1;

  const allergyNote =
    input.allergies.length > 0
      ? `CRITICAL SAFETY — STRICTLY EXCLUDE these allergens from ALL meals and ingredients: ${input.allergies.join(", ")}. Cross-contamination risk foods must also be avoided. This is a non-negotiable health and safety requirement.`
      : "No specific allergies reported.";

  const cookingNote =
    input.cookingAbility === "MINIMAL"
      ? "Use ONLY no-cook or minimal-cook recipes (microwave, boiling, bread, yogurt, simple assembly). Absolutely no complex cooking or multiple pots required."
      : input.cookingAbility === "MODERATE"
      ? "Use moderate cooking techniques (stir-fry, baking, one-pot meals). Avoid recipes requiring more than 30 minutes or advanced culinary skills."
      : "Full cooking techniques are acceptable including grilling, roasting, multi-step preparations.";

  const safetyNote =
    nutrition.rawTargetCalories < (MIN_SAFE_CALORIES[input.gender] ?? 1200)
      ? `NOTE: The calculated calorie target (${nutrition.rawTargetCalories} kcal) is below the minimum safe threshold. The plan has been adjusted to the minimum safe level of ${nutrition.targetCalories} kcal/day.`
      : "";

  return `You are a professional, certified nutritionist and registered dietitian. Generate a scientifically accurate ${input.planType.toLowerCase()} meal plan (${days} day(s)) that is safe, nutritionally complete, and tailored to the user's profile.

USER PROFILE:
- Goal: ${input.fitnessGoal.replace(/_/g, " ")}
- Dietary preference: ${input.dietaryPreference.replace(/_/g, " ")}
- Cuisine preference: ${input.cuisinePreference}
- Meals per day: ${input.mealsPerDay}
- Budget: ${input.dailyBudget} ${input.budgetCurrency}/day
- Cooking ability: ${input.cookingAbility.replace(/_/g, " ")}
- ${allergyNote}
${safetyNote ? `- ${safetyNote}` : ""}

DAILY NUTRITION TARGETS:
- Calories: ${nutrition.targetCalories} kcal (MINIMUM — do not go below this)
- Protein: ${nutrition.proteinGrams}g (${nutrition.proteinPercent}% of calories)
- Carbohydrates: ${nutrition.carbGrams}g (${nutrition.carbPercent}% of calories)
- Fat: ${nutrition.fatGrams}g (${nutrition.fatPercent}% of calories)

MANDATORY SAFETY RULES:
1. Each day must have EXACTLY ${input.mealsPerDay} meals — no more, no less.
2. Total daily calories MUST be within 5% of ${nutrition.targetCalories} kcal. Never fall below ${Math.round(nutrition.targetCalories * 0.95)} kcal.
3. Total daily cost MUST NOT exceed ${input.dailyBudget} ${input.budgetCurrency}.
4. ${allergyNote}
5. Every day MUST include foods from all major groups: lean protein, complex carbohydrates, healthy fats, and at least one serving of vegetables or fruit.
6. Protein intake must be adequate for the goal (at least ${Math.round(nutrition.proteinGrams * 0.9)}g/day minimum).
7. Meal timing should be spaced appropriately (breakfast, mid-meals, dinner) for metabolic health.
8. For weekly plans: vary meals across days — no identical consecutive days. Ensure nutritional variety.
9. Cooking instructions must be concise, safe, and achievable given the stated cooking ability.
10. All nutritional values (calories, macros per food item) must be accurate based on standard portion sizes.
${input.planType === "WEEKLY" ? "11. The weekly grocery list must aggregate all 7 days' ingredients with total quantities." : ""}

Respond ONLY with valid JSON matching this exact structure:
{
  "dailyPlans": [
    {
      "day": 1,
      "dayName": "Monday",
      "meals": [
        {
          "name": "Breakfast",
          "totalCalories": 450,
          "totalProtein": 35,
          "totalCarbs": 45,
          "totalFat": 12,
          "estimatedCost": 80,
          "foodItems": [
            {
              "name": "Rolled Oats",
              "quantity": "80g",
              "calories": 300,
              "proteinGrams": 10,
              "carbGrams": 54,
              "fatGrams": 5
            }
          ],
          "cookingInstructions": "Cook oats in water for 5 minutes, top with banana slices."
        }
      ],
      "totalCalories": ${nutrition.targetCalories},
      "totalProtein": ${nutrition.proteinGrams},
      "totalCarbs": ${nutrition.carbGrams},
      "totalFat": ${nutrition.fatGrams},
      "totalCost": ${input.dailyBudget}
    }
  ],
  "dailyGroceryList": [
    { "name": "Rolled Oats", "quantity": "80g", "estimatedCost": 12, "category": "Grains" }
  ],
  ${input.planType === "WEEKLY" ? '"weeklyGroceryList": [{ "name": "Rolled Oats", "quantity": "560g", "estimatedCost": 84, "category": "Grains" }],' : ""}
  "totalDailyCost": ${input.dailyBudget}${input.planType === "WEEKLY" ? `,\n  "totalWeeklyCost": ${input.dailyBudget * 7}` : ""}
}

Generate ${days} daily plan(s). Respond with ONLY valid JSON, absolutely no markdown fences or extra text.`;
}

// ─── Generate meal plan ───────────────────────────────────────────────────────

export async function generateMealPlan(
  input: GenerationInput
): Promise<GenerationOutput> {
  const nutrition = calculateTargetNutrition(input);
  const prompt = buildPrompt(input, nutrition);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a professional certified nutritionist and registered dietitian. Your meal plans must be nutritionally complete, medically safe, and strictly follow all allergen exclusions. Always respond with valid JSON only — no markdown, no explanations, no code blocks.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.4, // Lower temperature for consistent, accurate health data
    max_tokens: input.planType === "WEEKLY" ? 12000 : 6000,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response from AI service");
  }

  const parsed = JSON.parse(content);
  const validated = mealPlanResponseSchema.parse(parsed);

  return validated;
}

// ─── Validate allergens in response ──────────────────────────────────────────

export function validateAllergens(
  output: GenerationOutput,
  allergies: string[]
): string[] {
  if (allergies.length === 0) return [];

  const violations: string[] = [];
  const lowerAllergies = allergies.map((a) => a.toLowerCase());

  for (const day of output.dailyPlans) {
    for (const meal of day.meals) {
      for (const item of meal.foodItems) {
        const lowerName = item.name.toLowerCase();
        for (const allergen of lowerAllergies) {
          if (lowerName.includes(allergen)) {
            violations.push(
              `Found "${allergen}" in "${item.name}" (Day ${day.day}, ${meal.name})`
            );
          }
        }
      }
    }
  }

  return violations;
}

// ─── Validate budget compliance ───────────────────────────────────────────────

export function validateBudget(
  output: GenerationOutput,
  dailyBudget: number,
  tolerancePercent: number
): boolean {
  const maxAllowed = dailyBudget * (1 + tolerancePercent / 100);
  return output.totalDailyCost <= maxAllowed;
}
