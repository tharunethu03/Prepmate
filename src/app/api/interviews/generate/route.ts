import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { generateRatelimit } from "@/lib/ratelimit";

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

  if (generateRatelimit) {
    const { success, limit, remaining, reset } = await generateRatelimit.limit(
      session.user.id,
    );
    if (!success) {
      return NextResponse.json(
        {
          error:
            "You've reached your daily limit for AI generation. Try again tomorrow.",
          limit,
          remaining,
          reset,
        },
        { status: 429 },
      );
    }
  }

  const body = await req.json();
  const {
    role,
    topics,
    difficulty,
    interviewType,
    questionCount,
    existingQuestions,
  }: GenerateBody = body;

  // Different validation for enhance mode vs generate mode
  if (existingQuestions?.length) {
    if (!role || !difficulty)
      return NextResponse.json(
        { error: "role and difficulty required" },
        { status: 400 },
      );
  } else {
    if (
      !role ||
      !topics?.length ||
      !difficulty ||
      !interviewType ||
      !questionCount
    )
      return NextResponse.json(
        {
          error:
            "role, topics, difficulty, interviewType, questionCount required",
        },
        { status: 400 },
      );
  }

  const typeDescriptions = {
    technical:
      "technical/coding questions that test hard skills and technical knowledge",
    behavioral:
      "behavioral questions using the STAR method that assess soft skills and past experience",
    hr: "HR questions about motivation, culture fit, salary expectations, and career goals",
    mixed: "a mix of technical, behavioral, and situational questions",
  };

  const prompt = existingQuestions?.length
    ? `You are an expert interviewer. For each of the following interview questions for a ${difficulty}-level ${role} position, generate an ideal answer and keywords.

Questions:
${existingQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Return ONLY a valid JSON array with exactly ${existingQuestions.length} items. No markdown, no code fences, no explanation.

Each item must have exactly these fields:
- "question": the original question exactly as given (string)
- "answer": a detailed ideal answer (string, 2-4 sentences)
- "keywords": 4-8 key terms an ideal answer should contain (string array, all lowercase)

Example format:
[{"question":"...","answer":"...","keywords":["keyword1","keyword2"]}]`
    : `You are an expert interviewer. Generate exactly ${questionCount} ${typeDescriptions[interviewType]} for a ${difficulty}-level ${role} position.

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
