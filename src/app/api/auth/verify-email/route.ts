import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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
  await prisma.user.create({
    data: {
      email: pending.email,
      password: pending.hashedPassword,
      emailVerified: new Date(),
    },
  });

  // Clean up pending record
  await prisma.pendingRegistration.delete({ where: { token } });

  // Show "close this tab" page — the signup tab polls and auto-signs in
  return NextResponse.redirect(new URL("/auth/verified", req.url));
}
