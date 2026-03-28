import prisma from "./prisma";
import { BADGES } from "./badge-definitions";
import { awardXp } from "./xp";
import { XpReason } from "@/generated/prisma/client";

export { BADGES } from "./badge-definitions";
export type { BadgeDef } from "./badge-definitions";

export async function seedBadges() {
  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      update: {
        name: badge.name,
        description: badge.description,
        icon: badge.emoji,
        xpReward: badge.xpReward,
      },
      create: {
        key: badge.key,
        name: badge.name,
        description: badge.description,
        icon: badge.emoji,
        xpReward: badge.xpReward,
      },
    });
  }
}

export async function awardBadge(userId: string, badgeKey: string) {
  const badge = await prisma.badge.findUnique({ where: { key: badgeKey } });
  if (!badge) return;

  const existing = await prisma.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
  });
  if (existing) return;

  await prisma.userBadge.create({
    data: { userId, badgeId: badge.id },
  });

  // Use top-level imports — no dynamic imports needed
  if (badge.xpReward > 0) {
    await awardXp(userId, badge.xpReward, XpReason.BADGE_EARNED, badge.id);
  }
}

export async function checkAndAwardBadges(userId: string) {
  const [
    user,
    attempts,
    friends,
    challengesSent,
    challengesReceived,
    interviews,
    likes,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { level: true, profileCompleted: true },
    }),
    prisma.interviewAttempt.count({ where: { userId, status: "SUBMITTED" } }),
    prisma.friendship.count({
      where: { OR: [{ friendAId: userId }, { friendBId: userId }] },
    }),
    prisma.challenge.count({ where: { challengerId: userId } }),
    prisma.challenge.count({
      where: {
        challengedId: userId,
        status: { in: ["ACCEPTED", "COMPLETED"] },
      },
    }),
    prisma.interview.count({ where: { createdBy: userId } }),
    prisma.like.count({ where: { interview: { createdBy: userId } } }),
  ]);

  // Activity badges
  if (attempts >= 1) await awardBadge(userId, "FIRST_INTERVIEW");
  if (attempts >= 5) await awardBadge(userId, "FIVE_INTERVIEWS");
  if (attempts >= 25) await awardBadge(userId, "TWENTY_FIVE_INTERVIEWS");
  if (attempts >= 100) await awardBadge(userId, "HUNDRED_INTERVIEWS");

  // Score badges
  const allAttempts = await prisma.interviewAttempt.findMany({
    where: { userId, status: "SUBMITTED" },
    select: { score: true },
  });
  if (allAttempts.some((a) => (a.score ?? 0) >= 80))
    await awardBadge(userId, "SCORE_80");
  if (allAttempts.some((a) => (a.score ?? 0) >= 100))
    await awardBadge(userId, "SCORE_100");

  // Social badges
  if (friends >= 1) await awardBadge(userId, "FIRST_FRIEND");
  if (friends >= 5) await awardBadge(userId, "FIVE_FRIENDS");
  if (challengesSent >= 1) await awardBadge(userId, "FIRST_CHALLENGE_SENT");
  if (challengesReceived >= 1)
    await awardBadge(userId, "FIRST_CHALLENGE_ACCEPTED");

  // Creator badges
  if (interviews >= 1) await awardBadge(userId, "FIRST_INTERVIEW_CREATED");
  if (interviews >= 10) await awardBadge(userId, "TEN_INTERVIEWS_CREATED");
  if (likes >= 10) await awardBadge(userId, "TEN_LIKES");

  // Profile badge
  if (user?.profileCompleted) await awardBadge(userId, "PROFILE_COMPLETE");

  // Level badges
  const level = user?.level ?? 1;
  if (level >= 5) await awardBadge(userId, "LEVEL_5");
  if (level >= 10) await awardBadge(userId, "LEVEL_10");
  if (level >= 20) await awardBadge(userId, "LEVEL_20");

  // Resume interview badge
  const resumeAttempt = await prisma.interviewAttempt.findFirst({
    where: {
      userId,
      status: "SUBMITTED",
      interview: { source: "resume" },
    },
    select: { id: true },
  });
  if (resumeAttempt) await awardBadge(userId, "RESUME_INTERVIEW");
}
