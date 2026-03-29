import { requireAdmin } from "@/lib/requireAdmin";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    newUsersToday,
    newUsersWeek,
    newUsersMonth,
    totalInterviews,
    publicInterviews,
    totalAttempts,
    attemptsToday,
    pendingCreatorRequests,
    totalCreators,
    avgScore,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.interview.count(),
    prisma.interview.count({ where: { visibility: "public" } }),
    prisma.interviewAttempt.count({ where: { status: "SUBMITTED" } }),
    prisma.interviewAttempt.count({
      where: { status: "SUBMITTED", startedAt: { gte: startOfDay } },
    }),
    prisma.user.count({ where: { creatorRequest: true, creatorRequestStatus: "PENDING" } }),
    prisma.user.count({ where: { role: "CREATOR" } }),
    prisma.interviewAttempt.aggregate({
      where: { status: "SUBMITTED", score: { not: null } },
      _avg: { score: true },
    }),
  ]);

  // Signups per day for last 14 days
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(startOfDay);
    d.setDate(d.getDate() - (13 - i));
    return d;
  });

  const signupsByDay = await Promise.all(
    last14Days.map(async (day) => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const count = await prisma.user.count({
        where: { createdAt: { gte: day, lt: nextDay } },
      });
      return {
        date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      };
    }),
  );

  return NextResponse.json({
    totalUsers,
    newUsersToday,
    newUsersWeek,
    newUsersMonth,
    totalInterviews,
    publicInterviews,
    totalAttempts,
    attemptsToday,
    pendingCreatorRequests,
    totalCreators,
    avgScore: Math.round(avgScore._avg.score ?? 0),
    signupsByDay,
  });
}
