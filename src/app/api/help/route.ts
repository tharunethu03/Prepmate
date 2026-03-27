import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, message } = await req.json();

  if (!subject || !message)
    return NextResponse.json(
      { error: "Subject and message required" },
      { status: 400 },
    );

  try {
    await resend.emails.send({
      from: session.user.email,
      to: process.env.RESEND_FROM_EMAIL!,
      subject: `[Prepmate Help] ${subject}`,
      html: `
        <h2>Help Request from ${session.user.name}</h2>
        <p><strong>Email:</strong> ${session.user.email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
      replyTo: session.user.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
