import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Find user with this reset token
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
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

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    console.log(`✅ Password reset successful for: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
