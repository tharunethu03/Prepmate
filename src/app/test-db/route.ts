import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    return NextResponse.json({ message: "MongoDB connected successfully!" });
  } catch (error) {
    return NextResponse.json(
      { message: "MongoDB connection failed", error },
      { status: 500 }
    );
  }
}
