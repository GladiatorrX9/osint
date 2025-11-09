import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { password, name } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: true,
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check if invitation is still valid
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "This invitation has already been used or cancelled" },
        { status: 400 }
      );
    }

    if (new Date() > invitation.expiresAt) {
      // Mark as expired
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    // If user doesn't exist, create new user account
    if (!user) {
      if (!password || !name) {
        return NextResponse.json(
          { error: "Name and password are required for new users" },
          { status: 400 }
        );
      }

      // Validate password strength
      if (password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters long" },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      user = await prisma.user.create({
        data: {
          email: invitation.email,
          name,
          password: hashedPassword,
          role: "USER",
          organizationId: invitation.organizationId,
        },
      });
    }

    // Create team membership
    await prisma.teamMember.create({
      data: {
        userId: user.id,
        organizationId: invitation.organizationId,
        role: invitation.role,
        status: "ACTIVE",
      },
    });

    // Update invitation status
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
        invitedUserId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      organization: {
        id: invitation.organization.id,
        name: invitation.organization.name,
      },
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}

// GET - Retrieve invitation details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: true,
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check if expired
    const isExpired = new Date() > invitation.expiresAt;
    if (isExpired && invitation.status === "PENDING") {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: isExpired ? "EXPIRED" : invitation.status,
        expiresAt: invitation.expiresAt,
        organization: {
          id: invitation.organization.id,
          name: invitation.organization.name,
        },
        invitedBy: invitation.invitedBy,
      },
      userExists: !!existingUser,
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}
