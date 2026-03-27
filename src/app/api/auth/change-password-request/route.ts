import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/sendPasswordResetEmail";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.password) {
    return NextResponse.json(
      { error: "No password set for this account. Sign in with Google or GitHub instead." },
      { status: 400 },
    );
  }

  const maskedEmail = await sendPasswordResetEmail(user.id, user.email, user.name);

  return NextResponse.json({ maskedEmail });
}
