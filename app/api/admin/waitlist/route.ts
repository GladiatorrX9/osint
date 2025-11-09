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

    const isAdmin = session.user.email === "admin@gladiatorrx.com";
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const waitlist = await prisma.waitlist.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const stats = {
      total: waitlist.length,
      pending: waitlist.filter((w) => w.status === "PENDING").length,
      approved: waitlist.filter((w) => w.status === "APPROVED").length,
      rejected: waitlist.filter((w) => w.status === "REJECTED").length,
    };

    return NextResponse.json({
      waitlist,
      stats,
    });
  } catch (error) {
    console.error("Admin waitlist error:", error);
    return NextResponse.json(
      { error: "Failed to fetch waitlist" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.email === "admin@gladiatorrx.com";
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 }
      );
    }

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.waitlist.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, waitlist: updated });
  } catch (error) {
    console.error("Admin waitlist update error:", error);
    return NextResponse.json(
      { error: "Failed to update waitlist" },
      { status: 500 }
    );
  }
}
