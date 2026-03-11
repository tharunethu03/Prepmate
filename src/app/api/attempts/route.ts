import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// POST /api/attempts — start a new attempt
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { interviewId, challengeId } = await req.json();

  if (!interviewId)
    return NextResponse.json(
      { error: "interviewId required" },
      { status: 400 },
    );

  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });
  if (!interview)
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });

  // Students can only attempt public interviews (or their own private ones)
  if (
    interview.visibility === "private" &&
    interview.createdBy !== session.user.id
  )
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Prevent duplicate in-progress attempts
  const existing = await prisma.interviewAttempt.findFirst({
    where: { userId: session.user.id, interviewId, status: "IN_PROGRESS" },
  });
  if (existing) return NextResponse.json(existing);

  const attempt = await prisma.interviewAttempt.create({
    data: {
      userId: session.user.id,
      interviewId,
      status: "IN_PROGRESS",
      ...(challengeId ? { challengeId } : {}),
    },
  });

  // If this came from a challenge, mark it accepted
  if (challengeId) {
    await prisma.challenge.update({
      where: { id: challengeId },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    });
  }

  return NextResponse.json(attempt, { status: 201 });
}
