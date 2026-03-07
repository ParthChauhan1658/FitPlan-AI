import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserEvent {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string;
  image_url: string | null;
}

type WebhookEvent = {
  type: string;
  data: ClerkUserEvent;
};

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return NextResponse.json(
      { success: false, error: "Server misconfigured" },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { success: false, error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook signature with svix
  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the event
  const eventType = event.type;

  if (eventType === "user.created") {
    const { id, first_name, last_name, email_addresses, primary_email_address_id, image_url } =
      event.data;

    const primaryEmail = email_addresses.find(
      (email) => email.id === primary_email_address_id
    );

    if (!primaryEmail) {
      return NextResponse.json(
        { success: false, error: "No primary email found" },
        { status: 400 }
      );
    }

    try {
      // Create user + free subscription in a transaction (Req 1.1, 1.4)
      await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
        const user = await tx.user.create({
          data: {
            clerkId: id,
            email: primaryEmail.email_address,
            firstName: first_name,
            lastName: last_name,
            imageUrl: image_url,
          },
        });

        // Create PRO subscription for new user (Stripe disabled — all users get PRO)
        await tx.subscription.create({
          data: {
            userId: user.id,
            tier: "PRO",
            status: "ACTIVE",
            generationsUsed: 0,
            generationsLimit: 50,
          },
        });
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error creating user from webhook:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create user" },
        { status: 500 }
      );
    }
  }

  if (eventType === "user.updated") {
    const { id, first_name, last_name, email_addresses, primary_email_address_id, image_url } =
      event.data;

    const primaryEmail = email_addresses.find(
      (email) => email.id === primary_email_address_id
    );

    try {
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          firstName: first_name,
          lastName: last_name,
          email: primaryEmail?.email_address,
          imageUrl: image_url,
        },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error updating user from webhook:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update user" },
        { status: 500 }
      );
    }
  }

  if (eventType === "user.deleted") {
    const { id } = event.data;

    try {
      // Cascade delete handled by Prisma schema relations
      await prisma.user.delete({
        where: { clerkId: id },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting user from webhook:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete user" },
        { status: 500 }
      );
    }
  }

  // Unhandled event type — acknowledge receipt
  return NextResponse.json({ success: true });
}
