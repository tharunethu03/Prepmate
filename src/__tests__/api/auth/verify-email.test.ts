import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/auth/verify-email/route";
import prisma from "@/lib/prisma";
import { makeRequest } from "../../setup";

const mockPrisma = prisma as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;

describe("GET /api/auth/verify-email", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when no token provided", async () => {
    const req = makeRequest("GET");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("missing-token");
  });

  it("returns 400 when token not found in DB", async () => {
    mockPrisma.pendingRegistration.findUnique.mockResolvedValue(null);

    const req = makeRequest("GET", undefined, { token: "bad_token" });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("invalid-token");
  });

  it("returns 400 when token is expired", async () => {
    mockPrisma.pendingRegistration.findUnique.mockResolvedValue({
      email: "user@example.com",
      hashedPassword: "hashed",
      expires: new Date(Date.now() - 1000), // already expired
    });

    const req = makeRequest("GET", undefined, { token: "expired_token" });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("token-expired");
  });

  it("creates user and deletes pending record on valid token", async () => {
    mockPrisma.pendingRegistration.findUnique.mockResolvedValue({
      email: "newuser@example.com",
      hashedPassword: "hashed",
      token: "valid_token",
      expires: new Date(Date.now() + 10_000),
    });
    mockPrisma.user.create.mockResolvedValue({ id: "user_new" });
    mockPrisma.pendingRegistration.delete.mockResolvedValue({});

    const req = makeRequest("GET", undefined, { token: "valid_token" });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockPrisma.user.create).toHaveBeenCalledOnce();
    expect(mockPrisma.pendingRegistration.delete).toHaveBeenCalledOnce();
  });
});
