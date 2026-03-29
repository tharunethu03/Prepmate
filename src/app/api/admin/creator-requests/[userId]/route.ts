import { requireAdmin } from "@/lib/requireAdmin";
import prisma from "@/lib/prisma";
import {
  sendCreatorApprovedEmail,
  sendCreatorDeclinedEmail,
} from "@/lib/sendCreatorStatusEmail";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { userId } = await params;
  const { action, reason } = await req.json(); // action: "approve" | "decline"

  if (!["approve", "decline"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      creatorRequest: true,
      creatorRequestStatus: true,
    },
  });

  if (!user || !user.creatorRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (action === "approve") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: "CREATOR",
        creatorRequest: false,
        creatorRequestStatus: null,
        creatorRequestedAt: null,
      },
    });
    await sendCreatorApprovedEmail(user.email, user.name ?? null);
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: {
        creatorRequest: false,
        creatorRequestStatus: "DECLINED",
      },
    });
    await sendCreatorDeclinedEmail(user.email, user.name ?? null, reason);
  }

  return NextResponse.json({ success: true, action });
}
