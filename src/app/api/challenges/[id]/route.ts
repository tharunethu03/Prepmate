import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const { action } = await req.json();

  const challenge = await prisma.challenge.findUnique({ where: { id } });

  if (!challenge)
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  if (challenge.challengedId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (action === "decline") {
    await prisma.challenge.update({
      where: { id },
      data: { status: "DECLINED", respondedAt: new Date() },
    });
    return NextResponse.json({ status: "declined" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
