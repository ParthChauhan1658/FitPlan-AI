import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";

// GET /api/meal-plans/[id] — Get single meal plan (Req 6.3)
export async function GET(
  _req: Request,
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

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
      include: {
        sharedLink: true,
      },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { success: false, error: "Meal plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mealPlan,
    });
  } catch (error) {
    console.error("Error fetching meal plan:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/meal-plans/[id] — Soft delete meal plan (Req 6.6)
export async function DELETE(
  _req: Request,
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

    const mealPlan = await prisma.mealPlan.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { success: false, error: "Meal plan not found" },
        { status: 404 }
      );
    }

    await prisma.mealPlan.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
