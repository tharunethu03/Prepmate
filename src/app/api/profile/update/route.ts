import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    name,
    field,
    roleTitle,
    selectedAvatar,
    portfolioLink,
    linkedinLink,
    githubLink,
  } = await req.json();

  if (!name || !field || !roleTitle)
    return NextResponse.json(
      { error: "Name, field and role are required" },
      { status: 400 },
    );

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      field,
      roleTitle,
      avatar: selectedAvatar,
      portfolioLink: portfolioLink || null,
      linkedinLink: linkedinLink || null,
      githubLink: githubLink || null,
    },
  });

  return NextResponse.json({
    success: true,
    updatedSessionData: {
      name: updated.name,
      avatar: updated.avatar,
      roleTitle: updated.roleTitle,
      field: updated.field,
      portfolioLink: updated.portfolioLink,
      linkedinLink: updated.linkedinLink,
      githubLink: updated.githubLink,
    },
  });
}
