import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find waitlist entry with this token
    const waitlist = await prisma.waitlist.findUnique({
      where: { onboardingToken: token },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        status: true,
        tokenExpiresAt: true,
      },
    });

    if (!waitlist) {
      return NextResponse.json(
        { error: "Invalid onboarding link" },
        { status: 404 }
      );
    }

    // Check if token has expired
    if (!waitlist.tokenExpiresAt || waitlist.tokenExpiresAt < new Date()) {
      return NextResponse.json(
        {
          error:
            "This onboarding link has expired. Please contact support for a new link.",
        },
        { status: 410 }
      );
    }

    // Check if status is APPROVED
    if (waitlist.status !== "APPROVED") {
      return NextResponse.json(
        { error: "This waitlist entry is not approved" },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: waitlist.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists. Please log in instead.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      waitlist: {
        email: waitlist.email,
        name: waitlist.name,
        company: waitlist.company,
      },
    });
  } catch (error) {
    console.error("Error verifying onboarding token:", error);
    return NextResponse.json(
      { error: "Failed to verify onboarding link" },
      { status: 500 }
    );
  }
}
