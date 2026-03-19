import { seedBadges } from "@/lib/badges";
import { NextResponse } from "next/server";

export async function GET() {
  await seedBadges();
  return NextResponse.json({ ok: true });
}
