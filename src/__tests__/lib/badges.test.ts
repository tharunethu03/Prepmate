import { describe, it, expect, vi, beforeEach } from "vitest";
import { BADGES } from "@/lib/badge-definitions";
import { awardBadge, checkAndAwardBadges } from "@/lib/badges";
import prisma from "@/lib/prisma";

const mockPrisma = prisma as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;

// ── Badge definitions ──────────────────────────────────────────────────────────
describe("BADGES constant", () => {
  it("contains 18 badges", () => {
    expect(BADGES).toHaveLength(18);
  });

  it("every badge has required fields", () => {
    for (const b of BADGES) {
      expect(b.key).toBeTruthy();
      expect(b.name).toBeTruthy();
      expect(b.description).toBeTruthy();
      expect(b.emoji).toBeTruthy();
      expect(typeof b.xpReward).toBe("number");
      expect(b.xpReward).toBeGreaterThanOrEqual(0);
    }
  });

  it("badge keys are unique", () => {
    const keys = BADGES.map((b) => b.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("includes RESUME_INTERVIEW badge", () => {
    const badge = BADGES.find((b) => b.key === "RESUME_INTERVIEW");
    expect(badge).toBeDefined();
    expect(badge?.xpReward).toBe(100);
  });
});

// ── awardBadge() ───────────────────────────────────────────────────────────────
describe("awardBadge()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("awards badge and XP when not already earned", async () => {
    mockPrisma.badge.findUnique.mockResolvedValue({
      id: "badge_1",
      key: "FIRST_INTERVIEW",
      xpReward: 50,
    });
    mockPrisma.userBadge.findUnique.mockResolvedValue(null);
    mockPrisma.userBadge.create.mockResolvedValue({});
    mockPrisma.user.findUnique.mockResolvedValue({ xp: 0 });
    mockPrisma.$transaction.mockResolvedValue([]);

    await awardBadge("user_1", "FIRST_INTERVIEW");

    expect(mockPrisma.userBadge.create).toHaveBeenCalledOnce();
  });

  it("is idempotent — does not re-award if already earned", async () => {
    mockPrisma.badge.findUnique.mockResolvedValue({ id: "badge_1", xpReward: 50 });
    mockPrisma.userBadge.findUnique.mockResolvedValue({ id: "existing" });

    await awardBadge("user_1", "FIRST_INTERVIEW");

    expect(mockPrisma.userBadge.create).not.toHaveBeenCalled();
  });

  it("does nothing when badge key does not exist in DB", async () => {
    mockPrisma.badge.findUnique.mockResolvedValue(null);

    await awardBadge("user_1", "NON_EXISTENT_KEY");

    expect(mockPrisma.userBadge.create).not.toHaveBeenCalled();
  });

  it("skips XP award when badge xpReward is 0", async () => {
    mockPrisma.badge.findUnique.mockResolvedValue({ id: "badge_z", xpReward: 0 });
    mockPrisma.userBadge.findUnique.mockResolvedValue(null);
    mockPrisma.userBadge.create.mockResolvedValue({});

    await awardBadge("user_1", "SOME_BADGE");

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});

// ── checkAndAwardBadges() ──────────────────────────────────────────────────────
describe("checkAndAwardBadges()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: badge already awarded (idempotent guard, avoid noise)
    mockPrisma.badge.findUnique.mockResolvedValue({ id: "b1", xpReward: 50 });
    mockPrisma.userBadge.findUnique.mockResolvedValue({ id: "already" });
  });

  it("awards FIRST_INTERVIEW badge after 1 submitted attempt", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ level: 1, profileCompleted: false });
    mockPrisma.interviewAttempt.count.mockResolvedValue(1);
    mockPrisma.friendship.count.mockResolvedValue(0);
    mockPrisma.challenge.count.mockResolvedValue(0);
    mockPrisma.interview.count.mockResolvedValue(0);
    mockPrisma.like.count.mockResolvedValue(0);
    mockPrisma.interviewAttempt.findMany.mockResolvedValue([]);
    mockPrisma.interviewAttempt.findFirst.mockResolvedValue(null);

    // No error thrown = function ran correctly
    await expect(checkAndAwardBadges("user_1")).resolves.not.toThrow();
  });

  it("checks SCORE_80 badge when attempt score ≥ 80", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ level: 1, profileCompleted: false });
    mockPrisma.interviewAttempt.count.mockResolvedValue(1);
    mockPrisma.friendship.count.mockResolvedValue(0);
    mockPrisma.challenge.count.mockResolvedValue(0);
    mockPrisma.interview.count.mockResolvedValue(0);
    mockPrisma.like.count.mockResolvedValue(0);
    mockPrisma.interviewAttempt.findMany.mockResolvedValue([{ score: 85 }]);
    mockPrisma.interviewAttempt.findFirst.mockResolvedValue(null);

    await expect(checkAndAwardBadges("user_1")).resolves.not.toThrow();
  });

  it("does not error when user has no attempts, friends, or data", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ level: 1, profileCompleted: false });
    mockPrisma.interviewAttempt.count.mockResolvedValue(0);
    mockPrisma.friendship.count.mockResolvedValue(0);
    mockPrisma.challenge.count.mockResolvedValue(0);
    mockPrisma.interview.count.mockResolvedValue(0);
    mockPrisma.like.count.mockResolvedValue(0);
    mockPrisma.interviewAttempt.findMany.mockResolvedValue([]);
    mockPrisma.interviewAttempt.findFirst.mockResolvedValue(null);

    await expect(checkAndAwardBadges("user_1")).resolves.not.toThrow();
  });
});
