import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const { id: interviewId } = await context.params;

  if (!interviewId) {
    return NextResponse.json(
      { error: "Interview ID is missing" },
      { status: 400 },
    );
  }

  // Toggle: unsave if already saved, save if not
  const existing = await prisma.savedInterview.findUnique({
    where: {
      userId_interviewId: {
        userId,
        interviewId,
      },
    },
  });

  if (existing) {
    await prisma.savedInterview.delete({
      where: {
        userId_interviewId: {
          userId,
          interviewId,
        },
      },
    });

    return NextResponse.json({ saved: false });
  }

  await prisma.savedInterview.create({
    data: {
      userId,
      interviewId,
    },
  });

  return NextResponse.json({ saved: true });
}
