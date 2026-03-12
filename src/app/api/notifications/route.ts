import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [pendingRequests, pendingChallenges] = await Promise.all([
    prisma.friendRequest.findMany({
      where: { receiverId: userId, status: "PENDING" },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.challenge.findMany({
      where: { challengedId: userId, status: "PENDING" },
      include: {
        challenger: { select: { id: true, name: true, avatar: true } },
        interview: { select: { id: true, title: true, difficulty: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const notifications = [
    ...pendingRequests.map((r) => ({
      id: r.id,
      type: "FRIEND_REQUEST" as const,
      message: `${r.sender.name ?? "Someone"} sent you a friend request`,
      actor: r.sender,
      createdAt: r.createdAt,
      meta: { requestId: r.id },
    })),
    ...pendingChallenges.map((c) => ({
      id: c.id,
      type: "CHALLENGE" as const,
      message: `${c.challenger.name ?? "Someone"} challenged you to "${c.interview.title}"`,
      actor: c.challenger,
      createdAt: c.createdAt,
      meta: {
        challengeId: c.id,
        interviewId: c.interview.id,
        difficulty: c.interview.difficulty,
      },
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({
    notifications,
    unreadCount: notifications.length,
  });
}