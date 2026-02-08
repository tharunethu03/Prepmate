import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session) return new Response("Unauthorized", { status: 401 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompleted: true },
  });

  return Response.json({ success: true });
}
