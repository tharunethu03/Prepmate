import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ error: "missing-token" }, { status: 400 });

  const pending = await prisma.pendingRegistration.findUnique({
    where: { token },
  });

  if (!pending)
    return NextResponse.json({ error: "invalid-token" }, { status: 400 });

  if (pending.expires < new Date())
    return NextResponse.json({ error: "token-expired" }, { status: 400 });

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

  return NextResponse.json({ ok: true });
}
