import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { awardXp } from "@/lib/xp";
import { XpReason } from "@/generated/prisma/client";
import { checkAndAwardBadges } from "@/lib/badges";

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
    // Sort IDs for the canonical friendship key (same logic as when creating requests)
    const [friendAId, friendBId] = [
      request.senderId,
      request.receiverId,
    ].sort();

    // $transaction keeps the request update and friendship creation atomic —
    // if either fails, neither goes through
    await prisma.$transaction([
      prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      }),
      prisma.friendship.create({ data: { friendAId, friendBId } }),
    ]);

    // Award XP to both users separately (awardXp handles null-safe increment)
    await awardXp(request.senderId, 20, XpReason.FRIEND_ADDED, requestId);
    await awardXp(request.receiverId, 20, XpReason.FRIEND_ADDED, requestId);

    return NextResponse.json({ status: "accepted" });
  }

  // NOTE: badge checks only run here for invalid actions — should be moved
  // inside the accept block above if badges are meant to fire on friend accept
  await checkAndAwardBadges(request.senderId);
  await checkAndAwardBadges(request.receiverId);

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
