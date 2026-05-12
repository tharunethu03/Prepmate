import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { awardXp } from "@/lib/xp";
import { XpReason } from "@/generated/prisma/client";

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

  // Toggle: unlike if already liked, like if not
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
  await awardXp(session.user.id, 5, XpReason.INTERVIEW_CREATED, interviewId);

  return NextResponse.json({ liked: true });
}
