import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token)
    return NextResponse.redirect(
      new URL("/login?error=invalid-token", req.url),
    );

  const pending = await prisma.pendingRegistration.findUnique({
    where: { token },
  });

  if (!pending)
    return NextResponse.redirect(
      new URL("/login?error=invalid-token", req.url),
    );

  if (pending.expires < new Date())
    return NextResponse.redirect(
      new URL("/login?error=token-expired", req.url),
    );

  // Create the real user now that email is verified
  const autoLoginToken = crypto.randomBytes(32).toString("hex");
  const autoLoginTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.user.create({
    data: {
      email: pending.email,
      password: pending.hashedPassword,
      emailVerified: new Date(),
      autoLoginToken,
      autoLoginTokenExpires,
    },
  });

  // Clean up pending record
  await prisma.pendingRegistration.delete({ where: { token } });

  // Redirect to auto-login page
  return NextResponse.redirect(
    new URL(`/auth/verified?token=${autoLoginToken}`, req.url),
  );
}
