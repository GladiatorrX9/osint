import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (you can adjust this logic)
    const isAdmin = session.user.email === "admin@gladiatorrx.com";
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    // Get all stats in parallel
    const [
      totalUsers,
      totalWaitlist,
      totalTeamMembers,
      totalOrganizations,
      totalDatabases,
      totalInvitations,
      recentWaitlistSignups,
      recentUsers,
      pendingInvitations,
    ] = await Promise.all([
      // Total registered users
      prisma.user.count(),

      // Total waitlist entries
      prisma.waitlist.count(),

      // Total team members across all organizations
      prisma.teamMember.count(),

      // Total organizations
      prisma.organization.count(),

      // Total leaked databases tracked
      prisma.leakedDatabase.count(),

      // Total invitations sent
      prisma.invitation.count(),

      // Recent waitlist signups (last 10)
      prisma.waitlist.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
      }),

      // Recent registered users (last 10)
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          organization: {
            select: {
              name: true,
            },
          },
        },
      }),

      // Pending invitations
      prisma.invitation.findMany({
        where: { status: "PENDING" },
        include: {
          invitedBy: {
            select: {
              name: true,
              email: true,
            },
          },
          organization: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // Get waitlist stats by time
    const today = new Date();
    const last24Hours = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [waitlist24h, waitlist7d, waitlist30d, users24h, users7d] =
      await Promise.all([
        prisma.waitlist.count({
          where: { createdAt: { gte: last24Hours } },
        }),
        prisma.waitlist.count({
          where: { createdAt: { gte: last7Days } },
        }),
        prisma.waitlist.count({
          where: { createdAt: { gte: last30Days } },
        }),
        prisma.user.count({
          where: { createdAt: { gte: last24Hours } },
        }),
        prisma.user.count({
          where: { createdAt: { gte: last7Days } },
        }),
      ]);

    // Get subscription stats
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: "ACTIVE" },
    });

    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ["plan"],
      _count: true,
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        totalWaitlist,
        totalTeamMembers,
        totalOrganizations,
        totalDatabases,
        totalInvitations,
        activeSubscriptions,
      },
      growth: {
        waitlist: {
          last24Hours: waitlist24h,
          last7Days: waitlist7d,
          last30Days: waitlist30d,
        },
        users: {
          last24Hours: users24h,
          last7Days: users7d,
        },
      },
      recentWaitlistSignups: recentWaitlistSignups.map((signup: any) => ({
        id: signup.id,
        name: signup.name,
        email: signup.email,
        company: signup.company,
        status: signup.status,
        createdAt: signup.createdAt,
      })),
      recentUsers: recentUsers.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization?.name,
        createdAt: user.createdAt,
      })),
      pendingInvitations: pendingInvitations.map((invitation: any) => ({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        invitedBy: invitation.invitedBy.name,
        organization: invitation.organization.name,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
      })),
      subscriptions: {
        total: activeSubscriptions,
        byPlan: subscriptionsByPlan.map((item: any) => ({
          plan: item.plan,
          count: item._count,
        })),
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
