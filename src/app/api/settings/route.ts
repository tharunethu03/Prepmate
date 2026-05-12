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
      showXp: true,
      showScore: true,
      showAttempts: true,
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { showXp, showScore, showAttempts } = body;

  // Spread with undefined check so PATCH is partial — only update the fields sent
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(showXp !== undefined && { showXp }),
      ...(showScore !== undefined && { showScore }),
      ...(showAttempts !== undefined && { showAttempts }),
    },
    select: { showXp: true, showScore: true, showAttempts: true },
  });

  return NextResponse.json(user);
}