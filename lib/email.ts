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
        process.env.EMAIL_FROM || "GladiatorRX <onboarding@gladiatorrx.com>",
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
        GladiatorRX
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
        <strong style="color: #ffffff;">${inviterName}</strong> has invited you to join <strong style="color: #06b6d4;">${organizationName}</strong> on GladiatorRX as a <strong style="color: #06b6d4;">${role}</strong>.
      </p>

      <p style="margin: 0 0 30px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
        GladiatorRX helps organizations monitor and respond to data breaches in real-time. Join your team to start protecting your organization's data.
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
        © ${new Date().getFullYear()} GladiatorRX. All rights reserved.
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
        "GladiatorRX <onboarding@gladiatorrx.com>",
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

// Export for use in API routes
export { generateInvitationEmailHTML };
