import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { paginationSchema } from "@/lib/validations";

// GET /api/meal-plans — List user's meal plans (paginated) (Req 6.2)
export async function GET(req: Request) {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const { page, limit, favorites } = paginationSchema.parse({
      page: searchParams.get("page") ?? "1",
      limit: searchParams.get("limit") ?? "10",
      favorites: searchParams.get("favorites") ?? undefined,
    });

    const skip = (page - 1) * limit;

    const where = {
      userId: user.id,
      deletedAt: null,
      ...(favorites ? { isFavorite: true } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.mealPlan.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          planType: true,
          targetCalories: true,
          fitnessGoal: true,
          dietaryPreference: true,
          isFavorite: true,
          createdAt: true,
          totalDailyCost: true,
          budgetCurrency: true,
        },
      }),
      prisma.mealPlan.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error listing meal plans:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
