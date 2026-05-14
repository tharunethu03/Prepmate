import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: Props) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: "asc" } },
        creator: { select: { id: true, name: true, avatar: true } },
        _count: { select: { attempts: true, likes: true } },
        likes: session
          ? { where: { userId: session.user.id }, select: { id: true } }
          : false,
        savedInterviews: session
          ? { where: { userId: session.user.id }, select: { id: true } }
          : false,
        attempts: {
          where: { status: "SUBMITTED" },
          include: { user: { select: { id: true, avatar: true } } },
          orderBy: { startedAt: "desc" },
        },
      },
    });

    if (!interview)
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 },
      );

    // Deduplicate attemptees before returning
    const seenIds = new Set<string>();
    const uniqueAttemptees = (interview.attempts ?? [])
      .filter((a) => {
        if (seenIds.has(a.user.id)) return false;
        seenIds.add(a.user.id);
        return true;
      })
      .slice(0, 5);

    return NextResponse.json({
      id: interview.id,
      title: interview.title,
      role: interview.role,
      difficulty: interview.difficulty,
      visibility: interview.visibility,
      topics: interview.topics,
      questionCount: interview.questionCount,
      createdBy: interview.createdBy,
      description: interview.description,
      interviewType: interview.interviewType,
      mode: interview.mode,
      likes: interview._count.likes,
      isLiked: session ? (interview.likes?.length ?? 0) > 0 : false,
      isSaved: session ? (interview.savedInterviews?.length ?? 0) > 0 : false,
      likeCount: interview._count.likes,
      attemptCount: interview._count.attempts,
      recentAttemptees: uniqueAttemptees.map((a) => ({
        id: a.user.id,
        avatar: a.user.avatar,
      })),
      userAttempt: session ? (interview.attempts?.[0] ?? null) : null,
      creator: interview.creator,
      questions: interview.questions.map((q) => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        keywords: q.keywords,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch interview" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interview = await prisma.interview.findUnique({ where: { id } });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 },
      );
    }

    if (interview.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // MongoDB doesn't cascade deletes automatically, so we have to remove all
    // child records that reference this interview before deleting it.
    // Order matters: QuestionResponse → InterviewAttempt (via Prisma cascade),
    // then the rest, then the interview itself (Question cascades automatically).
    await prisma.$transaction([
      prisma.interviewAttempt.deleteMany({ where: { interviewId: id } }),
      prisma.like.deleteMany({ where: { interviewId: id } }),
      prisma.savedInterview.deleteMany({ where: { interviewId: id } }),
      prisma.challenge.deleteMany({ where: { interviewId: id } }),
      prisma.interview.delete({ where: { id } }),
    ]);

    return NextResponse.json(
      { message: "Interview deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete interview" },
      { status: 500 },
    );
  }
}
