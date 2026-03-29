import { requireAdmin } from "@/lib/requireAdmin";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const visibility = searchParams.get("visibility") ?? "all";
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) where.title = { contains: search, mode: "insensitive" };
  if (visibility !== "all") where.visibility = visibility;

  const [interviews, total] = await Promise.all([
    prisma.interview.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        visibility: true,
        difficulty: true,
        interviewType: true,
        creatorField: true,
        createdAt: true,
        creator: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: { attempts: true, likes: true },
        },
      },
    }),
    prisma.interview.count({ where }),
  ]);

  return NextResponse.json({
    interviews,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
