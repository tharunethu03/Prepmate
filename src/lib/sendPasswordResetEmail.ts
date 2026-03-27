import prisma from "./prisma";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  const visible = user.slice(0, 3);
  const masked = "*".repeat(Math.max(user.length - 3, 4));
  return `${visible}${masked}@${domain}`;
}

export async function sendPasswordResetEmail(
  userId: string,
  email: string,
  name: string | null,
): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: token,
      passwordResetTokenExpires: expires,
    },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: "Reset your Prepmate password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #6366f1;">Reset your password 🔐</h2>
        <p>Hi ${name ?? "there"},</p>
        <p>We received a request to reset your Prepmate password. Click the button below to choose a new one.</p>
        <a href="${resetUrl}"
          style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Reset Password
        </a>
        <p>This link expires in <strong>1 hour</strong>.</p>
        <p style="color: #888; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });

  return maskEmail(email);
}
