import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import type { APIResponse } from "@/types";

// POST — create a share link for a meal plan
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json<APIResponse<never>>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const mealPlan = await prisma.mealPlan.findFirst({
      where: { id: params.id, userId: user.id, deletedAt: null },
    });

    if (!mealPlan) {
      return NextResponse.json<APIResponse<never>>(
        { success: false, error: "Meal plan not found" },
        { status: 404 }
      );
    }

    // Check if existing link
    const existing = await prisma.sharedLink.findFirst({
      where: { mealPlanId: mealPlan.id, isActive: true },
    });

    if (existing) {
      return NextResponse.json<APIResponse<{ token: string; url: string }>>({
        success: true,
        data: {
          token: existing.token,
          url: `/shared/${existing.token}`,
        },
      });
    }

    const token = randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const link = await prisma.sharedLink.create({
      data: {
        mealPlanId: mealPlan.id,
        token,
        expiresAt,
        isActive: true,
      },
    });

    return NextResponse.json<APIResponse<{ token: string; url: string }>>({
      success: true,
      data: {
        token: link.token,
        url: `/shared/${link.token}`,
      },
    });
  } catch (error) {
    console.error("Share link creation error:", error);
    return NextResponse.json<APIResponse<never>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE — revoke a share link for a meal plan
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json<APIResponse<never>>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const mealPlan = await prisma.mealPlan.findFirst({
      where: { id: params.id, userId: user.id, deletedAt: null },
    });

    if (!mealPlan) {
      return NextResponse.json<APIResponse<never>>(
        { success: false, error: "Meal plan not found" },
        { status: 404 }
      );
    }

    await prisma.sharedLink.updateMany({
      where: { mealPlanId: mealPlan.id, isActive: true },
      data: { isActive: false },
    });

    return NextResponse.json<APIResponse<{ revoked: boolean }>>({
      success: true,
      data: { revoked: true },
    });
  } catch (error) {
    console.error("Share link revoke error:", error);
    return NextResponse.json<APIResponse<never>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
