import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { ResumeSnapshot } from "../parse/route";

type GenerateBody = {
  snapshot: ResumeSnapshot;
  difficulty: "beginner" | "intermediate" | "advanced";
  questionCount: number;
  interviewType: "technical" | "behavioral" | "hr" | "mixed";
};

type GeneratedQuestion = {
  question: string;
  answer: string;
  keywords: string[];
  topics: string[];
};

async function generateResumeQuestions(
  snapshot: ResumeSnapshot,
  difficulty: string,
  questionCount: number,
  interviewType: string,
): Promise<GeneratedQuestion[] | null> {
  const typeDesc = {
    technical:
      "technical/coding questions that probe the candidate's hands-on experience with their listed technologies",
    behavioral:
      "behavioral STAR-method questions about their specific work experiences and achievements",
    hr: "HR questions about their career goals, motivations, and culture fit based on their background",
    mixed:
      "a mix of technical, behavioral, and situational questions all grounded in their resume",
  }[interviewType] ?? "mixed interview questions";

  const jobSummary = snapshot.recentJobs
    .map((j) => `${j.title} at ${j.company}${j.duration ? ` (${j.duration})` : ""}`)
    .join(", ");

  const prompt = `You are an expert interviewer. Generate exactly ${questionCount} ${typeDesc} for this specific candidate.

Candidate profile:
- Role: ${snapshot.detectedRole} (${snapshot.seniorityLevel}, ${snapshot.yearsOfExperience})
- Recent jobs: ${jobSummary || "not specified"}
- Technologies: ${snapshot.technologies.join(", ") || "not specified"}
- Skills: ${snapshot.skills.join(", ") || "not specified"}
- Key highlights: ${snapshot.keyHighlights.join(" | ") || "not specified"}
- Difficulty: ${difficulty}

IMPORTANT rules:
1. Reference specific technologies from their resume (e.g. "You've worked with Redis — explain how you used it for caching")
2. Reference specific companies or projects where relevant (e.g. "At Acme Corp you led a team — describe your approach")
3. Questions must be personalised, NOT generic
4. Scale depth to difficulty: beginner=conceptual, intermediate=applied, advanced=deep/architectural

Return ONLY a valid JSON array with exactly ${questionCount} items. No markdown, no code fences.
Each item:
{
  "question": "personalised question referencing their resume",
  "answer": "detailed ideal answer (2-4 sentences)",
  "keywords": ["4-8 lowercase key terms"],
  "topics": ["1-3 topic tags e.g. Redis, System Design, Leadership"]
}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are an expert interviewer. Always respond with valid raw JSON only. No markdown, no code fences.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let questions: GeneratedQuestion[];
    try {
      questions = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (!match) return null;
      questions = JSON.parse(match[0]);
    }

    if (!Array.isArray(questions)) return null;
    return questions;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: GenerateBody = await req.json();
  const { snapshot, difficulty, questionCount, interviewType } = body;

  if (!snapshot || !difficulty || !questionCount || !interviewType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (questionCount < 3 || questionCount > 15) {
    return NextResponse.json(
      { error: "Question count must be between 3 and 15" },
      { status: 400 },
    );
  }

  const questions = await generateResumeQuestions(
    snapshot,
    difficulty,
    questionCount,
    interviewType,
  );

  if (!questions || questions.length === 0) {
    return NextResponse.json(
      { error: "Failed to generate questions. Please try again." },
      { status: 500 },
    );
  }

  // Create interview + questions in DB
  const title = `Resume Interview — ${snapshot.detectedRole}`;
  const description = `Personalised interview generated from your resume. Covers your experience as a ${snapshot.detectedRole} with ${snapshot.yearsOfExperience} of experience, focusing on ${snapshot.technologies.slice(0, 3).join(", ")}.`;

  const interview = await prisma.interview.create({
    data: {
      title,
      role: snapshot.detectedRole,
      description,
      difficulty,
      topics: snapshot.technologies.slice(0, 8),
      mode: "ai",
      visibility: "private",
      interviewType,
      questionCount: questions.length,
      createdBy: session.user.id,
      creatorField: session.user.field ?? null,
      source: "resume",
      questions: {
        create: questions.map((q, i) => ({
          order: i,
          question: q.question,
          answer: q.answer,
          keywords: q.keywords,
          topics: q.topics ?? [],
        })),
      },
    },
  });

  return NextResponse.json({ interviewId: interview.id });
}
