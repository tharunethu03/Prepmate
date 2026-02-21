import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    return NextResponse.json({
      authenticated: !!session,
      session: session ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch session:", error);

    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 },
    );
  }
}
