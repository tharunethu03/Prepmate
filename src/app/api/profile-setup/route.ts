import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!existingUser) {
    return new Response("User not found", { status: 404 });
  }

  const body = await req.json();

  await prisma.user.update({
    where: {
      email: session.user.email,
    },
    data: {
      name: body.name,
      field: body.field,
      roleTitle: body.roleTitle,
      avatar: body.selectedAvatar,
      profileCompleted: true,
      creatorRequest: body.accountType === "creator",
      creatorRequestStatus: body.accountType === "creator" ? "PENDING" : null,
      creatorRequestedAt: body.accountType === "creator" ? new Date() : null,
      portfolioLink: body.portfolioLink,
      linkedinLink: body.linkedinLink,
      githubLink: body.githubLink,
    },
  });

  // Return the updated session data so the client can call update() immediately
  // without needing a separate /api/profile fetch
  return NextResponse.json({
    success: true,
    updatedSessionData: {
      name: body.name,
      roleTitle: body.roleTitle,
      field: body.field,
      avatar: body.selectedAvatar,
      profileCompleted: true,
      creatorRequest: body.accountType === "creator",
      portfolioLink: body.portfolioLink,
      linkedinLink: body.linkedinLink,
      githubLink: body.githubLink,
    },
  });
}
