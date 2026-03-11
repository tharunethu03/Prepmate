import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { id: interviewId } = await context.params;

  if (!interviewId)
    return NextResponse.json(
      { error: "Interview ID missing" },
      { status: 400 },
    );

  const existing = await prisma.like.findFirst({
    where: { userId, interviewId },
  });

  if (existing) {
    await prisma.like.deleteMany({ where: { userId, interviewId } });
    return NextResponse.json({ liked: false });
  }

  await prisma.like.create({
    data: {
      user: { connect: { id: userId } },
      interview: { connect: { id: interviewId } },
    },
  });

  // Small XP reward for engaging with content
  await prisma.xpEvent.create({
    data: { userId, amount: 5, reason: "BADGE_EARNED", refId: interviewId },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: 5 } },
  });

  return NextResponse.json({ liked: true });
}
