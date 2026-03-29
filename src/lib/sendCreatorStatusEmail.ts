import transporter from "./mailer";

export async function sendCreatorApprovedEmail(
  email: string,
  name: string | null,
) {
  await transporter.sendMail({
    from: `"Prepmate" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🎉 Your Creator request has been approved!",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #6366f1;">You're now a Creator! 🎉</h2>
        <p>Hi ${name ?? "there"},</p>
        <p>Great news — your Prepmate Creator request has been <strong>approved</strong>!</p>
        <p>You can now:</p>
        <ul style="padding-left: 20px; line-height: 1.8;">
          <li>Create and publish public interviews</li>
          <li>Build a following on the platform</li>
          <li>Track how your interviews perform with Creator Analytics</li>
        </ul>
        <a href="${process.env.NEXTAUTH_URL}/create-interviews"
          style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Start Creating
        </a>
        <p style="color: #888; font-size: 12px;">Welcome to the creator community!</p>
      </div>
    `,
  });
}

export async function sendCreatorDeclinedEmail(
  email: string,
  name: string | null,
  reason?: string,
) {
  await transporter.sendMail({
    from: `"Prepmate" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Creator request status",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #6366f1;">Creator Request Update</h2>
        <p>Hi ${name ?? "there"},</p>
        <p>Thank you for applying to become a Prepmate Creator. After reviewing your request, we were unable to approve it at this time.</p>
        ${
          reason
            ? `<div style="background: #f3f4f6; border-left: 4px solid #6366f1; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>
              </div>`
            : ""
        }
        <p>You can update your profile with additional social links and re-apply from your settings page.</p>
        <a href="${process.env.NEXTAUTH_URL}/settings"
          style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Update Profile
        </a>
        <p style="color: #888; font-size: 12px;">If you have questions, contact us via the Help Center.</p>
      </div>
    `,
  });
}
