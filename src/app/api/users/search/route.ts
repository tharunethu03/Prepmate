import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) return NextResponse.json({ users: [] });

  const userId = session.user.id;

  // Get current friend IDs so we can show friendship status in results
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ friendAId: userId }, { friendBId: userId }] },
    select: { friendAId: true, friendBId: true },
  });
  const friendIds = new Set(
    friendships.map((f) =>
      f.friendAId === userId ? f.friendBId : f.friendAId,
    ),
  );

  // Get pending sent requests so UI can show "Request Sent"
  const sentRequests = await prisma.friendRequest.findMany({
    where: { senderId: userId, status: "PENDING" },
    select: { receiverId: true },
  });
  const sentToIds = new Set(sentRequests.map((r) => r.receiverId));

  // Get pending received requests
  const receivedRequests = await prisma.friendRequest.findMany({
    where: { receiverId: userId, status: "PENDING" },
    select: { senderId: true, id: true },
  });
  const receivedFromIds = new Map(
    receivedRequests.map((r) => [r.senderId, r.id]),
  );

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: userId } }, // exclude self
        {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      level: true,
      xp: true,
      role: true,
      field: true,
    },
    take: 10,
  });

  const results = users.map((u) => ({
    ...u,
    isFriend: friendIds.has(u.id),
    requestSent: sentToIds.has(u.id),
    requestReceived: receivedFromIds.has(u.id),
    friendRequestId: receivedFromIds.get(u.id) ?? null,
  }));

  return NextResponse.json({ users: results });
}
