import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/friends — get friends list + pending requests
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [friendships, pendingReceived, pendingSent] = await Promise.all([
    // All accepted friendships (user can be either side)
    prisma.friendship.findMany({
      where: { OR: [{ friendAId: userId }, { friendBId: userId }] },
      include: {
        friendA: {
          select: { id: true, name: true, avatar: true, level: true, xp: true },
        },
        friendB: {
          select: { id: true, name: true, avatar: true, level: true, xp: true },
        },
      },
    }),
    // Requests other people sent to me
    prisma.friendRequest.findMany({
      where: { receiverId: userId, status: "PENDING" },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    }),
    // Requests I sent (so UI can show "pending" state)
    prisma.friendRequest.findMany({
      where: { senderId: userId, status: "PENDING" },
      include: {
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    }),
  ]);

  // Flatten friendships to just the other person
  const friends = friendships.map((f) => {
    const other = f.friendAId === userId ? f.friendB : f.friendA;
    return { ...other, friendshipId: f.id };
  });

  return NextResponse.json({ friends, pendingReceived, pendingSent });
}

// POST /api/friends — send a friend request
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { receiverId } = await req.json();
  const senderId = session.user.id;

  if (!receiverId)
    return NextResponse.json({ error: "receiverId required" }, { status: 400 });
  if (receiverId === senderId)
    return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });

  // Check already friends
  const [a, b] = [senderId, receiverId].sort();
  const alreadyFriends = await prisma.friendship.findUnique({
    where: { friendAId_friendBId: { friendAId: a, friendBId: b } },
  });
  if (alreadyFriends)
    return NextResponse.json({ error: "Already friends" }, { status: 409 });

  // Check duplicate request
  const existing = await prisma.friendRequest.findUnique({
    where: { senderId_receiverId: { senderId, receiverId } },
  });
  if (existing)
    return NextResponse.json(
      { error: "Request already sent" },
      { status: 409 },
    );

  const request = await prisma.friendRequest.create({
    data: { senderId, receiverId },
  });

  return NextResponse.json(request, { status: 201 });
}
