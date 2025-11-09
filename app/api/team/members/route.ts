import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET - List all team members
export async function GET(request: NextRequest) {
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

    // If user doesn't have an organization, return empty array
    if (!user.organizationId) {
      return NextResponse.json({
        members: [],
        message:
          "No organization found. Please contact support to set up your organization.",
      });
    }

    const members = await prisma.teamMember.findMany({
      where: {
        organizationId: user.organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    return NextResponse.json({
      members: members.map((member) => ({
        id: member.id,
        userId: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
        status: member.status,
        joinedAt: member.joinedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

// PATCH - Update team member role
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberId, role } = await request.json();

    if (!memberId || !role) {
      return NextResponse.json(
        { error: "Member ID and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["OWNER", "ADMIN", "MEMBER", "VIEWER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Get current user with their team membership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        teamMembers: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!user || !user.organizationId) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    const currentUserMembership = user.teamMembers[0];
    if (!currentUserMembership) {
      return NextResponse.json({ error: "Not a team member" }, { status: 403 });
    }

    // Only OWNER and ADMIN can change roles
    if (
      currentUserMembership.role !== "OWNER" &&
      currentUserMembership.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Only owners and admins can change member roles" },
        { status: 403 }
      );
    }

    // Get the member to update
    const memberToUpdate = await prisma.teamMember.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!memberToUpdate) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if member belongs to the same organization
    if (memberToUpdate.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Prevent changing own role
    if (memberToUpdate.userId === user.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    // Only OWNER can assign OWNER role
    if (role === "OWNER" && currentUserMembership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only the owner can assign the owner role" },
        { status: 403 }
      );
    }

    // ADMIN cannot change OWNER's role
    if (
      memberToUpdate.role === "OWNER" &&
      currentUserMembership.role === "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Admins cannot change the owner's role" },
        { status: 403 }
      );
    }

    // Update the role
    const updatedMember = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      member: {
        id: updatedMember.id,
        userId: updatedMember.user.id,
        name: updatedMember.user.name,
        email: updatedMember.user.email,
        role: updatedMember.role,
        status: updatedMember.status,
        joinedAt: updatedMember.joinedAt,
      },
    });
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    );
  }
}

// DELETE - Remove team member
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Get current user with their team membership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        teamMembers: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!user || !user.organizationId) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    const currentUserMembership = user.teamMembers[0];
    if (!currentUserMembership) {
      return NextResponse.json({ error: "Not a team member" }, { status: 403 });
    }

    // Only OWNER and ADMIN can remove members
    if (
      currentUserMembership.role !== "OWNER" &&
      currentUserMembership.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Only owners and admins can remove team members" },
        { status: 403 }
      );
    }

    // Get the member to remove
    const memberToRemove = await prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!memberToRemove) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if member belongs to the same organization
    if (memberToRemove.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Prevent removing yourself
    if (memberToRemove.userId === user.id) {
      return NextResponse.json(
        { error: "You cannot remove yourself from the team" },
        { status: 400 }
      );
    }

    // Prevent removing the owner
    if (memberToRemove.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot remove the organization owner" },
        { status: 400 }
      );
    }

    // ADMIN cannot remove another ADMIN or OWNER
    if (
      currentUserMembership.role === "ADMIN" &&
      (memberToRemove.role === "ADMIN" || memberToRemove.role === "OWNER")
    ) {
      return NextResponse.json(
        { error: "Admins cannot remove other admins or owners" },
        { status: 403 }
      );
    }

    // Mark as inactive instead of deleting
    await prisma.teamMember.update({
      where: { id: memberId },
      data: { status: "INACTIVE" },
    });

    return NextResponse.json({
      success: true,
      message: "Team member removed successfully",
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    );
  }
}
