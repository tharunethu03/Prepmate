import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// PATCH /api/friends/[requestId] — accept or decline
export async function PATCH(
  req: Request,
  context: { params: Promise<{ requestId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestId } = await context.params;
  const { action } = await req.json(); // "accept" | "decline"

  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });

  if (!request)
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (request.receiverId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (request.status !== "PENDING")
    return NextResponse.json(
      { error: "Request already handled" },
      { status: 409 },
    );

  if (action === "decline") {
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: "DECLINED" },
    });
    return NextResponse.json({ status: "declined" });
  }

  if (action === "accept") {
    // Canonical ordering: smaller ID is friendA
    const [friendAId, friendBId] = [
      request.senderId,
      request.receiverId,
    ].sort();

    await prisma.$transaction([
      prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      }),
      prisma.friendship.create({ data: { friendAId, friendBId } }),
      // XP for both users
      prisma.xpEvent.createMany({
        data: [
          {
            userId: request.senderId,
            amount: 20,
            reason: "FRIEND_ADDED",
            refId: requestId,
          },
          {
            userId: request.receiverId,
            amount: 20,
            reason: "FRIEND_ADDED",
            refId: requestId,
          },
        ],
      }),
      prisma.user.update({
        where: { id: request.senderId },
        data: { xp: { increment: 20 } },
      }),
      prisma.user.update({
        where: { id: request.receiverId },
        data: { xp: { increment: 20 } },
      }),
    ]);

    return NextResponse.json({ status: "accepted" });
  }

  return NextResponse.json(
    { error: "action must be accept or decline" },
    { status: 400 },
  );
}

// DELETE /api/friends/[requestId] — unfriend (requestId is the Friendship id here)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ requestId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestId: friendshipId } = await context.params;

  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
  });

  if (!friendship)
    return NextResponse.json(
      { error: "Friendship not found" },
      { status: 404 },
    );
  if (
    friendship.friendAId !== session.user.id &&
    friendship.friendBId !== session.user.id
  )
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.friendship.delete({ where: { id: friendshipId } });

  return NextResponse.json({ status: "unfriended" });
}
