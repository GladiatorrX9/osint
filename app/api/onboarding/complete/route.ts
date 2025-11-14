import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, organizationName, password } = body;

    // Validation
    if (!token || !organizationName || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    if (organizationName.trim().length < 2) {
      return NextResponse.json(
        { error: "Organization name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    // Find waitlist entry with this token
    const waitlist = await prisma.waitlist.findUnique({
      where: { onboardingToken: token },
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`🔐 Hashing password for ${waitlist.email}`);
    console.log(`Password length: ${password.length}`);
    console.log(`Hash generated: ${hashedPassword.substring(0, 20)}...`);

    // Create organization, user, and team member in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName.trim(),
          slug: organizationName.toLowerCase().trim().replace(/\s+/g, "-"),
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          email: waitlist.email,
          name: waitlist.name,
          password: hashedPassword,
          organizationId: organization.id,
        },
      });

      // Create team member with OWNER role
      await tx.teamMember.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "OWNER",
        },
      });

      // Clear the onboarding token (mark as used)
      await tx.waitlist.update({
        where: { id: waitlist.id },
        data: {
          onboardingToken: null,
          tokenExpiresAt: null,
        },
      });

      return { user, organization };
    });

    console.log(
      `✅ User onboarding completed: ${result.user.email} (Org: ${result.organization.name})`
    );

    return NextResponse.json({
      success: true,
      message: "Registration completed successfully! You can now log in.",
      user: {
        email: result.user.email,
        name: result.user.name,
      },
      organization: {
        name: result.organization.name,
      },
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json(
      { error: "Failed to complete registration. Please try again." },
      { status: 500 }
    );
  }
}
