import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/challenges — get challenges sent to me + ones I sent
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
          },
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
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ received, sent });
}

// POST /api/challenges — challenge a friend
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

  const challenge = await prisma.challenge.create({
    data: { challengerId, challengedId, interviewId, message: message ?? null },
  });

  // Small XP for sending a challenge
  await prisma.xpEvent.create({
    data: {
      userId: challengerId,
      amount: 10,
      reason: "CHALLENGE_SENT",
      refId: challenge.id,
    },
  });
  await prisma.user.update({
    where: { id: challengerId },
    data: { xp: { increment: 10 } },
  });

  return NextResponse.json(challenge, { status: 201 });
}
