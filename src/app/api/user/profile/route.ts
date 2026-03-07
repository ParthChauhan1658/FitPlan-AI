import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { onboardingSchema, userProfileSchema } from "@/lib/validations";
import { ACTIVITY_MULTIPLIERS, GOAL_CALORIE_ADJUSTMENTS } from "@/constants";
import { z } from "zod";

// GET /api/user/profile — Fetch user profile (Req 1.3)
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
      include: {
        profile: true,
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        hasProfile: !!user.profile,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/user/profile — Create/update user profile (Req 2.1-2.4)
export async function POST(req: Request) {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = onboardingSchema.parse(body);

    // Calculate TDEE using Mifflin-St Jeor (Req 2.2)
    const { gender, age, heightCm, weightKg, activityLevel, fitnessGoal } =
      validated;

    let bmr: number;
    if (gender === "MALE") {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }

    const activityMultiplier =
      ACTIVITY_MULTIPLIERS[activityLevel as keyof typeof ACTIVITY_MULTIPLIERS];
    const tdee = Math.round(bmr * activityMultiplier);

    // Apply goal adjustment (Req 2.3)
    const goalMultiplier =
      GOAL_CALORIE_ADJUSTMENTS[
        fitnessGoal as keyof typeof GOAL_CALORIE_ADJUSTMENTS
      ];
    const dailyCalories = Math.round(tdee * goalMultiplier);

    // Upsert profile
    const profileData = {
      weightKg: validated.weightKg,
      heightCm: validated.heightCm,
      age: validated.age,
      gender: validated.gender,
      activityLevel: validated.activityLevel,
      fitnessGoal: validated.fitnessGoal,
      dietaryPreference: validated.dietaryPreference ?? "NON_VEG",
      allergies: validated.allergies
        ? validated.allergies.split(",").map((a: string) => a.trim()).filter(Boolean)
        : [],
      tdee,
      dailyCalories,
    };

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        userId: user.id,
        ...profileData,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        profile,
        tdee,
        dailyCalories,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating/updating profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile — Full profile update (settings page) (Req 10.3)
export async function PUT(req: Request) {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = userProfileSchema.parse(body);

    // Calculate TDEE using Mifflin-St Jeor (Req 2.2)
    const { gender, age, heightCm, weightKg, activityLevel } = validated;

    let bmr: number;
    if (gender === "MALE") {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }

    const activityMultiplier =
      ACTIVITY_MULTIPLIERS[activityLevel as keyof typeof ACTIVITY_MULTIPLIERS];
    const tdee = Math.round(bmr * activityMultiplier);

    // Use maintenance for daily calories from profile update
    // (generation form has its own goal selection)
    const dailyCalories = tdee;

    const profile = await prisma.userProfile.update({
      where: { userId: user.id },
      data: {
        ...validated,
        tdee,
        dailyCalories,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        profile,
        tdee,
        dailyCalories,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
