import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("userId");

  // Viewing own profile or someone else's
  const isOwnProfile = !targetId || targetId === session?.user?.id;
  const userId = targetId ?? session?.user?.id;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      avatar: true,
      xp: true,
      level: true,
      role: true,
      field: true,
      email: true,
      roleTitle: true,
      portfolioLink: true,
      linkedinLink: true,
      githubLink: true,
      createdAt: true,
      showXp: true,
      showScore: true,
      showAttempts: true,
      _count: {
        select: {
          interviews: true,
          attempts: true,
          followers: true,
          following: true,
        },
      },
      badges: {
        include: {
          badge: {
            select: {
              key: true,
              name: true,
              description: true,
              icon: true,
              xpReward: true,
            },
          },
        },
        orderBy: { earnedAt: "desc" },
      },
      // Own profile gets all attempts, public gets none (we compute avg separately)
      attempts: isOwnProfile
        ? {
            where: { status: "SUBMITTED" },
            orderBy: { submittedAt: "desc" },
            take: 5,
            select: {
              id: true,
              score: true,
              xpEarned: true,
              submittedAt: true,
              interview: {
                select: { id: true, title: true, difficulty: true, role: true },
              },
            },
          }
        : false,
      interviews: {
        where: isOwnProfile ? {} : { visibility: "public" },
        orderBy: { createdAt: "desc" },
        take: isOwnProfile ? 100 : 6,
        select: {
          id: true,
          title: true,
          difficulty: true,
          visibility: true,
          questionCount: true,
          mode: true,
          topics: true,
          role: true,
          interviewType: true, // add this
          createdAt: true,
          _count: { select: { attempts: true, likes: true } },
        },
      },
    },
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Compute avg score for public profile display
  let avgScore: number | null = null;
  if (!isOwnProfile && user.showScore) {
    const result = await prisma.interviewAttempt.aggregate({
      where: { userId, status: "SUBMITTED" },
      _avg: { score: true },
    });
    avgScore = result._avg.score ? Math.round(result._avg.score) : null;
  }

  // Interview split for own profile
  const publicInterviews = user.interviews.filter(
    (i) => i.visibility === "public",
  );
  const privateInterviews = isOwnProfile
    ? user.interviews.filter((i) => i.visibility === "private")
    : [];

  // XP progress — inverse of the level formula used in submit/route.ts
  // level n starts at (n-1)² × 100 XP and ends at n² × 100 XP
  const currentLevelXp = Math.pow((user.level ?? 1) - 1, 2) * 100;
  const nextLevelXp = Math.pow(user.level ?? 1, 2) * 100;
  const xpIntoLevel = (user.xp ?? 0) - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  return NextResponse.json({
    ...user,
    isOwnProfile,
    avgScore,
    publicInterviews,
    privateInterviews,
    xpProgress: {
      current: xpIntoLevel,
      needed: xpNeeded,
      percent: Math.min(Math.round((xpIntoLevel / xpNeeded) * 100), 100),
      nextLevel: (user.level ?? 1) + 1,
    },
  });
}
