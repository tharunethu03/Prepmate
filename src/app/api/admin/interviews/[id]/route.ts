import { requireAdmin } from "@/lib/requireAdmin";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  await prisma.interview.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
