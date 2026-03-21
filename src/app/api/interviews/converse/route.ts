import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { converseRatelimit } from "@/lib/ratelimit";

type Message = { role: "user" | "assistant"; content: string };

type ConverseBody = {
  mode: "evaluate" | "check_ready";
  userMessage: string;
  currentQuestionIndex?: number;
  questions?: { id: string; question: string }[];
  history?: Message[];
  userName?: string;
  role?: string;
  difficulty?: string;
  interviewType?: string;
};

type EvaluateResponse = {
  message: string;
  action: "ready" | "hint" | "explain";
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (converseRatelimit) {
    const { success } = await converseRatelimit.limit(session.user.id);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 },
      );
    }
  }

  const body: ConverseBody = await req.json();

  if (body.mode === "check_ready") {
    const msg = body.userMessage?.toLowerCase() ?? "";
    const notReady = [
      "no",
      "not yet",
      "wait",
      "hold on",
      "nope",
      "actually",
    ].some((w) => msg.includes(w));
    return NextResponse.json({ ready: !notReady });
  }

  const {
    userMessage,
    currentQuestionIndex = 0,
    questions = [],
    history = [],
    userName = "there",
    role = "",
    difficulty = "",
    interviewType = "",
  } = body;

  const currentQuestion = questions[currentQuestionIndex];

  const systemPrompt = `You are Alex, a professional and encouraging interviewer conducting a ${difficulty} ${interviewType} interview for a ${role} position. You are interviewing ${userName}.

Current question: "${currentQuestion?.question}"

Your job is to evaluate the user's answer and decide what to do next.

ACTION RULES — pick exactly one:
- "ready": user gave any reasonable answer (even partial). Give a brief encouraging comment (1 sentence).
- "hint": user said they don't know, are confused, or asked for help. Give ONE helpful hint without revealing the full answer.
- "explain": user explicitly gave up or asked for the full answer. Explain briefly (2 sentences max).

DEFAULT to "ready" for any real attempt at answering — be generous.
Only use "hint" if user clearly says they don't know.
Only use "explain" if user explicitly gives up.

CRITICAL: Respond ONLY with raw JSON. No markdown. No extra text.
{"message": "your 1-2 sentence response", "action": "ready" | "hint" | "explain"}`;

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
          { role: "system", content: systemPrompt },
          ...history.slice(-2),
          { role: "user", content: userMessage ?? "" },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Groq error:", err);
      return NextResponse.json({
        message: "Good effort! Are you ready to move on?",
        action: "ready",
      });
    }

    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed: EvaluateResponse;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          parsed = {
            message: cleaned.replace(/\{.*\}/g, "").trim() || "Good answer!",
            action: "ready",
          };
        }
      } else {
        parsed = { message: cleaned || "Good answer!", action: "ready" };
      }
    }

    parsed.message =
      parsed.message?.replace(/\{[\s\S]*\}/g, "").trim() ?? "Good answer!";

    if (!["ready", "hint", "explain"].includes(parsed.action)) {
      parsed.action = "ready";
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Converse error:", error);
    return NextResponse.json({ message: "Good effort!", action: "ready" });
  }
}
