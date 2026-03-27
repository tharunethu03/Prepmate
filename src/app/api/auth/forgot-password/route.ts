import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/sendPasswordResetEmail";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user || !user.password) {
    return NextResponse.json({ success: true });
  }

  await sendPasswordResetEmail(user.id, user.email, user.name);

  return NextResponse.json({ success: true });
}
