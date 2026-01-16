import prisma from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const hashed = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
      },
    });
    return NextResponse.json({
      user: {
        email: user.email,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
