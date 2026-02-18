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

    return NextResponse.json(interview);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create interview" },
      { status: 500 },
    );
  }
}

//Fetch all interviews
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

    //Prepare filters
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const where: Prisma.InterviewWhereInput = {};

    // Basic filters
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

    // Trending filter
    if (trending === "true") {
      where.createdAt = { gte: thirtyDaysAgo, lte: now };
    }

    //saved
    if (saved) {
      where.savedInterviews = {
        some: {
          userId: session?.user.id,
        },
      };
    }

    // Build the query object dynamically
    const interviews = await prisma.interview.findMany({
      where,
      orderBy:
        trending === "true"
          ? { candidates: { _count: "desc" } }
          : { createdAt: "desc" },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        candidates: {
          take: 5,
          include: { user: { select: { id: true, avatar: true } } },
        },
        _count: { select: { candidates: true, likes: true } },
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

    // Format results
    const formatted = interviews.map((i) => ({
      id: i.id,
      title: i.title,
      role: i.role,
      difficulty: i.difficulty,
      visibility: i.visibility,
      topics: i.topics,
      questionCount: i.questionCount,
      createdBy: i.createdBy,

      //Total likes count
      likes: i._count.likes,

      //Did current user like it?
      isLiked: session ? i.likes.length > 0 : false,

      isSaved: session ? (i.savedInterviews?.length ?? 0) > 0 : false,

      candidateCount: i._count.candidates,

      creator: i.creator,

      //Flatten candidates
      candidates: i.candidates.map((c) => ({
        id: c.user.id,
        avatar: c.user.avatar,
      })),
    }));

    return NextResponse.json({ interviews: formatted });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 },
    );
  }
}
