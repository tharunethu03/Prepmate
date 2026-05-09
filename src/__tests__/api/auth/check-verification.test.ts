import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/auth/check-verification/route";
import prisma from "@/lib/prisma";
import { makeRequest } from "../../setup";

const mockPrisma = prisma as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;

describe("GET /api/auth/check-verification", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns { verified: false } when no email param", async () => {
    const req = makeRequest("GET");
    const res = await GET(req);
    const data = await res.json();

    expect(data.verified).toBe(false);
  });

  it("returns { verified: false } when user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const req = makeRequest("GET", undefined, { email: "nobody@example.com" });
    const res = await GET(req);
    const data = await res.json();

    expect(data.verified).toBe(false);
  });

  it("returns { verified: false } when user exists but emailVerified is null", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ emailVerified: null });

    const req = makeRequest("GET", undefined, { email: "pending@example.com" });
    const res = await GET(req);
    const data = await res.json();

    expect(data.verified).toBe(false);
  });

  it("returns { verified: true } when emailVerified is set", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      emailVerified: new Date(),
    });

    const req = makeRequest("GET", undefined, { email: "verified@example.com" });
    const res = await GET(req);
    const data = await res.json();

    expect(data.verified).toBe(true);
  });
});
