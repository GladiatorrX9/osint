import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/subscription - Get current subscription for user's organization
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { subscription: null, message: "No organization found for user" },
        { status: 200 }
      );
    }

    // Get subscription for the organization

    const subscription = await prisma.subscription.findUnique({
      where: { organizationId: user.organizationId },
    });

    if (!subscription) {
      return NextResponse.json(
        {
          subscription: null,
          message: "No subscription found for organization",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// POST /api/subscription - Create or update subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan, interval } = body;

    if (!plan || !interval) {
      return NextResponse.json(
        { error: "Plan and interval are required" },
        { status: 400 }
      );
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: "No organization found for user" },
        { status: 404 }
      );
    }

    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
      where: { organizationId: user.organizationId },
      create: {
        organizationId: user.organizationId,
        plan,
        interval,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(
          Date.now() + (interval === "YEARLY" ? 365 : 30) * 24 * 60 * 60 * 1000
        ),
      },
      update: {
        plan,
        interval,
        currentPeriodEnd: new Date(
          Date.now() + (interval === "YEARLY" ? 365 : 30) * 24 * 60 * 60 * 1000
        ),
      },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Error creating/updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create/update subscription" },
      { status: 500 }
    );
  }
}
