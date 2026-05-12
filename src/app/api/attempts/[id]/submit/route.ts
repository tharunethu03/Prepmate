import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { checkAndAwardBadges } from "@/lib/badges";

type SubmitBody = {
  responses: { questionId: string; userAnswer: string }[];
};

function scoreAnswer(
  userAnswer: string,
  keywords: string[],
): {
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

async function scoreWithAI(
  questionText: string,
  idealAnswer: string,
  userAnswer: string,
): Promise<{ aiScore: number; feedback: string } | null> {
  if (!userAnswer || userAnswer === "No answer" || userAnswer === "Did not know")
    return null;

  const prompt = `You are a strict but fair technical interviewer. Score this answer and give concise feedback.

Question: "${questionText}"
Ideal answer: "${idealAnswer}"
Candidate's answer: "${userAnswer}"

Return ONLY raw JSON (no markdown):
{"aiScore": <number 0-100>, "feedback": "Strengths: <what they got right>. Missing: <what was lacking or absent>."}

Score 0 if completely wrong/empty, 100 if perfect. Be accurate and specific in feedback.`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed: { aiScore: number; feedback: string };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) return null;
      parsed = JSON.parse(match[0]);
    }

    if (typeof parsed.aiScore !== "number") return null;
    parsed.aiScore = Math.max(0, Math.min(100, Math.round(parsed.aiScore)));
    return parsed;
  } catch {
    return null;
  }
}

// XP tiers — higher scores get meaningfully more XP to incentivise quality answers
function calculateXp(score: number): number {
  if (score >= 90) return 150;
  if (score >= 75) return 120;
  if (score >= 50) return 100;
  if (score >= 25) return 60;
  return 30;
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
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
    return NextResponse.json(
      { error: "Attempt already submitted" },
      { status: 409 },
    );

  const questionMap = new Map(
    attempt.interview.questions.map((q) => [q.id, q]),
  );

  // Step 1: keyword scoring (fast, synchronous)
  const keywordScored = responses
    .map((r) => {
      const question = questionMap.get(r.questionId);
      if (!question) return null;
      const { matchedKeywords, questionScore } = scoreAnswer(
        r.userAnswer,
        question.keywords,
      );
      return {
        attemptId,
        questionId: r.questionId,
        userAnswer: r.userAnswer,
        matchedKeywords,
        keywordScore: questionScore,
        question,
      };
    })
    .filter(Boolean) as {
    attemptId: string;
    questionId: string;
    userAnswer: string;
    matchedKeywords: string[];
    keywordScore: number;
    question: (typeof attempt.interview.questions)[0];
  }[];

  // Step 2: AI semantic scoring (parallel, graceful fallback)
  const aiResults = await Promise.all(
    keywordScored.map((r) =>
      scoreWithAI(r.question.question, r.question.answer, r.userAnswer),
    ),
  );

  // Step 3: composite score (60% AI + 40% keyword when AI available)
  const scoredResponses = keywordScored.map((r, i) => {
    const ai = aiResults[i];
    const finalScore = ai
      ? Math.round(r.keywordScore * 0.4 + ai.aiScore * 0.6)
      : r.keywordScore;
    return {
      attemptId: r.attemptId,
      questionId: r.questionId,
      userAnswer: r.userAnswer,
      matchedKeywords: r.matchedKeywords,
      questionScore: finalScore,
      aiFeedback: ai?.feedback ?? null,
    };
  });

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

    const currentUser = await tx.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true },
    });

    const currentXp = currentUser?.xp ?? 0;
    const newXp = currentXp + xpEarned;
    // Level formula: inverse of level² × 100 — so level 2 needs 100 XP, level 3 needs 400, etc.
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

    await tx.user.update({
      where: { id: session.user.id },
      data: { xp: newXp, level: newLevel },
    });

    // If this attempt was from a challenge, mark it completed
    if (attempt.challengeId) {
      await tx.challenge.update({
        where: { id: attempt.challengeId },
        data: { status: "COMPLETED" },
      });
    }

    return [updated];
  });

  await checkAndAwardBadges(session.user.id);

  // Fetch badges earned within the last 10 seconds — these are the ones
  // just awarded from this submission, shown as modals on the results page
  const userBadges = await prisma.userBadge.findMany({
    where: {
      userId: session.user.id,
      earnedAt: { gte: new Date(Date.now() - 10000) },
    },
    include: {
      badge: {
        select: {
          key: true,
          name: true,
          description: true,
          icon: true,
          xpReward: true,
        },
      },
    },
  });

  const newBadges = userBadges.map((ub) => ({
    key: ub.badge.key,
    name: ub.badge.name,
    description: ub.badge.description,
    emoji: ub.badge.icon,
    xpReward: ub.badge.xpReward,
  }));

  // Per-question breakdown for the results page
  const questionBreakdown = scoredResponses.map((r) => {
    const q = questionMap.get(r.questionId);
    return {
      questionId: r.questionId,
      questionText: q?.question ?? "",
      idealAnswer: q?.answer ?? "",
      userAnswer: r.userAnswer,
      questionScore: r.questionScore,
      aiFeedback: r.aiFeedback,
    };
  });

  return NextResponse.json({
    attemptId: updatedAttempt.id,
    score: overallScore,
    xpEarned,
    questionBreakdown,
    newBadges,
  });
}
