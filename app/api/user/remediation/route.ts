import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET - Fetch remediation actions for the user's organization
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organization: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const skip = (page - 1) * limit;

    // Build where clause - show actions for user's org OR actions for all orgs
    const where: any = {
      OR: [
        { organizationId: user.organizationId }, // Actions for this organization
        { organizationId: null }, // Actions for all organizations
      ],
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (priority && priority !== "all") {
      where.priority = priority;
    }

    console.log(
      `📋 User: ${user.email}, Org: ${user.organizationId}, Query:`,
      where
    );

    const [actions, total] = await Promise.all([
      prisma.remediationAction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.remediationAction.count({ where }),
    ]);

    console.log(`✅ Found ${total} actions for user ${user.email}`);

    return NextResponse.json({
      actions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching remediation actions:", error);
    return NextResponse.json(
      { error: "Failed to fetch remediation actions" },
      { status: 500 }
    );
  }
}

// PATCH - Update remediation action status (users can only update status/notes)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Remediation action ID is required" },
        { status: 400 }
      );
    }

    // Verify the action exists and belongs to user's organization or is for all orgs
    const existingAction = await prisma.remediationAction.findUnique({
      where: { id },
    });

    if (!existingAction) {
      return NextResponse.json(
        { error: "Remediation action not found" },
        { status: 404 }
      );
    }

    // Check if action is for user's org or for all orgs
    if (
      existingAction.organizationId !== null &&
      existingAction.organizationId !== user.organizationId
    ) {
      return NextResponse.json(
        { error: "You can only update actions for your organization" },
        { status: 403 }
      );
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status === "COMPLETED") {
        updateData.completedAt = new Date();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const action = await prisma.remediationAction.update({
      where: { id },
      data: updateData,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(action);
  } catch (error) {
    console.error("Error updating remediation action:", error);
    return NextResponse.json(
      { error: "Failed to update remediation action" },
      { status: 500 }
    );
  }
}
