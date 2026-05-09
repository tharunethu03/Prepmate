import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/register/route";
import prisma from "@/lib/prisma";
import { makeRequest } from "../../setup";

const mockPrisma = prisma as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;

describe("POST /api/register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 409 if email already registered", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "existing" });

    const req = makeRequest("POST", { email: "taken@example.com", password: "pass1234" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.message).toMatch(/already registered/i);
  });

  it("creates a pending registration and sends verification email on success", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.pendingRegistration.deleteMany.mockResolvedValue({});
    mockPrisma.pendingRegistration.create.mockResolvedValue({ id: "pending_1" });

    const req = makeRequest("POST", { email: "new@example.com", password: "securePass1" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockPrisma.pendingRegistration.create).toHaveBeenCalledOnce();
  });

  it("returns 500 when a DB error occurs", async () => {
    mockPrisma.user.findUnique.mockRejectedValue(new Error("DB error"));

    const req = makeRequest("POST", { email: "user@example.com", password: "pass1234" });
    const res = await POST(req);

    expect(res.status).toBe(500);
  });
});
