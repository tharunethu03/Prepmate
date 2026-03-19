import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/creators — discover creators with follow status
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Get IDs of creators user already follows
  const following = await prisma.creatorFollow.findMany({
    where: { followerId: userId },
    select: { creatorId: true },
  });
  const followingIds = new Set(following.map((f) => f.creatorId));

  // Get creators ordered by follower count
  const creators = await prisma.user.findMany({
    where: {
      role: "CREATOR",
      id: { not: userId },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      field: true,
      roleTitle: true,
      _count: {
        select: {
          followers: true,
          interviews: true,
        },
      },
    },
    orderBy: {
      followers: { _count: "desc" },
    },
    take: 10,
  });

  const result = creators.map((c) => ({
    ...c,
    isFollowing: followingIds.has(c.id),
  }));

  return NextResponse.json({ creators: result });
}

// POST /api/creators — follow or unfollow a creator
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { creatorId } = await req.json();
  const followerId = session.user.id;

  if (!creatorId)
    return NextResponse.json({ error: "creatorId required" }, { status: 400 });
  if (creatorId === followerId)
    return NextResponse.json(
      { error: "Cannot follow yourself" },
      { status: 400 },
    );

  const existing = await prisma.creatorFollow.findUnique({
    where: { followerId_creatorId: { followerId, creatorId } },
  });

  if (existing) {
    await prisma.creatorFollow.delete({
      where: { followerId_creatorId: { followerId, creatorId } },
    });
    return NextResponse.json({ following: false });
  }

  await prisma.creatorFollow.create({
    data: { followerId, creatorId },
  });

  return NextResponse.json({ following: true });
}
