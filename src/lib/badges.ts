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
  // Fetch everything we need in one parallel batch — the original code fired
  // allAttempts and resumeAttempt as separate sequential queries after the
  // Promise.all, which added two extra Atlas round trips every time
  const [
    user,
    attemptCount,
    friends,
    challengesSent,
    challengesReceived,
    interviewCount,
    likes,
    allAttempts,
    resumeAttempt,
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
      where: { challengedId: userId, status: { in: ["ACCEPTED", "COMPLETED"] } },
    }),
    prisma.interview.count({ where: { createdBy: userId } }),
    prisma.like.count({ where: { interview: { createdBy: userId } } }),
    prisma.interviewAttempt.findMany({
      where: { userId, status: "SUBMITTED" },
      select: { score: true },
    }),
    prisma.interviewAttempt.findFirst({
      where: { userId, status: "SUBMITTED", interview: { source: "resume" } },
      select: { id: true },
    }),
  ]);

  const level = user?.level ?? 1;
  const maxScore = allAttempts.reduce(
    (max, a) => Math.max(max, a.score ?? 0),
    0,
  );

  // Determine which badge keys this user qualifies for right now
  const eligibleKeys: string[] = [];
  if (attemptCount >= 1) eligibleKeys.push("FIRST_INTERVIEW");
  if (attemptCount >= 5) eligibleKeys.push("FIVE_INTERVIEWS");
  if (attemptCount >= 25) eligibleKeys.push("TWENTY_FIVE_INTERVIEWS");
  if (attemptCount >= 100) eligibleKeys.push("HUNDRED_INTERVIEWS");
  if (maxScore >= 80) eligibleKeys.push("SCORE_80");
  if (maxScore >= 100) eligibleKeys.push("SCORE_100");
  if (friends >= 1) eligibleKeys.push("FIRST_FRIEND");
  if (friends >= 5) eligibleKeys.push("FIVE_FRIENDS");
  if (challengesSent >= 1) eligibleKeys.push("FIRST_CHALLENGE_SENT");
  if (challengesReceived >= 1) eligibleKeys.push("FIRST_CHALLENGE_ACCEPTED");
  if (interviewCount >= 1) eligibleKeys.push("FIRST_INTERVIEW_CREATED");
  if (interviewCount >= 10) eligibleKeys.push("TEN_INTERVIEWS_CREATED");
  if (likes >= 10) eligibleKeys.push("TEN_LIKES");
  if (user?.profileCompleted) eligibleKeys.push("PROFILE_COMPLETE");
  if (level >= 5) eligibleKeys.push("LEVEL_5");
  if (level >= 10) eligibleKeys.push("LEVEL_10");
  if (level >= 20) eligibleKeys.push("LEVEL_20");
  if (resumeAttempt) eligibleKeys.push("RESUME_INTERVIEW");

  if (eligibleKeys.length === 0) return;

  // One round trip to get badge definitions, one to get already-earned ones —
  // instead of 3–5 queries per badge key like the old sequential awardBadge loop
  const [allBadges, alreadyEarned] = await Promise.all([
    prisma.badge.findMany({ where: { key: { in: eligibleKeys } } }),
    prisma.userBadge.findMany({
      where: { userId, badge: { key: { in: eligibleKeys } } },
      include: { badge: { select: { key: true } } },
    }),
  ]);

  const earnedKeys = new Set(alreadyEarned.map((ub) => ub.badge.key));
  const newBadges = allBadges.filter((b) => !earnedKeys.has(b.key));

  if (newBadges.length === 0) return;

  // Write all new badge rows in one shot, then award their combined XP once
  // (no skipDuplicates needed — we already filtered earnedKeys above)
  await prisma.userBadge.createMany({
    data: newBadges.map((b) => ({ userId, badgeId: b.id })),
  });

  const totalXp = newBadges.reduce((sum, b) => sum + b.xpReward, 0);
  if (totalXp > 0) {
    await awardXp(userId, totalXp, XpReason.BADGE_EARNED);
  }
}
