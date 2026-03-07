import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { SUBSCRIPTION_LIMITS } from "@/constants";

/**
 * Get the authenticated user from the database, creating them if they don't exist.
 * This handles the case where the Clerk webhook didn't fire (e.g. local dev without tunnel).
 */
export async function getOrCreateUser() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return null;
  }

  // Try to find existing user
  const existingUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (existingUser) {
    return existingUser;
  }

  // User exists in Clerk but not in DB — auto-create
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    return null;
  }

  // Create user + PRO subscription in a transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        clerkId,
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      },
    });

    await tx.subscription.create({
      data: {
        userId: newUser.id,
        tier: "PRO",
        status: "ACTIVE",
        generationsUsed: 0,
        generationsLimit: SUBSCRIPTION_LIMITS.PRO,
      },
    });

    return newUser;
  });

  return user;
}
