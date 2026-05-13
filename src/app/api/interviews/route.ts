import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { awardXp } from "@/lib/xp";
import { XpReason } from "@/generated/prisma/client";
import { checkAndAwardBadges } from "@/lib/badges";

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
  creatorField?: string | null;
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
      creatorField,
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
        creatorField: creatorField ?? session.user.field ?? null,
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

    await checkAndAwardBadges(session.user.id);

    // Award XP for creating an interview (creators only)
    if (user?.role === "CREATOR" || user?.role === "ADMIN") {
      await awardXp(
        session.user.id,
        50,
        XpReason.INTERVIEW_CREATED,
        interview.id,
      );
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
    const following = searchParams.get("following");
    const popular = searchParams.get("popular");
    const creators = searchParams.get("creators");
    // When set, interviews from this field are surfaced first (page 1 only)
    const field = searchParams.get("field");

    if (creators === "true") {
      where.visibility = "public";
      where.creator = {
        role: "CREATOR",
      };
    }
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
    if (following === "true") {
      if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      // Need a separate query here because Prisma doesn't support nested relation
      // filters for `where.createdBy` directly — fetch followed IDs first
      const followedCreators = await prisma.creatorFollow.findMany({
        where: { followerId: session.user.id },
        select: { creatorId: true },
      });

      where.createdBy = {
        in: followedCreators.map((f) => f.creatorId),
      };
      where.visibility = "public";
    }

    const orderByClause =
      trending === "true"
        ? { attempts: { _count: "desc" as const } }
        : popular === "true"
          ? { likes: { _count: "desc" as const } }
          : { createdAt: "desc" as const };

    // When a field is requested on page 1, fetch 2× the limit so we can
    // pull field-matched interviews to the front without missing any
    const fetchLimit = field && page === 1 ? limit * 2 : limit;
    const fetchSkip = field && page === 1 ? 0 : (page - 1) * limit;

    const interviews = await prisma.interview.findMany({
      where,
      orderBy: orderByClause,
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        // Fetch up to 20 recent attemptees so we can deduplicate down to 5 unique avatars —
        // without a take limit a popular interview could return thousands of rows here
        attempts: {
          where: { status: "SUBMITTED" },
          include: { user: { select: { id: true, avatar: true } } },
          orderBy: { startedAt: "desc" },
          take: 20,
        },
        questions: {
          orderBy: { order: "asc" },
          select: { id: true, question: true, answer: true, keywords: true },
        },
        _count: { select: { attempts: true, likes: true } },
        likes: {
          where: session ? { userId: session.user.id } : undefined,
          select: { id: true },
        },
        savedInterviews: session
          ? { where: { userId: session.user.id }, select: { id: true } }
          : false,
      },
      skip: fetchSkip,
      take: fetchLimit,
    });

    // Sort field-matched interviews first when a field is requested on page 1 —
    // field-matched come first, everything else fills the rest of the page
    const sortedInterviews =
      field && page === 1
        ? [
            ...interviews.filter((i) => i.creatorField === field),
            ...interviews.filter((i) => i.creatorField !== field),
          ].slice(0, limit)
        : interviews;

    const formatted = sortedInterviews.map((i) => {
      // Deduplicate attemptees per interview
      const seenUserIds = new Set<string>();
      const uniqueAttemptees = i.attempts
        .filter((a) => {
          if (seenUserIds.has(a.user.id)) return false;
          seenUserIds.add(a.user.id);
          return true;
        })
        .slice(0, 5);

      return {
        id: i.id,
        title: i.title,
        role: i.role,
        difficulty: i.difficulty,
        visibility: i.visibility,
        topics: i.topics,
        questionCount: i.questionCount,
        createdBy: i.createdBy,
        description: i.description,
        creatorField: i.creatorField,
        likes: i._count.likes,
        isLiked: session ? i.likes.length > 0 : false,
        isSaved: session ? (i.savedInterviews?.length ?? 0) > 0 : false,
        attemptCount: i._count.attempts,
        creator: i.creator,
        recentAttemptees: uniqueAttemptees.map((a) => ({
          id: a.user.id,
          avatar: a.user.avatar,
        })),
        questions: i.questions.map((q) => ({
          id: q.id,
          question: q.question,
          answer: q.answer,
          keywords: q.keywords,
        })),
      };
    });

    return NextResponse.json({ interviews: formatted });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 },
    );
  }
}
