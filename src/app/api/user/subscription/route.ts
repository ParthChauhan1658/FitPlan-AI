import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";

// GET /api/user/subscription — Fetch user subscription data
export async function GET() {
  try {
    const baseUser = await getOrCreateUser();

    if (!baseUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: baseUser.id },
      include: { subscription: true },
    });

    if (!user || !user.subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.subscription.id,
        tier: user.subscription.tier,
        status: user.subscription.status,
        generationsUsed: user.subscription.generationsUsed,
        generationsLimit: user.subscription.generationsLimit,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
        stripeSubscriptionId: user.subscription.stripeSubscriptionId,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
