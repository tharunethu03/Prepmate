import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      avatar: true,
      xp: true,
      level: true,
      role: true,
      field: true,
      email: true,
      roleTitle: true,
      portfolioLink: true,
      linkedinLink: true,
      githubLink: true,
      createdAt: true,
      _count: {
        select: {
          interviews: true,
          attempts: true,
        },
      },
    },
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(user);
}
