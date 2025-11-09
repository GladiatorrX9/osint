import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// POST - Create organization for current user (if they don't have one)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has an organization
    if (user.organizationId) {
      const organization = await prisma.organization.findUnique({
        where: { id: user.organizationId },
      });
      return NextResponse.json({
        message: "Organization already exists",
        organization: {
          id: organization?.id,
          name: organization?.name,
        },
      });
    }

    const { organizationName } = await request.json();

    if (!organizationName) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    // Generate organization slug from name
    const slug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Create organization and team member in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: `${slug}-${Date.now()}`,
        },
      });

      // Update user with organization
      await tx.user.update({
        where: { id: user.id },
        data: { organizationId: organization.id },
      });

      // Create team member record (OWNER role)
      await tx.teamMember.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "OWNER",
          status: "ACTIVE",
        },
      });

      return organization;
    });

    return NextResponse.json({
      success: true,
      message: "Organization created successfully",
      organization: {
        id: result.id,
        name: result.name,
      },
    });
  } catch (error) {
    console.error("Error setting up organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
