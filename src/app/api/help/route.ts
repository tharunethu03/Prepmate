import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import transporter from "@/lib/mailer";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
    await transporter.sendMail({
      from: `"Prepmate" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: session.user.email,
      subject: `[Prepmate Help] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #6366f1;">Help Request</h2>
          <p><strong>From:</strong> ${session.user.name} (${session.user.email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <p>${message.replace(/\n/g, "<br/>")}</p>
        </div>
      `,
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
