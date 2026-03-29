import { requireAdmin } from "@/lib/requireAdmin";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  // Attempts per day for last 14 days
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - (13 - i));
    return d;
  });

  const [attemptsByDay, topInterviews, industryBreakdown, scoreDistribution] =
    await Promise.all([
      // Attempts per day
      Promise.all(
        last14Days.map(async (day) => {
          const nextDay = new Date(day);
          nextDay.setDate(nextDay.getDate() + 1);
          const count = await prisma.interviewAttempt.count({
            where: {
              status: "SUBMITTED",
              startedAt: { gte: day, lt: nextDay },
            },
          });
          return {
            date: day.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            count,
          };
        }),
      ),

      // Top 5 most attempted public interviews
      prisma.interview.findMany({
        where: { visibility: "public" },
        orderBy: { attempts: { _count: "desc" } },
        take: 5,
        select: {
          id: true,
          title: true,
          difficulty: true,
          creatorField: true,
          creator: { select: { name: true } },
          _count: { select: { attempts: true, likes: true } },
        },
      }),

      // Interviews by industry
      prisma.interview.groupBy({
        by: ["creatorField"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),

      // Score distribution (buckets: 0-20, 20-40, 40-60, 60-80, 80-100)
      Promise.all(
        [0, 20, 40, 60, 80].map(async (min) => {
          const max = min + 20;
          const count = await prisma.interviewAttempt.count({
            where: {
              status: "SUBMITTED",
              score: { gte: min, lt: max === 100 ? 101 : max },
            },
          });
          return { range: `${min}-${max === 100 ? 100 : max - 1}%`, count };
        }),
      ),
    ]);

  return NextResponse.json({
    attemptsByDay,
    topInterviews,
    industryBreakdown: industryBreakdown.map((r) => ({
      industry: r.creatorField ?? "Unknown",
      count: r._count.id,
    })),
    scoreDistribution,
  });
}
