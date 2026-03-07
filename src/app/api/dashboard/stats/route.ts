import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import type { APIResponse, DashboardStats } from "@/types";
import { RECENT_PLANS_COUNT } from "@/constants";

export async function GET() {
  try {
    const baseUser = await getOrCreateUser();
    if (!baseUser) {
      return NextResponse.json<APIResponse<never>>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: baseUser.id },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json<APIResponse<never>>(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const subscription = user.subscription;

    const recentPlans = await prisma.mealPlan.findMany({
      where: { userId: user.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: RECENT_PLANS_COUNT,
      select: {
        id: true,
        planType: true,
        targetCalories: true,
        fitnessGoal: true,
        dietaryPreference: true,
        isFavorite: true,
        createdAt: true,
      },
    });

    const stats: DashboardStats = {
      tier: (subscription?.tier ?? "FREE") as DashboardStats["tier"],
      generationsUsed: subscription?.generationsUsed ?? 0,
      generationsLimit: subscription?.generationsLimit ?? 3,
      nextBillingDate: subscription?.currentPeriodEnd ?? null,
      recentPlans: recentPlans.map((p: typeof recentPlans[number]) => ({
        id: p.id,
        planType: p.planType as DashboardStats["recentPlans"][number]["planType"],
        targetCalories: p.targetCalories,
        fitnessGoal: p.fitnessGoal as DashboardStats["recentPlans"][number]["fitnessGoal"],
        dietaryPreference: p.dietaryPreference as DashboardStats["recentPlans"][number]["dietaryPreference"],
        isFavorite: p.isFavorite,
        createdAt: p.createdAt,
      })),
    };

    return NextResponse.json<APIResponse<DashboardStats>>({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json<APIResponse<never>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
