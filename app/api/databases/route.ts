import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");

    const where: any = {};

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { source: { contains: query, mode: "insensitive" } },
        { affectedOrg: { contains: query, mode: "insensitive" } },
      ];
    }

    if (severity) {
      where.severity = severity;
    }

    if (status) {
      where.status = status;
    }

    const databases = await prisma.leakedDatabase.findMany({
      where,
      orderBy: {
        leakDate: "desc",
      },
    });

    // Convert BigInt to Number for JSON serialization
    const serializedDatabases = databases.map((db) => ({
      ...db,
      recordCount: Number(db.recordCount),
    }));

    return NextResponse.json(serializedDatabases);
  } catch (error) {
    console.error("Search error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
