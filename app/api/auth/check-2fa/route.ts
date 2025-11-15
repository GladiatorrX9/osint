import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isCorrectPassword = await compare(password, user.password);

    if (!isCorrectPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log(`✅ Password verified for: ${user.email}`);
    console.log(`🔐 2FA enabled: ${user.twoFactorEnabled}`);

    // Return whether 2FA is required
    return NextResponse.json({
      requires2FA: user.twoFactorEnabled || false,
      email: user.email,
    });
  } catch (error) {
    console.error("Error checking 2FA status:", error);
    return NextResponse.json(
      { error: "Failed to check 2FA status" },
      { status: 500 }
    );
  }
}
