import { requireAdmin } from "@/lib/requireAdmin";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    // MongoDB does not enforce cascading deletes at the DB level, so we must
    // manually remove all child records in dependency order before deleting
    // the interview itself.

    // 1. Collect attempt IDs so we can delete their question responses first
    const attempts = await prisma.interviewAttempt.findMany({
      where: { interviewId: id },
      select: { id: true },
    });
    const attemptIds = attempts.map((a) => a.id);

    // 2. QuestionResponse → InterviewAttempt (must go first)
    if (attemptIds.length > 0) {
      await prisma.questionResponse.deleteMany({
        where: { attemptId: { in: attemptIds } },
      });
    }

    // 3. InterviewAttempt → Interview
    await prisma.interviewAttempt.deleteMany({ where: { interviewId: id } });

    // 4. Like, SavedInterview, Challenge, Question → Interview (order among
    //    these doesn't matter; all reference the interview directly)
    await prisma.like.deleteMany({ where: { interviewId: id } });
    await prisma.savedInterview.deleteMany({ where: { interviewId: id } });
    await prisma.challenge.deleteMany({ where: { interviewId: id } });
    await prisma.question.deleteMany({ where: { interviewId: id } });

    // 5. Finally remove the interview itself
    await prisma.interview.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/interviews DELETE]", err);
    return NextResponse.json(
      { error: "Failed to delete interview" },
      { status: 500 },
    );
  }
}
