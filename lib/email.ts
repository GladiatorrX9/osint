import { Resend } from "resend";

// Initialize Resend with API key from environment variables
// Get your API key from https://resend.com/api-keys
const resend = new Resend(process.env.RESEND_API_KEY);

interface InvitationEmailData {
  to: string;
  inviterName: string;
  organizationName: string;
  role: string;
  inviteUrl: string;
}

export async function sendInvitationEmail(data: InvitationEmailData) {
  const { to, inviterName, organizationName, role, inviteUrl } = data;

  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured. Email not sent.");
      console.log("Invitation URL:", inviteUrl);
      return {
        success: false,
        error: "Email service not configured",
        inviteUrl, // Return URL for testing
      };
    }

    const { data: emailData, error } = await resend.emails.send({
      from:
        process.env.EMAIL_FROM || "GladiatorrX <onboarding@gladiatorrx.com>",
      to: [to],
      subject: `You've been invited to join ${organizationName}`,
      html: generateInvitationEmailHTML(data),
    });

    if (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        error: error.message,
        inviteUrl,
      };
    }

    return {
      success: true,
      emailId: emailData?.id,
      inviteUrl,
    };
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      inviteUrl,
    };
  }
}

function generateInvitationEmailHTML(data: InvitationEmailData): string {
  const { inviterName, organizationName, role, inviteUrl } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Join ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #000000 0%, #0a4a52 100%); border-radius: 12px 12px 0 0; padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; color: #06b6d4; font-size: 32px; font-weight: 700;">
        GladiatorrX
      </h1>
      <p style="margin: 10px 0 0; color: #67e8f9; font-size: 14px;">
        Data Breach Intelligence Platform
      </p>
    </div>

    <!-- Content -->
    <div style="background-color: #0a0a0a; border: 1px solid #164e63; border-top: none; border-radius: 0 0 12px 12px; padding: 40px 30px;">
      <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 24px; font-weight: 600;">
        You've Been Invited!
      </h2>
      
      <p style="margin: 0 0 20px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
        <strong style="color: #ffffff;">${inviterName}</strong> has invited you to join <strong style="color: #06b6d4;">${organizationName}</strong> on GladiatorrX as a <strong style="color: #06b6d4;">${role}</strong>.
      </p>

      <p style="margin: 0 0 30px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
        GladiatorrX helps organizations monitor and respond to data breaches in real-time. Join your team to start protecting your organization's data.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${inviteUrl}" style="display: inline-block; background-color: #06b6d4; color: #000000; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.3s;">
          Accept Invitation
        </a>
      </div>

      <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #27272a;">
        <p style="margin: 0 0 10px; color: #71717a; font-size: 14px;">
          Or copy and paste this link into your browser:
        </p>
        <p style="margin: 0; word-break: break-all;">
          <a href="${inviteUrl}" style="color: #06b6d4; text-decoration: none; font-size: 14px;">
            ${inviteUrl}
          </a>
        </p>
      </div>

      <div style="margin-top: 40px; padding: 20px; background-color: #18181b; border-left: 3px solid #06b6d4; border-radius: 4px;">
        <p style="margin: 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">
          <strong style="color: #ffffff;">Security Note:</strong> This invitation link will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="margin-top: 30px; text-align: center;">
      <p style="margin: 0 0 10px; color: #52525b; font-size: 13px;">
        © ${new Date().getFullYear()} GladiatorrX. All rights reserved.
      </p>
      <p style="margin: 0; color: #52525b; font-size: 13px;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Generic email sending function for admin use
interface SendEmailData {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail(data: SendEmailData) {
  const { to, subject, html, text, from } = data;

  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured. Email not sent.");
      return {
        success: false,
        error: "Email service not configured",
      };
    }

    const recipients = Array.isArray(to) ? to : [to];

    const { data: emailData, error } = await resend.emails.send({
      from:
        from ||
        process.env.EMAIL_FROM ||
        "GladiatorrX <onboarding@gladiatorrx.com>",
      to: recipients,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      emailId: emailData?.id,
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Waitlist approval/onboarding email
interface OnboardingEmailData {
  to: string;
  name: string;
  company?: string;
  onboardingUrl: string;
}

export async function sendWaitlistApprovalEmail(data: OnboardingEmailData) {
  const { to, name, company, onboardingUrl } = data;

  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured. Email not sent.");
      console.log("Onboarding URL:", onboardingUrl);
      return {
        success: false,
        error: "Email service not configured",
        onboardingUrl,
      };
    }

    const { data: emailData, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "GladiatorrX <onboarding@resend.dev>",
      to: [to],
      subject: "Welcome to GladiatorrX - Complete Your Registration",
      html: generateOnboardingEmailHTML(data),
    });

    if (error) {
      console.error("Error sending onboarding email:", error);
      return {
        success: false,
        error: error.message,
        onboardingUrl,
      };
    }

    return {
      success: true,
      emailId: emailData?.id,
      onboardingUrl,
    };
  } catch (error) {
    console.error("Failed to send onboarding email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      onboardingUrl,
    };
  }
}

function generateOnboardingEmailHTML(data: OnboardingEmailData): string {
  const { name, company, onboardingUrl } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to GladiatorrX</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #000000 0%, #0a4a52 100%); border-radius: 12px 12px 0 0; padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; color: #06b6d4; font-size: 32px; font-weight: 700;">
        GladiatorrX
      </h1>
      <p style="margin: 10px 0 0; color: #67e8f9; font-size: 14px;">
        Data Breach Intelligence Platform
      </p>
    </div>

    <!-- Content -->
    <div style="background-color: #0a0a0a; border: 1px solid #164e63; border-top: none; border-radius: 0 0 12px 12px; padding: 40px 30px;">
      <div style="background: linear-gradient(135deg, #065f46 0%, #10b981 100%); border-radius: 8px; padding: 3px; margin-bottom: 30px;">
        <div style="background-color: #0a0a0a; border-radius: 6px; padding: 20px; text-align: center;">
          <h2 style="margin: 0; color: #10b981; font-size: 24px; font-weight: 700;">
            ✓ Your Application Has Been Approved!
          </h2>
        </div>
      </div>
      
      <p style="margin: 0 0 20px; color: #ffffff; font-size: 18px; font-weight: 600;">
        Hi ${name},
      </p>

      <p style="margin: 0 0 20px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
        Great news! Your application to join GladiatorrX has been approved by our admin team. We're excited to have you on board!
      </p>

      ${
        company
          ? `<p style="margin: 0 0 20px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
        You registered with <strong style="color: #06b6d4;">${company}</strong>. You'll be able to confirm or update your organization details in the next step.
      </p>`
          : ""
      }

      <div style="background-color: #18181b; border-left: 3px solid #06b6d4; border-radius: 4px; padding: 20px; margin: 30px 0;">
        <h3 style="margin: 0 0 15px; color: #ffffff; font-size: 18px; font-weight: 600;">
          What's Next?
        </h3>
        <ol style="margin: 0; padding-left: 20px; color: #a1a1aa; font-size: 15px; line-height: 1.8;">
          <li style="margin-bottom: 10px;">Click the button below to complete your registration</li>
          ${
            !company
              ? '<li style="margin-bottom: 10px;">Set up your organization name</li>'
              : '<li style="margin-bottom: 10px;">Confirm your organization details</li>'
          }
          <li style="margin-bottom: 10px;">Create a secure password for your account</li>
          <li style="margin-bottom: 0;">Start monitoring for data breaches instantly</li>
        </ol>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${onboardingUrl}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: #000000; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4);">
          Complete Registration
        </a>
      </div>

      <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #27272a;">
        <p style="margin: 0 0 10px; color: #71717a; font-size: 14px;">
          Or copy and paste this link into your browser:
        </p>
        <p style="margin: 0; word-break: break-all;">
          <a href="${onboardingUrl}" style="color: #06b6d4; text-decoration: none; font-size: 14px;">
            ${onboardingUrl}
          </a>
        </p>
      </div>

      <div style="margin-top: 40px; padding: 20px; background-color: #18181b; border-left: 3px solid #f59e0b; border-radius: 4px;">
        <p style="margin: 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">
          <strong style="color: #ffffff;">⏰ Time-Sensitive:</strong> This registration link will expire in 24 hours. Please complete your setup as soon as possible to maintain access.
        </p>
      </div>

      <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 8px;">
        <h3 style="margin: 0 0 15px; color: #06b6d4; font-size: 16px; font-weight: 600;">
          What You'll Get:
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #94a3b8; font-size: 14px; line-height: 1.8;">
          <li>Real-time data breach monitoring</li>
          <li>Search 15+ major breach databases</li>
          <li>Team collaboration tools</li>
          <li>Remediation action tracking</li>
          <li>Comprehensive security reports</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div style="margin-top: 30px; text-align: center;">
      <p style="margin: 0 0 10px; color: #52525b; font-size: 13px;">
        © ${new Date().getFullYear()} GladiatorrX. All rights reserved.
      </p>
      <p style="margin: 0; color: #52525b; font-size: 13px;">
        Need help? Contact us at <a href="mailto:support@gladiatorrx.com" style="color: #06b6d4; text-decoration: none;">support@gladiatorrx.com</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

interface PasswordResetEmailData {
  email: string;
  name: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData) {
  const { email, name, resetUrl } = data;

  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured. Email not sent.");
      console.log("Password Reset URL:", resetUrl);
      return {
        success: false,
        error: "Email service not configured",
        resetUrl, // Return URL for testing
      };
    }

    const { data: emailData, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "GladiatorrX <security@gladiatorrx.com>",
      to: [email],
      subject: "Reset Your GladiatorrX Password",
      html: generatePasswordResetEmailHTML(data),
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      return {
        success: false,
        error: error.message,
        resetUrl,
      };
    }

    return {
      success: true,
      emailId: emailData?.id,
      resetUrl,
    };
  } catch (error: any) {
    console.error("Failed to send password reset email:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
      resetUrl,
    };
  }
}

