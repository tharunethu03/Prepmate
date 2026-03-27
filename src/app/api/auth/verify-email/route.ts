import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token)
    return NextResponse.redirect(
      new URL("/login?error=invalid-token", req.url),
    );

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verificationToken)
    return NextResponse.redirect(
      new URL("/login?error=invalid-token", req.url),
    );

  if (verificationToken.expires < new Date())
    return NextResponse.redirect(
      new URL("/login?error=token-expired", req.url),
    );

  // Mark email as verified
  await prisma.user.update({
    where: { id: verificationToken.userId },
    data: { emailVerified: new Date() },
  });

  // Delete the token
  await prisma.verificationToken.delete({
    where: { token },
  });

  return NextResponse.redirect(new URL("/login?verified=true", req.url));
}
