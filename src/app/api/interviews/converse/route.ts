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
  idealAnswer?: string;
  history?: Message[];
  userName?: string;
  role?: string;
  difficulty?: string;
  interviewType?: string;
  hintCount?: number;
  isFollowUp?: boolean;
};

type EvaluateResponse = {
  message: string;
  action: "ready" | "hint" | "explain" | "followup";
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
    idealAnswer = "",
    history = [],
    userName = "there",
    role = "",
    difficulty = "",
    interviewType = "",
    hintCount = 0,
    isFollowUp = false,
  } = body;

  const currentQuestion = questions[currentQuestionIndex];

  const toneNote =
    hintCount >= 2
      ? "The user has struggled with hints — be extra warm, supportive, and encouraging."
      : "Be professional yet encouraging.";

  const followUpNote = isFollowUp
    ? 'This is already a follow-up question. You MUST use "ready" — do NOT generate another follow-up.'
    : "";

  const idealAnswerNote = idealAnswer
    ? `\nIdeal answer reference: "${idealAnswer}"`
    : "";

  const systemPrompt = `You are Alex, a professional interviewer conducting a ${difficulty} ${interviewType} interview for a ${role} position. You are interviewing ${userName}.
${toneNote}

Current question: "${currentQuestion?.question}"${idealAnswerNote}

Evaluate the user's answer and decide ONE action:

- "ready": The answer is strong, complete, or covers the key points well.
  Start with a natural conversational filler ("Great!", "Nice one.", "Interesting.", "Good point.", "Exactly.", "Well said."), then give 1 sentence of positive feedback. Move on — no follow-up.

- "followup": The answer is vague, partial, or lacks depth — but the user is genuinely trying.
  Start with a filler and brief feedback, then ask ONE short targeted follow-up to help them show more depth.
  Example: "Good start! Can you walk me through a concrete example?" or "Nice — how would that behave under heavy load?"
  ${followUpNote}

- "hint": The user clearly says they don't know or are confused. Give ONE helpful hint without revealing the full answer.

- "explain": The user explicitly gives up or asks for the answer. Briefly explain in 2 sentences max.

DEFAULT to "ready" for any real attempt — be generous. Use "followup" for incomplete but genuine attempts.
Only use "hint" if they clearly say they don't know. Only use "explain" if they explicitly give up.

CRITICAL: Respond ONLY with raw JSON. No markdown. No extra text.
{"message": "your response here", "action": "ready" | "followup" | "hint" | "explain"}`;

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
          ...history.slice(-4),
          { role: "user", content: userMessage ?? "" },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Groq error:", err);
      return NextResponse.json({
        message: "Good effort! Let's keep going.",
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

    if (!["ready", "hint", "explain", "followup"].includes(parsed.action)) {
      parsed.action = "ready";
    }

    // Safety: never return followup if this is already a follow-up
    if (isFollowUp && parsed.action === "followup") {
      parsed.action = "ready";
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Converse error:", error);
    return NextResponse.json({ message: "Good effort!", action: "ready" });
  }
}
