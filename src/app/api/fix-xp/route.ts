import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const events = await prisma.xpEvent.groupBy({
    by: ["userId"],
    _sum: { amount: true },
  });

  for (const e of events) {
    const totalXp = e._sum.amount ?? 0;
    const level = Math.floor(Math.sqrt(totalXp / 100)) + 1;
    await prisma.user.update({
      where: { id: e.userId },
      data: { xp: totalXp, level },
    });
  }

  return NextResponse.json({ fixed: events.length });
}
