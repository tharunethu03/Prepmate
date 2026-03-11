import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type GenerateBody = {
  role: string;
  topics: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  interviewType: "technical" | "behavioral" | "hr" | "mixed";
  questionCount: number;
  existingQuestions?: string[];
};

type GeneratedQuestion = {
  question: string;
  answer: string;
  keywords: string[];
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    role,
    topics,
    difficulty,
    interviewType,
    questionCount,
    existingQuestions,
  }: GenerateBody = await req.json();

  if (!role || !topics?.length || !difficulty || !interviewType)
    return NextResponse.json(
      { error: "role, topics, difficulty, interviewType required" },
      { status: 400 },
    );

  const typeDescriptions = {
    technical:
      "technical/coding questions that test hard skills and technical knowledge",
    behavioral:
      "behavioral questions using the STAR method that assess soft skills and past experience",
    hr: "HR questions about motivation, culture fit, salary expectations, and career goals",
    mixed: "a mix of technical, behavioral, and situational questions",
  };

  // ── Two different prompts depending on mode ──────────────────
  const prompt = existingQuestions?.length
    ? // Custom mode: user provided questions, AI fills answers + keywords only
      `You are an expert interviewer. For each of the following interview questions for a ${difficulty}-level ${role} position, generate an ideal answer and keywords.

Questions:
${existingQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Return ONLY a valid JSON array with exactly ${existingQuestions.length} items. No markdown, no code fences, no explanation.

Each item must have exactly these fields:
- "question": the original question exactly as given (string)
- "answer": a detailed ideal answer (string, 2-4 sentences)
- "keywords": 4-8 key terms an ideal answer should contain (string array, all lowercase)

Example format:
[{"question":"...","answer":"...","keywords":["keyword1","keyword2"]}]`
    : // AI mode: generate everything from scratch
      `You are an expert interviewer. Generate exactly ${questionCount} ${typeDescriptions[interviewType]} for a ${difficulty}-level ${role} position.

Topics to cover: ${topics.join(", ")}

Return ONLY a valid JSON array with exactly ${questionCount} items. No markdown, no code fences, no explanation.

Each item must have exactly these fields:
- "question": the interview question (string)
- "answer": a detailed ideal answer (string, 2-4 sentences)
- "keywords": 4-8 key terms an ideal answer should contain (string array, all lowercase)

Example format:
[{"question":"...","answer":"...","keywords":["keyword1","keyword2"]}]`;

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
              "You are an expert interviewer. Always respond with valid raw JSON only. No markdown, no code fences, no explanation.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Groq error:", err);
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 500 },
      );
    }

    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let questions: GeneratedQuestion[];
    try {
      questions = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Groq response:", cleaned);
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 },
      );
    }

    if (!Array.isArray(questions))
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 },
      );

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 },
    );
  }
}
