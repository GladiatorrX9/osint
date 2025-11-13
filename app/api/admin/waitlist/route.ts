import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { sendWaitlistApprovalEmail } from "@/lib/email";
import crypto from "crypto";

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

    // Get the waitlist entry first
    const waitlistEntry = await prisma.waitlist.findUnique({
      where: { id },
    });

    if (!waitlistEntry) {
      return NextResponse.json(
        { error: "Waitlist entry not found" },
        { status: 404 }
      );
    }

    // If approving, generate onboarding token and send email
    let updateData: any = { status };

    if (status === "APPROVED" && waitlistEntry.status !== "APPROVED") {
      // Generate unique onboarding token
      const onboardingToken = crypto.randomBytes(32).toString("hex");

      // Set token expiration to 24 hours from now
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);

      updateData.onboardingToken = onboardingToken;
      updateData.tokenExpiresAt = tokenExpiresAt;

      // Generate onboarding URL
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const onboardingUrl = `${baseUrl}/onboarding/${onboardingToken}`;

      // Send approval email
      const emailResult = await sendWaitlistApprovalEmail({
        to: waitlistEntry.email,
        name: waitlistEntry.name,
        company: waitlistEntry.company || undefined,
        onboardingUrl,
      });

      if (!emailResult.success) {
        console.error("Failed to send approval email:", emailResult.error);
        // Continue with approval even if email fails, but log it
        console.log("Onboarding URL (email failed):", onboardingUrl);
      } else {
        console.log(
          "Approval email sent successfully to:",
          waitlistEntry.email
        );
      }
    }

    const updated = await prisma.waitlist.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      waitlist: updated,
      message:
        status === "APPROVED"
          ? "User approved and onboarding email sent"
          : "Waitlist status updated",
    });
  } catch (error) {
    console.error("Admin waitlist update error:", error);
    return NextResponse.json(
      { error: "Failed to update waitlist" },
      { status: 500 }
    );
  }
}
