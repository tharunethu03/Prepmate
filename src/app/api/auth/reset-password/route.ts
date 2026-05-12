import prisma from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();

  if (!token || !newPassword) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findFirst({
    where: { passwordResetToken: token },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  }

  if (!user.passwordResetTokenExpires || user.passwordResetTokenExpires < new Date()) {
    return NextResponse.json({ error: "This link has expired. Please request a new one." }, { status: 400 });
  }

  const hashedPassword = await hash(newPassword, 12);

  // Clear the token after use so it can't be replayed
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
    },
  });

  return NextResponse.json({ success: true });
}
