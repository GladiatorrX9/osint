import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { sendInvitationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, role = "MEMBER" } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get the inviting user with their organization
    const inviter = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        organization: true,
        teamMembers: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!inviter || !inviter.organizationId) {
      return NextResponse.json(
        { error: "User not found or not part of an organization" },
        { status: 404 }
      );
    }

    const organizationId = inviter.organizationId;

    // Check if inviter has permission (must be OWNER or ADMIN)
    const inviterMembership = inviter.teamMembers.find(
      (tm) => tm.organizationId === organizationId
    );
    if (
      !inviterMembership ||
      !["OWNER", "ADMIN"].includes(inviterMembership.role)
    ) {
      return NextResponse.json(
        { error: "You do not have permission to invite users" },
        { status: 403 }
      );
    }

    // Get organization
    const organization = inviter.organization;

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if user already exists in the organization
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        teamMembers: {
          where: { organizationId },
        },
      },
    });

    if (existingUser?.teamMembers && existingUser.teamMembers.length > 0) {
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 400 }
      );
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        organizationId,
        status: "PENDING",
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 }
      );
    }

    // Generate unique invitation token
    const token = crypto.randomBytes(32).toString("hex");

    // Generate invitation URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/invite/${token}`;

    // Send invitation email FIRST - only proceed if successful
    const emailResult = await sendInvitationEmail({
      to: email,
      inviterName: inviter.name,
      organizationName: organization.name,
      role,
      inviteUrl,
    });

    // Check if email sending failed
    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult.error);
      return NextResponse.json(
        {
          error: emailResult.error || "Failed to send invitation email",
          details:
            "Please check your email configuration (RESEND_API_KEY and domain verification)",
        },
        { status: 500 }
      );
    }

    // Only create invitation in DB if email was sent successfully
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        organizationId,
        invitedById: inviter.id,
        token,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
      inviteUrl, // Return URL for development/testing
      emailSent: true,
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}

// GET - List all invitations for an organization
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Get user and verify they have access to this organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        teamMembers: {
          where: { organizationId },
        },
      },
    });

    if (!user || user.teamMembers.length === 0) {
      return NextResponse.json(
        { error: "You do not have access to this organization" },
        { status: 403 }
      );
    }

    // Get all invitations for the organization
    const invitations = await prisma.invitation.findMany({
      where: { organizationId },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}
