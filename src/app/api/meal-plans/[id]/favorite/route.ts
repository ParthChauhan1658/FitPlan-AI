import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { updateFavoriteSchema } from "@/lib/validations";
import { z } from "zod";

// PATCH /api/meal-plans/[id]/favorite — Toggle favorite (Req 6.4)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { isFavorite } = updateFavoriteSchema.parse(body);

    const mealPlan = await prisma.mealPlan.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { success: false, error: "Meal plan not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.mealPlan.update({
      where: { id },
      data: { isFavorite },
    });

    return NextResponse.json({
      success: true,
      data: { isFavorite: updated.isFavorite },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
