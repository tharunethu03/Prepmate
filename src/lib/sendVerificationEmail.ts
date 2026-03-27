import prisma from "./prisma";
import transporter from "./mailer";
import crypto from "crypto";

export async function sendVerificationEmail(
  userId: string,
  email: string,
  name: string | null,
) {
  // Delete existing tokens for this user
  await prisma.verificationToken.deleteMany({ where: { userId } });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: { userId, token, expires },
  });

  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Prepmate" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your Prepmate email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #6366f1;">Welcome to Prepmate! 🎯</h2>
        <p>Hi ${name ?? "there"},</p>
        <p>Thanks for signing up! Please verify your email to get started.</p>
        <a href="${verifyUrl}"
          style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
        <p style="color: #888; font-size: 12px;">If you didn't sign up for Prepmate, ignore this email.</p>
      </div>
    `,
  });
}
