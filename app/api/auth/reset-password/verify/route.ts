import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find user with this reset token
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
      select: {
        id: true,
        email: true,
        resetTokenExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid reset link" },
        { status: 404 }
      );
    }

    // Check if token has expired
    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      email: user.email,
    });
  } catch (error) {
    console.error("Error verifying reset token:", error);
    return NextResponse.json(
      { error: "Failed to verify reset link" },
      { status: 500 }
    );
  }
}