function generatePasswordResetEmailHTML(data: PasswordResetEmailData): string {
  const { name, resetUrl } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header with gradient -->
    <div style="background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">GladiatorrX</h1>
      <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Data Breach Monitoring & Protection</p>
    </div>

    <!-- Main content -->
    <div style="background-color: #171717; padding: 40px 30px; border-radius: 0 0 12px 12px;">
      <!-- Lock Icon -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: rgba(220, 38, 38, 0.1); border-radius: 50%; padding: 20px;">
          <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
            <span style="color: white; font-size: 24px;">🔒</span>
          </div>
        </div>
      </div>

      <h2 style="margin: 0 0 20px; color: white; font-size: 24px; text-align: center;">Reset Your Password</h2>
      
      <p style="margin: 0 0 20px; color: #a3a3a3; font-size: 16px; line-height: 1.6;">
        Hi ${name},
      </p>

      <p style="margin: 0 0 20px; color: #a3a3a3; font-size: 16px; line-height: 1.6;">
        We received a request to reset your password for your GladiatorrX account. Click the button below to create a new password:
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="${resetUrl}" 
           style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
          Reset Password
        </a>
      </div>

      <p style="margin: 20px 0; color: #737373; font-size: 14px; line-height: 1.6;">
        Or copy and paste this URL into your browser:
      </p>
      <p style="margin: 0 0 20px; color: #f97316; font-size: 12px; word-break: break-all; background: rgba(249, 115, 22, 0.1); padding: 12px; border-radius: 6px; border-left: 3px solid #f97316;">
        ${resetUrl}
      </p>

      <!-- Security Notice -->
      <div style="background: rgba(220, 38, 38, 0.1); border-left: 3px solid #dc2626; padding: 16px; border-radius: 6px; margin: 30px 0;">
        <p style="margin: 0; color: #fca5a5; font-size: 14px; line-height: 1.6;">
          <strong style="color: #dc2626;">⏰ Security Notice:</strong><br>
          This password reset link will expire in <strong>1 hour</strong> for your security.
        </p>
      </div>

      <p style="margin: 20px 0 0; color: #737373; font-size: 14px; line-height: 1.6;">
        If you didn't request a password reset, please ignore this email or contact our support team if you have concerns about your account security.
      </p>

      <!-- Divider -->
      <div style="border-top: 1px solid #262626; margin: 30px 0;"></div>

      <!-- Footer -->
      <p style="margin: 0; color: #525252; font-size: 12px; text-align: center; line-height: 1.6;">
        This is an automated security email from GladiatorrX.<br>
        For support, contact us at support@gladiatorrx.com
      </p>
    </div>

    <!-- Bottom spacing -->
    <div style="height: 20px;"></div>
  </div>
</body>
</html>
  `.trim();
}

// Export for use in API routes
export {
  generateInvitationEmailHTML,
  generateOnboardingEmailHTML,
  generatePasswordResetEmailHTML,
};
