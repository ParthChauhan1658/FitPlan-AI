import { NextResponse } from "next/server";

// POST /api/stripe/create-checkout — Stripe disabled (invite-only in India)
// All users default to PRO tier. Re-enable when Stripe is available.
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Payments coming soon. You already have PRO access.",
    },
    { status: 503 }
  );
}
