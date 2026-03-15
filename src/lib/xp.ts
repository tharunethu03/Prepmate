import prisma from "./prisma";
import { XpReason } from "@/generated/prisma/client";

export async function awardXp(
  userId: string,
  amount: number,
  reason: XpReason,
  refId?: string,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true },
  });

  const currentXp = user?.xp ?? 0;
  const newXp = currentXp + amount;
  const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

  await prisma.$transaction([
    prisma.xpEvent.create({
      data: { userId, amount, reason, refId: refId ?? null },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { xp: newXp, level: newLevel },
    }),
  ]);
}
