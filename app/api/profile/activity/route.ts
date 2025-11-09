import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/profile/activity - Get user activity logs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get recent invitations sent by user
    const sentInvitations = await prisma.invitation.findMany({
      where: { invitedById: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
        organization: {
          select: { name: true },
        },
      },
    });

    // Get user's team membership changes
    const teamActivity = await prisma.teamMember.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        role: true,
        joinedAt: true,
        createdAt: true,
        organization: {
          select: { name: true },
        },
      },
    });

    // Build activity log from database events
    const activityLogs = [];

    // Add invitation activities
    for (const invitation of sentInvitations) {
      activityLogs.push({
        id: `inv-${invitation.id}`,
        action: `Invited ${invitation.email} to ${invitation.organization.name}`,
        type: "invitation",
        timestamp: invitation.createdAt.toISOString(),
        details: {
          email: invitation.email,
          status: invitation.status,
          organization: invitation.organization.name,
        },
      });
    }

    // Add team membership activities
    for (const team of teamActivity) {
      activityLogs.push({
        id: `team-${team.id}`,
        action: `Joined ${team.organization.name} as ${team.role}`,
        type: "team",
        timestamp: team.joinedAt.toISOString(),
        details: {
          role: team.role,
          status: team.status,
          organization: team.organization.name,
        },
      });
    }

    // Sort by timestamp (most recent first)
    activityLogs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Return only the most recent 15 activities
    return NextResponse.json({
      activities: activityLogs.slice(0, 15),
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}
