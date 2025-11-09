import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/subscription/invoices - Get all invoices for user's organization
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
        { invoices: [], message: "No organization found for user" },
        { status: 200 }
      );
    }

    // Get subscription for the organization
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId: user.organizationId },
      include: {
        invoices: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { invoices: [], message: "No subscription found for organization" },
        { status: 200 }
      );
    }

    return NextResponse.json({ invoices: subscription.invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
