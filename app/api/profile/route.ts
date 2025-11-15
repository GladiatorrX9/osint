import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/profile - Get user profile with organization details
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organization: {
          include: {
            subscription: true,
          },
        },
        teamMembers: {
          where: { status: "ACTIVE" },
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profileData = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      organization: user.organization
        ? {
            id: user.organization.id,
            name: user.organization.name,
            slug: user.organization.slug,
            subscription: user.organization.subscription,
          }
        : null,
      teamMemberships: user.teamMembers.map((tm) => ({
        id: tm.id,
        role: tm.role,
        status: tm.status,
        organization: {
          id: tm.organization.id,
          name: tm.organization.name,
        },
        joinedAt: tm.joinedAt,
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      preferences: {
        emailNotifications: user.emailNotifications,
        securityAlerts: user.securityAlerts,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email } = body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // If email is being changed, check if it's already in use
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name.trim(),
        ...(email && { email: email.trim().toLowerCase() }),
      },
      include: {
        organization: {
          include: {
            subscription: true,
          },
        },
        teamMembers: {
          where: { status: "ACTIVE" },
          include: {
            organization: true,
          },
        },
      },
    });

    const profileData = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      image: updatedUser.image,
      role: updatedUser.role,
      organization: updatedUser.organization
        ? {
            id: updatedUser.organization.id,
            name: updatedUser.organization.name,
            slug: updatedUser.organization.slug,
            subscription: updatedUser.organization.subscription,
          }
        : null,
      teamMemberships: updatedUser.teamMembers.map((tm) => ({
        id: tm.id,
        role: tm.role,
        status: tm.status,
        organization: {
          id: tm.organization.id,
          name: tm.organization.name,
        },
        joinedAt: tm.joinedAt,
      })),
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      preferences: {
        emailNotifications: updatedUser.emailNotifications,
        securityAlerts: updatedUser.securityAlerts,
        twoFactorEnabled: updatedUser.twoFactorEnabled,
      },
    };

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: profileData,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
