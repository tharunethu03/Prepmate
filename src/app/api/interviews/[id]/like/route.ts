import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.id;

  // Await the params object
  const { id: interviewId } = await context.params;

  if (!interviewId)
    return new Response("Interview ID missing", { status: 400 });

  // Check if the user already liked this interview
  const existing = await prisma.like.findFirst({
    where: { userId, interviewId },
  });

  if (existing) {
    // Unlike
    await prisma.like.deleteMany({
      where: { userId, interviewId },
    });
    return new Response(JSON.stringify({ liked: false }), { status: 200 });
  }

  // Like
  await prisma.like.create({
    data: {
      user: { connect: { id: userId } },
      interview: { connect: { id: interviewId } },
    },
  });

  return new Response(JSON.stringify({ liked: true }), { status: 200 });
}
