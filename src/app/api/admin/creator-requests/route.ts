import { requireAdmin } from "@/lib/requireAdmin";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const requests = await prisma.user.findMany({
    where: {
      creatorRequest: true,
      creatorRequestStatus: "PENDING",
    },
    orderBy: { creatorRequestedAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      field: true,
      roleTitle: true,
      portfolioLink: true,
      linkedinLink: true,
      githubLink: true,
      creatorRequestedAt: true,
      xp: true,
      level: true,
      _count: {
        select: { attempts: true },
      },
    },
  });

  return NextResponse.json(requests);
}
