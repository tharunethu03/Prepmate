import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

type CreateInterviewQuestion = {
  question: string;
  answer: string;
  keywords: string[];
};

type CreateInterviewBody = {
  title: string;
  role: string;
  description: string;
  topics: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  mode: "ai" | "custom";
  visibility: "public" | "private";
  questions: CreateInterviewQuestion[];
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateInterviewBody = await req.json();
    const {
      title,
      role,
      description,
      topics,
      difficulty,
      mode,
      visibility,
      questions,
    } = body;

    if (
      !title ||
      !role ||
      !description ||
      !Array.isArray(topics) ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    // Only creators and admins can create public interviews
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (visibility === "public" && user?.role === "STUDENT") {
      return NextResponse.json(
        { error: "Only creators can publish public interviews" },
        { status: 403 },
      );
    }

    const interview = await prisma.interview.create({
      data: {
        title,
        role,
        description,
        difficulty,
        topics,
        mode,
        visibility,
        questionCount: questions.length,
        createdBy: session.user.id,
        creatorField: session.user.field ?? null,
        questions: {
          create: questions.map((q, index) => ({
            order: index,
            question: q.question,
            answer: q.answer,
            keywords: q.keywords,
            topics,
          })),
        },
      },
    });

    // Award XP for creating an interview (creators only)
    if (user?.role === "CREATOR" || user?.role === "ADMIN") {
      await prisma.xpEvent.create({
        data: {
          userId: session.user.id,
          amount: 50,
          reason: "INTERVIEW_CREATED",
          refId: interview.id,
        },
      });
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: { increment: 50 },
        },
      });
    }

    return NextResponse.json(interview);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create interview" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const visibility = searchParams.get("visibility");
    const mine = searchParams.get("mine");
    const search = searchParams.get("search");
    const difficulty = searchParams.get("difficulty");
    const topic = searchParams.get("topic");
    const trending = searchParams.get("trending");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const saved = searchParams.get("saved");

    const session = await getServerSession(authOptions);

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const where: Prisma.InterviewWhereInput = {};

    if (visibility === "public" || visibility === "private") {
      where.visibility = visibility;
    }
    if (mine === "true") {
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      where.createdBy = session.user.id;
    }
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }
    if (
      difficulty === "beginner" ||
      difficulty === "intermediate" ||
      difficulty === "advanced"
    ) {
      where.difficulty = difficulty;
    }
    if (topic) {
      where.topics = { has: topic };
    }
    if (trending === "true") {
      where.createdAt = { gte: thirtyDaysAgo, lte: now };
    }
    if (saved === "true") {
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      where.savedInterviews = { some: { userId: session.user.id } };
    }

    const interviews = await prisma.interview.findMany({
      where,
      orderBy:
        trending === "true"
          ? { attempts: { _count: "desc" } } // was: candidates
          : { createdAt: "desc" },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        // Show avatars of first 5 people who attempted
        attempts: {
          take: 5,
          where: { status: "SUBMITTED" },
          include: { user: { select: { id: true, avatar: true } } },
        },
        questions: {
          orderBy: { order: "asc" },
          select: { id: true, question: true, answer: true, keywords: true },
        },
        _count: { select: { attempts: true, likes: true } }, // was: candidates
        likes: {
          where: session ? { userId: session.user.id } : undefined,
          select: { id: true },
        },
        savedInterviews: session
          ? { where: { userId: session.user.id }, select: { id: true } }
          : false,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const formatted = interviews.map((i) => ({
      id: i.id,
      title: i.title,
      role: i.role,
      difficulty: i.difficulty,
      visibility: i.visibility,
      topics: i.topics,
      questionCount: i.questionCount,
      createdBy: i.createdBy,
      description: i.description,
      likes: i._count.likes,
      isLiked: session ? i.likes.length > 0 : false,
      isSaved: session ? (i.savedInterviews?.length ?? 0) > 0 : false,
      attemptCount: i._count.attempts, // was: candidateCount
      creator: i.creator,
      // Flatten attempts to just user avatars for the UI overlap display
      recentAttemptees: i.attempts.map((a) => ({
        id: a.user.id,
        avatar: a.user.avatar,
      })),
      questions: i.questions.map((q) => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        keywords: q.keywords,
      })),
    }));

    return NextResponse.json({ interviews: formatted });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 },
    );
  }
}
