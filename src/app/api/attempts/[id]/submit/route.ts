import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type SubmitBody = {
  responses: { questionId: string; userAnswer: string }[];
};

function scoreAnswer(userAnswer: string, keywords: string[]): {
  matchedKeywords: string[];
  questionScore: number;
} {
  if (!keywords.length) return { matchedKeywords: [], questionScore: 100 };
  const lower = userAnswer.toLowerCase();
  const matched = keywords.filter((k) => lower.includes(k.toLowerCase()));
  return {
    matchedKeywords: matched,
    questionScore: Math.round((matched.length / keywords.length) * 100),
  };
}

function calculateXp(score: number): number {
  if (score >= 90) return 150;
  if (score >= 75) return 120;
  if (score >= 50) return 100;
  if (score >= 25) return 60;
  return 30;
}

function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: attemptId } = await context.params;
  const { responses }: SubmitBody = await req.json();

  if (!Array.isArray(responses) || responses.length === 0)
    return NextResponse.json({ error: "responses required" }, { status: 400 });

  const attempt = await prisma.interviewAttempt.findUnique({
    where: { id: attemptId },
    include: { interview: { include: { questions: true } } },
  });

  if (!attempt)
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  if (attempt.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (attempt.status !== "IN_PROGRESS")
    return NextResponse.json({ error: "Attempt already submitted" }, { status: 409 });

  const questionMap = new Map(
    attempt.interview.questions.map((q) => [q.id, q])
  );

  const scoredResponses = responses.map((r) => {
    const question = questionMap.get(r.questionId);
    if (!question) return null;
    const { matchedKeywords, questionScore } = scoreAnswer(
      r.userAnswer,
      question.keywords
    );
    return {
      attemptId,
      questionId: r.questionId,
      userAnswer: r.userAnswer,
      matchedKeywords,
      questionScore,
    };
  }).filter(Boolean) as {
    attemptId: string;
    questionId: string;
    userAnswer: string;
    matchedKeywords: string[];
    questionScore: number;
  }[];

  const overallScore =
    scoredResponses.reduce((sum, r) => sum + r.questionScore, 0) /
    scoredResponses.length;

  const xpEarned = calculateXp(overallScore);

  const [updatedAttempt] = await prisma.$transaction(async (tx) => {
    await tx.questionResponse.createMany({ data: scoredResponses });

    const updated = await tx.interviewAttempt.update({
      where: { id: attemptId },
      data: {
        status: "SUBMITTED",
        score: overallScore,
        xpEarned,
        submittedAt: new Date(),
      },
    });

    await tx.xpEvent.create({
      data: {
        userId: session.user.id,
        amount: xpEarned,
        reason: "INTERVIEW_COMPLETED",
        refId: attemptId,
      },
    });

    const user = await tx.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: xpEarned } },
      select: { xp: true },
    });

    await tx.user.update({
      where: { id: session.user.id },
      data: { level: calculateLevel(user.xp) },
    });

    if (attempt.challengeId) {
      await tx.challenge.update({
        where: { id: attempt.challengeId },
        data: { status: "COMPLETED" },
      });
    }

    return [updated];
  });

  return NextResponse.json({
    attemptId: updatedAttempt.id,
    score: overallScore,
    xpEarned,
    responses: scoredResponses,
  });
}
