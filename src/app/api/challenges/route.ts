import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { awardXp } from "@/lib/xp";
import { XpReason } from "@/generated/prisma/client";
import { checkAndAwardBadges } from "@/lib/badges";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [received, sent] = await Promise.all([
    prisma.challenge.findMany({
      where: { challengedId: userId },
      include: {
        challenger: { select: { id: true, name: true, avatar: true } },
        interview: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            questionCount: true,
            role: true,
            topics: true,
          },
        },
        attempts: {
          where: { userId },
          orderBy: { startedAt: "desc" },
          take: 1,
          select: { id: true, score: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.challenge.findMany({
      where: { challengerId: userId },
      include: {
        challenged: { select: { id: true, name: true, avatar: true } },
        interview: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            questionCount: true,
            role: true,
            topics: true,
          },
        },
        attempts: {
          where: { userId: { not: userId } },
          orderBy: { startedAt: "desc" },
          take: 1,
          select: { id: true, score: true, status: true, userId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ received, sent });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengedId, interviewId, message } = await req.json();
  const challengerId = session.user.id;

  if (!challengedId || !interviewId)
    return NextResponse.json(
      { error: "challengedId and interviewId required" },
      { status: 400 },
    );

  // Must be friends
  const [a, b] = [challengerId, challengedId].sort();
  const friendship = await prisma.friendship.findUnique({
    where: { friendAId_friendBId: { friendAId: a, friendBId: b } },
  });
  if (!friendship)
    return NextResponse.json(
      { error: "You can only challenge friends" },
      { status: 403 },
    );

  // Check interview exists and is accessible
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    select: { id: true, visibility: true, createdBy: true },
  });
  if (!interview)
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });

  const challenge = await prisma.challenge.create({
    data: { challengerId, challengedId, interviewId, message: message ?? null },
  });

  await checkAndAwardBadges(challengerId);

  await awardXp(challengerId, 10, XpReason.CHALLENGE_SENT, challenge.id);

  return NextResponse.json(challenge, { status: 201 });
}
