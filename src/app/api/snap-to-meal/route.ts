import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getOrCreateUser } from "@/lib/auth";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// llama-3.2-11b-vision-preview is Groq's vision model
const VISION_MODEL =
  process.env.GROQ_VISION_MODEL ?? "llama-3.2-11b-vision-preview";

export interface SnapResult {
  detectedFoods: Array<{
    name: string;
    estimatedQuantity: string;
    calories: number;
    proteinGrams: number;
    carbGrams: number;
    fatGrams: number;
    confidence: "high" | "medium" | "low";
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  portionNote: string;
  comparisonNote: string;
}

// POST /api/snap-to-meal — Identify food from an image and compare to plan
export async function POST(req: Request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      imageBase64,
      mimeType = "image/jpeg",
      plannedMeal,
    } = body as {
      imageBase64: string;
      mimeType?: string;
      plannedMeal?: { name: string; totalCalories: number; totalProtein: number };
    };

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Validate base64 size (max ~5 MB decoded = ~6.8 MB base64)
    if (imageBase64.length > 7_000_000) {
      return NextResponse.json(
        { error: "Image too large. Use a photo under 5 MB." },
        { status: 413 }
      );
    }

    const contextLine = plannedMeal
      ? `CONTEXT: The user planned to eat "${plannedMeal.name}" (${plannedMeal.totalCalories} kcal, ${plannedMeal.totalProtein}g protein).`
      : "No specific meal was planned for comparison.";

    const prompt = `Analyze this food image carefully. Identify all visible food items, estimate realistic portions based on standard serving sizes, and calculate nutritional values.

${contextLine}

Be conservative with portion estimates — it is better to slightly underestimate than overestimate.

Respond ONLY with valid JSON:
{
  "detectedFoods": [
    {
      "name": "Food item name",
      "estimatedQuantity": "150g",
      "calories": 250,
      "proteinGrams": 20,
      "carbGrams": 25,
      "fatGrams": 8,
      "confidence": "high"
    }
  ],
  "totalCalories": 450,
  "totalProtein": 35,
  "totalCarbs": 45,
  "totalFat": 12,
  "portionNote": "Portions estimated from visual cues. Actual values may vary by ±15%.",
  "comparisonNote": "Brief 1-sentence comparison to the planned meal (e.g., 'Your actual meal is 50 kcal above your planned lunch.')."
}`;

    const completion = await groq.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
            { type: "text", text: prompt },
          ] as never,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from vision AI");

    const result = JSON.parse(content) as SnapResult;
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Snap-to-meal error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
