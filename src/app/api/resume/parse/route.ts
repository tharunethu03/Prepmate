import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export type ResumeSnapshot = {
  detectedRole: string;
  seniorityLevel: "junior" | "mid" | "senior" | "lead" | "unknown";
  yearsOfExperience: string;
  technologies: string[];
  skills: string[];
  recentJobs: { title: string; company: string; duration?: string }[];
  education: string;
  keyHighlights: string[]; // 3-5 bullet points for question hooks
  rawExcerpt: string; // first 500 chars of extracted text for debug
};

async function parseResumeWithAI(text: string): Promise<ResumeSnapshot | null> {
  const prompt = `You are a resume parser. Extract structured information from this resume text.

Resume text:
"""
${text.slice(0, 6000)}
"""

Return ONLY raw JSON (no markdown, no code fences):
{
  "detectedRole": "e.g. Frontend Developer",
  "seniorityLevel": "junior|mid|senior|lead|unknown",
  "yearsOfExperience": "e.g. 3 years",
  "technologies": ["React", "Node.js", "Redis"],
  "skills": ["REST API design", "Agile", "CI/CD"],
  "recentJobs": [
    { "title": "Software Engineer", "company": "Acme Corp", "duration": "2 years" }
  ],
  "education": "BSc Computer Science, University of XYZ",
  "keyHighlights": [
    "Built Redis caching layer at Acme Corp",
    "Led a team of 4 engineers at XYZ",
    "Implemented OAuth2 authentication system"
  ]
}

Rules:
- technologies: only concrete tools/languages/frameworks (max 12)
- skills: soft/methodological skills (max 8)
- recentJobs: last 3 jobs only
- keyHighlights: 3-5 specific, concrete achievements/responsibilities that can be turned into interview questions. Include the company name where relevant.
- If something is not found, use an empty array [] or "unknown"`;

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
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed: ResumeSnapshot;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) return null;
      parsed = JSON.parse(match[0]);
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("resume") as File | null;
  if (!file || file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Please upload a PDF file" },
      { status: 400 },
    );
  }

  // 5 MB limit
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5MB." },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // unpdf works in Node.js, edge, and serverless environments (no DOMMatrix needed)
    const { getDocumentProxy, extractText } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text: extractedText } = await extractText(pdf, { mergePages: true });

    if (!extractedText || extractedText.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract text from this PDF. Try a text-based PDF (not a scanned image).",
        },
        { status: 422 },
      );
    }

    const snapshot = await parseResumeWithAI(extractedText);

    if (!snapshot) {
      return NextResponse.json(
        { error: "Failed to analyse resume. Please try again." },
        { status: 500 },
      );
    }

    snapshot.rawExcerpt = extractedText.slice(0, 500);

    return NextResponse.json({ snapshot });
  } catch (err) {
    console.error("Resume parse error:", err);
    return NextResponse.json(
      { error: "Failed to process PDF. Please try again." },
      { status: 500 },
    );
  }
}
