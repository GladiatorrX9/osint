import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update user with reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiresAt: expiresAt,
        },
      });

      // Send reset email
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

      const emailResult = await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl,
      });

      if (emailResult.success) {
        console.log(`✅ Password reset email sent to: ${user.email}`);
      } else {
        console.error(
          `❌ Failed to send reset email to: ${user.email}`,
          emailResult.error
        );
        console.log(`🔗 Reset URL (for manual delivery): ${resetUrl}`);
      }
    } else {
      console.log(
        `⚠️ Password reset requested for non-existent email: ${email}`
      );
    }

    // Always return success response
    return NextResponse.json({
      success: true,
      message:
        "If an account exists with that email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
