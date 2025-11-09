import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { stripe, getStripePriceId } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, interval } = await request.json();

    // Validate input
    if (!plan || !interval) {
      return NextResponse.json(
        { error: "Plan and interval are required" },
        { status: 400 }
      );
    }

    // Convert to proper format
    const planUpper = plan.toUpperCase() as
      | "STARTER"
      | "PROFESSIONAL"
      | "ENTERPRISE";
    const intervalUpper = interval.toUpperCase() as "MONTHLY" | "YEARLY";

    // Get user and organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organization: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: "No organization found for user" },
        { status: 404 }
      );
    }

    // Get Stripe price ID
    let priceId: string;
    try {
      priceId = getStripePriceId(planUpper, intervalUpper);
    } catch (error) {
      console.error("Error getting price ID:", error);
      return NextResponse.json(
        { error: "Invalid plan or interval" },
        { status: 400 }
      );
    }

    // Check if organization already has a Stripe customer ID
    let customerId = user.organization?.subscription?.stripeCustomerId;

    // If not, create a new Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: user.name,
        metadata: {
          userId: user.id,
          organizationId: user.organizationId,
        },
      });
      customerId = customer.id;
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        organizationId: user.organizationId,
        plan: planUpper,
        interval: intervalUpper,
      },
      subscription_data: {
        metadata: {
          organizationId: user.organizationId,
          plan: planUpper,
          interval: intervalUpper,
        },
      },
      success_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/dashboard/subscription?success=true`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/dashboard/subscription?canceled=true`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
