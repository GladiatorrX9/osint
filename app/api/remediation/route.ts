import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET - Fetch remediation actions (Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.email !== "admin@gladiatorrx.com") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const actionType = searchParams.get("actionType");

    const skip = (page - 1) * limit;

    // Build where clause (admin can see all remediation actions)
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (actionType) {
      where.actionType = actionType;
    }

    const [actions, total] = await Promise.all([
      prisma.remediationAction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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

// POST - Create a new remediation action (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.email !== "admin@gladiatorrx.com") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      leakId,
      organizationId, // Can be null for "All Organizations" or specific org ID
      affectedEmail,
      affectedDomain,
      actionType,
      priority,
      description,
      steps,
      assignedTo,
    } = body;

    if (!actionType || !description) {
      return NextResponse.json(
        { error: "actionType and description are required" },
        { status: 400 }
      );
    }

    // If organizationId is provided, verify it exists
    if (organizationId) {
      const orgExists = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!orgExists) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        );
      }
    }

    const action = await prisma.remediationAction.create({
      data: {
        userId: user.id,
        organizationId: organizationId || null, // null means "All Organizations"
        leakId,
        affectedEmail,
        affectedDomain,
        actionType,
        status: "PENDING",
        priority: priority || "MEDIUM",
        description,
        steps: steps ? JSON.stringify(steps) : null,
        assignedTo,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(action, { status: 201 });
  } catch (error) {
    console.error("Error creating remediation action:", error);
    return NextResponse.json(
      { error: "Failed to create remediation action" },
      { status: 500 }
    );
  }
}

// PATCH - Update a remediation action (Admin only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.email !== "admin@gladiatorrx.com") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { 
      id, 
      status, 
      priority, 
      notes, 
      steps, 
      assignedTo,
      organizationId,
      affectedEmail,
      affectedDomain,
      actionType,
      description,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Remediation action ID is required" },
        { status: 400 }
      );
    }

    // Verify the action exists (admin can update any action)
    const existingAction = await prisma.remediationAction.findUnique({
      where: { id },
    });

    if (!existingAction) {
      return NextResponse.json(
        { error: "Remediation action not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Allow updating all fields for admin
    if (organizationId !== undefined) {
      updateData.organizationId = organizationId;
    }
    if (affectedEmail !== undefined) {
      updateData.affectedEmail = affectedEmail;
    }
    if (affectedDomain !== undefined) {
      updateData.affectedDomain = affectedDomain;
    }
    if (actionType) {
      updateData.actionType = actionType;
    }
    if (description) {
      updateData.description = description;
    }
    if (status) {
      updateData.status = status;
      if (status === "COMPLETED") {
        updateData.completedAt = new Date();
      }
    }
    if (priority) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes;
    if (steps)
      updateData.steps =
        typeof steps === "string" ? steps : JSON.stringify(steps);
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    const action = await prisma.remediationAction.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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

// DELETE - Delete a remediation action (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.email !== "admin@gladiatorrx.com") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Remediation action ID is required" },
        { status: 400 }
      );
    }

    // Verify the action exists (admin can delete any action)
    const existingAction = await prisma.remediationAction.findUnique({
      where: { id },
    });

    if (!existingAction) {
      return NextResponse.json(
        { error: "Remediation action not found" },
        { status: 404 }
      );
    }

    await prisma.remediationAction.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Remediation action deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting remediation action:", error);
    return NextResponse.json(
      { error: "Failed to delete remediation action" },
      { status: 500 }
    );
  }
}
