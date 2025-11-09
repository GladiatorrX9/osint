import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET - Fetch search logs for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const searchType = searchParams.get("searchType");
    const databaseName = searchParams.get("databaseName");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (searchType) {
      where.searchType = searchType;
    }

    if (databaseName) {
      where.databaseName = databaseName;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.searchLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.searchLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching search logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch search logs" },
      { status: 500 }
    );
  }
}

// POST - Create a new search log
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { query, resultsCount, databaseName, searchType } = body;

    if (!query || resultsCount === undefined) {
      return NextResponse.json(
        { error: "Query and resultsCount are required" },
        { status: 400 }
      );
    }

    // Get IP address and user agent
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "Unknown";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    const searchLog = await prisma.searchLog.create({
      data: {
        userId: user.id,
        query,
        resultsCount,
        databaseName,
        searchType: searchType || "GENERAL",
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json(searchLog, { status: 201 });
  } catch (error) {
    console.error("Error creating search log:", error);
    return NextResponse.json(
      { error: "Failed to create search log" },
      { status: 500 }
    );
  }
}
