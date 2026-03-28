import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export type WeakTopic = {
  topic: string;
  avgScore: number;
  questionCount: number;
  trend: "improving" | "declining" | "stable";
};

export type WeakAreasResponse = {
  hasEnoughData: boolean; // false when fewer than 5 total scored responses
  totalResponsesAnalyzed: number;
  weakTopics: WeakTopic[]; // sorted worst-first, max 6
  aiInsights: string[]; // 3 personalized pattern sentences from Groq
  strongTopics: WeakTopic[]; // topics user does well in, max 3
};

async function generateInsights(
  weakTopics: { topic: string; avgScore: number }[],
  missingPatterns: string[],
): Promise<string[]> {
  if (!process.env.GROQ_API_KEY || missingPatterns.length === 0) return [];

  const topicSummary = weakTopics
    .slice(0, 5)
    .map((t) => `${t.topic} (avg ${t.avgScore}%)`)
    .join(", ");

  const patterns = missingPatterns.slice(0, 25).join("\n- ");

  const prompt = `You are a career coach analysing interview performance data. Based on the patterns below, write exactly 3 short, specific, actionable insights about what this candidate consistently struggles with.

Weak topics: ${topicSummary}

Common gaps from AI feedback:
- ${patterns}

Rules:
- Each insight must be one sentence, max 20 words
- Start each with "You tend to..." or "Your answers often..." or "You consistently..."
- Be specific to the actual content gaps, not generic advice
- Do NOT suggest "practice more" generically — name the specific concept

Return ONLY raw JSON (no markdown): {"insights": ["...", "...", "..."]}`;

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
        temperature: 0.4,
        max_tokens: 200,
      }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed: { insights: string[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) return [];
      parsed = JSON.parse(match[0]);
    }

    if (!Array.isArray(parsed.insights)) return [];
    return parsed.insights.filter((s) => typeof s === "string").slice(0, 3);
  } catch {
    return [];
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch last 60 submitted attempts with full response + question data
  const attempts = await prisma.interviewAttempt.findMany({
    where: { userId: session.user.id, status: "SUBMITTED" },
    orderBy: { submittedAt: "desc" },
    take: 60,
    include: {
      responses: {
        include: {
          question: {
            select: { topics: true, question: true },
          },
        },
      },
    },
  });

  // ── Aggregate by topic ─────────────────────────────────────────────────
  type TopicEntry = {
    scores: number[];
    feedbacks: string[];
    recentScores: number[]; // last 5 for trend
  };
  const topicMap = new Map<string, TopicEntry>();

  let totalResponses = 0;

  // Process oldest → newest so recentScores ends up as the latest
  const chronological = [...attempts].reverse();

  for (const attempt of chronological) {
    for (const response of attempt.responses) {
      totalResponses++;
      for (const topic of response.question.topics) {
        if (!topic.trim()) continue;
        const key = topic.trim().toLowerCase();
        if (!topicMap.has(key)) {
          topicMap.set(key, { scores: [], feedbacks: [], recentScores: [] });
        }
        const entry = topicMap.get(key)!;
        entry.scores.push(response.questionScore);
        if (response.aiFeedback) entry.feedbacks.push(response.aiFeedback);
        // Keep rolling last-5 for trend
        entry.recentScores.push(response.questionScore);
        if (entry.recentScores.length > 5) entry.recentScores.shift();
      }
    }
  }

  const MIN_RESPONSES = 5;
  const WEAK_THRESHOLD = 65;
  const MIN_TOPIC_COUNT = 2;

  if (totalResponses < MIN_RESPONSES) {
    return NextResponse.json({
      hasEnoughData: false,
      totalResponsesAnalyzed: totalResponses,
      weakTopics: [],
      aiInsights: [],
      strongTopics: [],
    } satisfies WeakAreasResponse);
  }

  // ── Build ranked topic list ────────────────────────────────────────────
  const ranked = Array.from(topicMap.entries())
    .filter(([, e]) => e.scores.length >= MIN_TOPIC_COUNT)
    .map(([topic, e]) => {
      const avgScore = Math.round(
        e.scores.reduce((a, b) => a + b, 0) / e.scores.length,
      );

      // Trend: compare first half vs second half of recentScores
      let trend: WeakTopic["trend"] = "stable";
      if (e.recentScores.length >= 4) {
        const mid = Math.floor(e.recentScores.length / 2);
        const firstHalf = e.recentScores.slice(0, mid);
        const secondHalf = e.recentScores.slice(mid);
        const firstAvg =
          firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg =
          secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        if (secondAvg - firstAvg > 8) trend = "improving";
        else if (firstAvg - secondAvg > 8) trend = "declining";
      }

      return {
        topic: topic
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        avgScore,
        questionCount: e.scores.length,
        trend,
        feedbacks: e.feedbacks,
      };
    })
    .sort((a, b) => a.avgScore - b.avgScore);

  const weakTopics: WeakTopic[] = ranked
    .filter((t) => t.avgScore < WEAK_THRESHOLD)
    .slice(0, 6)
    .map(({ feedbacks: _f, ...rest }) => rest);

  const strongTopics: WeakTopic[] = ranked
    .filter((t) => t.avgScore >= 75)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 3)
    .map(({ feedbacks: _f, ...rest }) => rest);

  // ── Extract "Missing:" patterns for AI ────────────────────────────────
  const missingPatterns = ranked
    .filter((t) => t.avgScore < WEAK_THRESHOLD)
    .flatMap((t) => t.feedbacks)
    .map((f) => {
      const after = f.split(/Missing:/i)[1];
      return after?.trim() ?? "";
    })
    .filter((s) => s.length > 5)
    .slice(0, 25);

  const aiInsights = await generateInsights(weakTopics, missingPatterns);

  return NextResponse.json({
    hasEnoughData: true,
    totalResponsesAnalyzed: totalResponses,
    weakTopics,
    aiInsights,
    strongTopics,
  } satisfies WeakAreasResponse);
}
