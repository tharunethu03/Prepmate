import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time route to promote an email to ADMIN
// Protected by a secret key — DELETE this route after first use
export async function POST(req: Request) {
  const { email, secret } = await req.json();

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json({ success: true, user });
}
