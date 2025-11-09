import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

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
        {
          error: "No organization found",
          message: "Please create an organization first",
        },
        { status: 404 }
      );
    }

    // Get organization details with team members and invitations
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      include: {
        teamMembers: {
          where: {
            status: "ACTIVE",
          },
        },
        invitations: {
          where: {
            status: "PENDING",
          },
        },
        subscription: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentInvitations = await prisma.invitation.count({
      where: {
        organizationId: user.organizationId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Get recent searches
    const recentSearches = await prisma.searchLog.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Get all leaked databases with their status
    const leakedDatabasesRaw = await prisma.leakedDatabase.findMany({
      select: {
        id: true,
        name: true,
        severity: true,
        status: true,
        recordCount: true,
        leakDate: true,
        affectedOrg: true,
      },
      orderBy: {
        leakDate: "desc",
      },
    });

    // Convert BigInt to number for JSON serialization
    const leakedDatabases = leakedDatabasesRaw.map((db) => ({
      ...db,
      recordCount: Number(db.recordCount),
    }));

    // Categorize breaches by status
    const breachStats = {
      total: leakedDatabases.length,
      active: leakedDatabases.filter((db) => db.status === "active").length,
      investigating: leakedDatabases.filter(
        (db) => db.status === "investigating"
      ).length,
      archived: leakedDatabases.filter((db) => db.status === "archived").length,
      critical: leakedDatabases.filter((db) => db.severity === "critical")
        .length,
      high: leakedDatabases.filter((db) => db.severity === "high").length,
      medium: leakedDatabases.filter((db) => db.severity === "medium").length,
    };

    // Get user's organization members for monitoring
    const monitoredEmails = organization.teamMembers
      .map((member: any) => member.user?.email)
      .filter(Boolean);

    // Get total search logs for user
    const totalSearches = await prisma.searchLog.count({
      where: {
        userId: user.id,
      },
    });

    // Get remediation actions
    const remediationStats = await prisma.remediationAction.groupBy({
      by: ["status"],
      where: {
        userId: user.id,
      },
      _count: true,
    });

    const remediationSummary = {
      total: remediationStats.reduce(
        (acc: number, curr: any) => acc + curr._count,
        0
      ),
      pending:
        remediationStats.find((s: any) => s.status === "PENDING")?._count || 0,
      inProgress:
        remediationStats.find((s: any) => s.status === "IN_PROGRESS")?._count ||
        0,
      completed:
        remediationStats.find((s: any) => s.status === "COMPLETED")?._count ||
        0,
      failed:
        remediationStats.find((s: any) => s.status === "FAILED")?._count || 0,
    };

    // Build response
    const stats = {
      organization: {
        name: organization.name,
        memberCount: organization.teamMembers.length,
        pendingInvites: organization.invitations.length,
      },
      subscription: organization.subscription
        ? {
            plan: organization.subscription.plan,
            status: organization.subscription.status,
            currentPeriodEnd: organization.subscription.currentPeriodEnd,
          }
        : null,
      recentActivity: {
        invitations: recentInvitations,
        searches: recentSearches,
      },
      monitoring: {
        emails: monitoredEmails.length,
        domains: new Set(
          monitoredEmails.map((email: string) => email.split("@")[1])
        ).size,
        totalSearches,
      },
      breaches: breachStats,
      leakedDatabases: leakedDatabases.slice(0, 10), // Top 10 most recent
      remediation: remediationSummary,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard overview",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
