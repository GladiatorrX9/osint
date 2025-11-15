import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// PATCH /api/profile/preferences - Update user preferences
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { emailNotifications, securityAlerts, twoFactorEnabled } = body;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update preferences
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(typeof emailNotifications === "boolean" && { emailNotifications }),
        ...(typeof securityAlerts === "boolean" && { securityAlerts }),
        ...(typeof twoFactorEnabled === "boolean" && { twoFactorEnabled }),
      },
    });

    console.log(`✅ Preferences updated for ${user.email}`);

    return NextResponse.json({
      message: "Preferences updated successfully",
      preferences: {
        emailNotifications: updatedUser.emailNotifications,
        securityAlerts: updatedUser.securityAlerts,
        twoFactorEnabled: updatedUser.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
