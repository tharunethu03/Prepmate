import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, emailVerified: true, name: true },
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.emailVerified)
    return NextResponse.json(
      { error: "Email already verified" },
      { status: 400 },
    );

  await sendVerificationEmail(session.user.id, user.email, user.name ?? null);

  return NextResponse.json({ success: true });
}
