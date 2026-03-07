import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PlanChatContext } from "@/context/ChatContext";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

function buildSystemPrompt(
  profile: {
    fitnessGoal: string;
    dietaryPreference: string;
    weightKg: number;
    heightCm: number;
    age: number;
    gender: string;
    activityLevel: string;
    allergies: string[];
    dailyBudget: number;
    budgetCurrency: string;
  } | null,
  planContext: PlanChatContext | null
): string {
  const profileSection = profile
    ? `USER PROFILE:
- Goal: ${profile.fitnessGoal.replace(/_/g, " ")}
- Diet: ${profile.dietaryPreference.replace(/_/g, " ")}
- Age: ${profile.age}, Gender: ${profile.gender}, Weight: ${profile.weightKg}kg, Height: ${profile.heightCm}cm
- Activity: ${profile.activityLevel.replace(/_/g, " ")}
- Allergies: ${profile.allergies.length > 0 ? profile.allergies.join(", ") : "none"}
- Daily budget: ${profile.budgetCurrency} ${profile.dailyBudget}`
    : "User profile not available.";

  const planSection = planContext
    ? `\nCURRENT MEAL PLAN CONTEXT (Plan ID: ${planContext.id}):
- Plan type: ${planContext.planType}
- Fitness goal: ${planContext.fitnessGoal.replace(/_/g, " ")}
- Diet: ${planContext.dietaryPreference.replace(/_/g, " ")}
- Target: ${planContext.targetCalories} kcal/day
- Macros: ${planContext.proteinGrams}g protein, ${planContext.carbGrams}g carbs, ${planContext.fatGrams}g fat
- Budget: ${planContext.budgetCurrency} ${planContext.dailyBudget}/day
- Days in plan: ${planContext.meals.length}
- Meals per day: ${planContext.meals[0]?.meals.length ?? "unknown"}`
    : "\nNo specific meal plan is currently open.";

  return `You are a certified nutritionist and personal diet coach for FitPlan AI. You have deep expertise in sports nutrition, weight management, dietary planning, and cooking.

${profileSection}
${planSection}

INSTRUCTIONS:
- Give practical, actionable, personalised advice based on the user's profile and meal plan
- Keep responses concise but complete — use bullet points and short paragraphs
- When suggesting swaps or modifications, be specific (exact foods, quantities, calories)
- Always respect the user's dietary preferences and allergies
- Never give medical diagnoses — recommend consulting a doctor for medical concerns
- If the user asks about their plan, reference the context above
- Format numbers clearly (e.g., "450 kcal", "35g protein")
- Be warm, encouraging, and professional`;
}

// POST /api/chat-nutritionist — Streaming AI nutritionist chat
export async function POST(req: Request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { messages, planContext } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      planContext: PlanChatContext | null;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Fetch user profile for context
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    const systemPrompt = buildSystemPrompt(profile, planContext ?? null);

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-20), // Keep last 20 messages to stay within context limits
      ],
      temperature: 0.7,
      max_tokens: 800,
      stream: true,
    });

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Chat nutritionist error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
