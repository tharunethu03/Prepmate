import prisma from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import transporter from "@/lib/mailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Check if email is already taken by a verified user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 },
      );
    }

    const hashed = await hash(password, 12);

    // Remove any previous pending registration for this email (allow retry)
    await prisma.pendingRegistration.deleteMany({ where: { email } });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.pendingRegistration.create({
      data: { email, hashedPassword: hashed, token, expires },
    });

    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

    await transporter.sendMail({
      from: `"Prepmate" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your Prepmate email",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #6366f1;">Welcome to Prepmate! 🎯</h2>
          <p>Hi there,</p>
          <p>Thanks for signing up! Click the button below to verify your email address. This link expires in 24 hours.</p>
          <a href="${verifyUrl}"
            style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
            Verify Email
          </a>
          <p style="color: #888; font-size: 12px;">If you didn't create a Prepmate account, ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
