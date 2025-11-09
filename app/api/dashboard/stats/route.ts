import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all databases
    const databases = await prisma.leakedDatabase.findMany();

    // Calculate statistics
    const stats = {
      total: databases.length,
      critical: databases.filter((db) => db.severity === "critical").length,
      high: databases.filter((db) => db.severity === "high").length,
      medium: databases.filter((db) => db.severity === "medium").length,
      low: databases.filter((db) => db.severity === "low").length,
    };

    // Calculate breach trends (last 12 months)
    const now = new Date();
    const breachTrends = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const count = databases.filter((db) => {
        const leakDate = new Date(db.leakDate);
        return (
          leakDate.getMonth() === date.getMonth() &&
          leakDate.getFullYear() === date.getFullYear()
        );
      }).length;
      breachTrends.push({ month, breaches: count });
    }

    // Calculate severity distribution
    const severityDistribution = [
      {
        severity: "Critical",
        count: stats.critical,
        fill: "hsl(0, 84%, 60%)",
      },
      {
        severity: "High",
        count: stats.high,
        fill: "hsl(25, 95%, 53%)",
      },
      {
        severity: "Medium",
        count: stats.medium,
        fill: "hsl(48, 96%, 53%)",
      },
      {
        severity: "Low",
        count: stats.low,
        fill: "hsl(142, 71%, 45%)",
      },
    ];

    // Calculate data types distribution
    const dataTypesMap: Record<string, number> = {};
    databases.forEach((db) => {
      const types = db.dataTypes.split(",").map((t) => t.trim());
      types.forEach((type) => {
        dataTypesMap[type] = (dataTypesMap[type] || 0) + 1;
      });
    });

    const dataTypes = Object.entries(dataTypesMap)
      .map(([name, value]) => ({
        name,
        value,
        fill:
          name === "Credentials"
            ? "hsl(var(--primary))"
            : name.includes("Financial")
            ? "hsl(0, 84%, 60%)"
            : name.includes("Personal")
            ? "hsl(25, 95%, 53%)"
            : name.includes("Health")
            ? "hsl(142, 71%, 45%)"
            : "hsl(var(--muted-foreground))",
      }))
      .slice(0, 5);

    // Calculate records timeline (last 12 months)
    const recordsTimeline = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dateStr = date.toISOString().slice(0, 7);
      const records = databases
        .filter((db) => {
          const leakDate = new Date(db.leakDate);
          return (
            leakDate.getMonth() === date.getMonth() &&
            leakDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, db) => sum + Number(db.recordCount), 0);
      recordsTimeline.push({ date: dateStr, records });
    }

    return NextResponse.json({
      stats,
      breachTrends,
      severityDistribution,
      dataTypes,
      recordsTimeline,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
