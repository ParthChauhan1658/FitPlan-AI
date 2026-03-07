import { NextResponse } from "next/server";

// POST /api/stripe/webhook — Stripe disabled (invite-only in India)
// Re-enable when Stripe is available.
export async function POST() {
  return NextResponse.json(
    { success: false, error: "Stripe webhooks disabled" },
    { status: 503 }
  );
}
