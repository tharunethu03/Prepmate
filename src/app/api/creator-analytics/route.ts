import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export type QuestionStat = {
  id: string;
  order: number;
  question: string;
  avgScore: number | null;
  responseCount: number;
};

export type InterviewAnalytic = {
  id: string;
  title: string;
  difficulty: string;
  role: string;
  createdAt: string;
  totalAttempts: number;
  avgScore: number | null;
  likes: number;
  questions: QuestionStat[];
};

export type CreatorAnalyticsResponse = {
  totalPublicInterviews: number;
  totalAttempts: number;
  overallAvgScore: number | null;
  interviews: InterviewAnalytic[];
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const interviews = await prisma.interview.findMany({
    where: { createdBy: session.user.id, visibility: "public" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { likes: true } },
      attempts: {
        where: { status: "SUBMITTED" },
        select: { score: true },
      },
      questions: {
        orderBy: { order: "asc" },
        include: {
          answerResponses: {
            select: { questionScore: true },
          },
        },
      },
    },
  });

  const result: InterviewAnalytic[] = interviews.map((iv) => {
    // Avg score across all submitted attempts
    const scores = iv.attempts
      .map((a) => a.score)
      .filter((s): s is number => s !== null);
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;

    // Per-question stats
    const questions: QuestionStat[] = iv.questions.map((q) => {
      const qScores = q.answerResponses.map((r) => r.questionScore);
      const qAvg =
        qScores.length > 0
          ? Math.round(qScores.reduce((a, b) => a + b, 0) / qScores.length)
          : null;
      return {
        id: q.id,
        order: q.order,
        question: q.question,
        avgScore: qAvg,
        responseCount: qScores.length,
      };
    });

    // Sort questions worst-first so creators see where people struggle
    questions.sort((a, b) => {
      if (a.avgScore === null) return 1;
      if (b.avgScore === null) return -1;
      return a.avgScore - b.avgScore;
    });

    return {
      id: iv.id,
      title: iv.title,
      difficulty: iv.difficulty,
      role: iv.role,
      createdAt: iv.createdAt.toISOString(),
      totalAttempts: iv.attempts.length,
      avgScore,
      likes: iv._count.likes,
      questions,
    };
  });

  // Sort by most attempted first
  result.sort((a, b) => b.totalAttempts - a.totalAttempts);

  const totalAttempts = result.reduce((s, iv) => s + iv.totalAttempts, 0);
  const allScores = result
    .map((iv) => iv.avgScore)
    .filter((s): s is number => s !== null);
  const overallAvgScore =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : null;

  const response: CreatorAnalyticsResponse = {
    totalPublicInterviews: result.length,
    totalAttempts,
    overallAvgScore,
    interviews: result,
  };

  return NextResponse.json(response);
}
