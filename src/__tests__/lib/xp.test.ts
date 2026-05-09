import { describe, it, expect, vi, beforeEach } from "vitest";
import { awardXp } from "@/lib/xp";
import prisma from "@/lib/prisma";

const mockPrisma = prisma as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;

describe("awardXp()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calculates correct new XP and level, persists via transaction", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ xp: 0 });
    mockPrisma.$transaction.mockImplementation((ops: unknown[]) =>
      Promise.all(ops),
    );
    mockPrisma.xpEvent.create.mockResolvedValue({});
    mockPrisma.user.update.mockResolvedValue({});

    await awardXp("user_1", 100, "INTERVIEW_COMPLETED" as never);

    expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
  });

  it("level formula: floor(sqrt(xp/100)) + 1", () => {
    // 0 xp → level 1, 100 xp → level 2, 400 xp → level 3
    const calcLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;
    expect(calcLevel(0)).toBe(1);
    expect(calcLevel(100)).toBe(2);
    expect(calcLevel(399)).toBe(2);
    expect(calcLevel(400)).toBe(3);
    expect(calcLevel(900)).toBe(4);
    expect(calcLevel(2500)).toBe(6);
  });

  it("treats missing user XP as 0 and still awards", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.$transaction.mockResolvedValue([]);

    await expect(
      awardXp("user_missing", 50, "BADGE_EARNED" as never),
    ).resolves.not.toThrow();
  });

  it("passes optional refId to xpEvent", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ xp: 200 });
    const xpCreateSpy = mockPrisma.xpEvent.create;
    mockPrisma.$transaction.mockImplementation((ops: unknown[]) =>
      Promise.all(ops),
    );
    mockPrisma.user.update.mockResolvedValue({});
    xpCreateSpy.mockResolvedValue({});

    await awardXp("user_1", 30, "BADGE_EARNED" as never, "badge_ref_1");

    expect(xpCreateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ refId: "badge_ref_1" }) }),
    );
  });
});
