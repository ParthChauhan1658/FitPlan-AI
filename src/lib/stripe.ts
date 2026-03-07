import { prisma } from "@/lib/prisma";
import { SUBSCRIPTION_LIMITS } from "@/constants";

// ─── Subscription Helpers (Stripe disabled — all users default to PRO) ────────

// ─── Helper: Check if user can generate (Req 5.1–5.3) ────────────────────────

export async function canGenerate(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  tier: string;
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return { allowed: false, used: 0, limit: 0, tier: "FREE" };
  }

  const tier = subscription.tier;
  const limit = SUBSCRIPTION_LIMITS[tier];
  const used = subscription.generationsUsed;

  if (tier === "ULTIMATE" || tier === "PRO") {
    return { allowed: used < limit, used, limit, tier };
  }

  return {
    allowed: used < limit,
    used,
    limit,
    tier,
  };
}

// ─── Helper: Increment usage count (Req 5.1) ─────────────────────────────────

export async function incrementUsage(userId: string): Promise<void> {
  await prisma.subscription.update({
    where: { userId },
    data: {
      generationsUsed: { increment: 1 },
    },
  });
}
