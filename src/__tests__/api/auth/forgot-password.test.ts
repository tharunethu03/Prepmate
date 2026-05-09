import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/forgot-password/route";
import prisma from "@/lib/prisma";
import { makeRequest } from "../../setup";

const mockPrisma = prisma as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when email is missing", async () => {
    const req = makeRequest("POST", {});
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("returns success without sending email when user not found (prevents enumeration)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const req = makeRequest("POST", { email: "ghost@example.com" });
    const res = await POST(req);
    const data = await res.json();

    // Must still return success — don't reveal whether email exists
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    // No email should be sent
    const { default: mailer } = await import("@/lib/mailer");
    expect(mailer.sendMail).not.toHaveBeenCalled();
  });

  it("returns success and sends email when user exists with a password", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "user@example.com",
      name: "Test User",
      password: "hashed_pw",
    });
    mockPrisma.user.update.mockResolvedValue({});

    const req = makeRequest("POST", { email: "user@example.com" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    const { default: mailer } = await import("@/lib/mailer");
    expect(mailer.sendMail).toHaveBeenCalledOnce();
  });

  it("does not send email when user has no password (OAuth-only account)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user_2",
      email: "oauth@example.com",
      password: null,
    });

    const req = makeRequest("POST", { email: "oauth@example.com" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    const { default: mailer } = await import("@/lib/mailer");
    expect(mailer.sendMail).not.toHaveBeenCalled();
  });
});
