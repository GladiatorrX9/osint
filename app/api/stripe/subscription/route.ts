import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Get user's Stripe customer ID from database
    // const user = await prisma.user.findUnique({
    //   where: { email: session.user.email! },
    //   select: { stripeCustomerId: true, stripeSubscriptionId: true },
    // });

    // For now, return mock data
    return NextResponse.json({
      subscription: {
        id: "sub_mock",
        status: "active",
        plan: "professional",
        currentPeriodEnd: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Get user's subscription ID from database and cancel it
    // const user = await prisma.user.findUnique({
    //   where: { email: session.user.email! },
    //   select: { stripeSubscriptionId: true },
    // });

    // if (!user?.stripeSubscriptionId) {
    //   return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    // }

    // const subscription = await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    return NextResponse.json({
      success: true,
      message: "Subscription canceled successfully",
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, ...data } = await request.json();

    // TODO: Implement subscription update logic
    // Examples:
    // - Update payment method
    // - Change plan
    // - Update billing interval

    return NextResponse.json({
      success: true,
      message: "Subscription updated successfully",
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
