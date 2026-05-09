import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as GET_USERS, PATCH as PATCH_USER } from "@/app/api/admin/users/[id]/route";
import { GET as GET_STATS } from "@/app/api/admin/stats/route";
import { GET as GET_REQUESTS, } from "@/app/api/admin/creator-requests/route";
import { PATCH as PATCH_REQUEST } from "@/app/api/admin/creator-requests/[userId]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { makeRequest, makeSession, makeAdminSession } from "../../setup";

const mockPrisma = prisma as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;
const mockGetSession = getServerSession as ReturnType<typeof vi.fn>;

// ── Admin auth guard ───────────────────────────────────────────────────────────
describe("Admin route auth guard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET /api/admin/stats — returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET_STATS();
    expect(res.status).toBe(401);
  });

  it("GET /api/admin/stats — returns 403 when non-admin user", async () => {
    mockGetSession.mockResolvedValue(makeSession({ role: "STUDENT" }));
    const res = await GET_STATS();
    expect(res.status).toBe(403);
  });

  it("GET /api/admin/creator-requests — returns 403 for CREATOR role", async () => {
    mockGetSession.mockResolvedValue(makeSession({ role: "CREATOR" }));
    const res = await GET_REQUESTS();
    expect(res.status).toBe(403);
  });
});

// ── GET /api/admin/stats ───────────────────────────────────────────────────────
describe("GET /api/admin/stats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns stats for admin user", async () => {
    mockGetSession.mockResolvedValue(makeAdminSession());
    mockPrisma.user.count.mockResolvedValue(42);
    mockPrisma.interview.count.mockResolvedValue(15);
    mockPrisma.interviewAttempt.count.mockResolvedValue(120);
    mockPrisma.interviewAttempt.aggregate.mockResolvedValue({ _avg: { score: 72 } });
    mockPrisma.user.findMany.mockResolvedValue([]);

    const res = await GET_STATS();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(typeof data.totalUsers).toBe("number");
  });
});

// ── PATCH /api/admin/users/[id] (role change) ─────────────────────────────────
describe("PATCH /api/admin/users/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = makeRequest("PATCH", { role: "CREATOR" });
    const res = await PATCH_USER(req, { params: Promise.resolve({ id: "user_2" }) });
    expect(res.status).toBe(401);
  });

  it("returns 403 when non-admin tries to change role", async () => {
    mockGetSession.mockResolvedValue(makeSession({ role: "STUDENT" }));
    const req = makeRequest("PATCH", { role: "CREATOR" });
    const res = await PATCH_USER(req, { params: Promise.resolve({ id: "user_2" }) });
    expect(res.status).toBe(403);
  });

  it("updates user role when admin", async () => {
    mockGetSession.mockResolvedValue(makeAdminSession());
    mockPrisma.user.update.mockResolvedValue({ id: "user_2", role: "CREATOR" });

    const req = makeRequest("PATCH", { role: "CREATOR" });
    const res = await PATCH_USER(req, { params: Promise.resolve({ id: "user_2" }) });

    expect(res.status).toBe(200);
    expect(mockPrisma.user.update).toHaveBeenCalledOnce();
  });
});

// ── PATCH /api/admin/creator-requests/[userId] (approve/decline) ──────────────
describe("PATCH /api/admin/creator-requests/[userId]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 403 when non-admin", async () => {
    mockGetSession.mockResolvedValue(makeSession({ role: "STUDENT" }));
    const req = makeRequest("PATCH", { action: "approve" });
    const res = await PATCH_REQUEST(req, { params: Promise.resolve({ userId: "user_2" }) });
    expect(res.status).toBe(403);
  });

  it("approves a creator request", async () => {
    mockGetSession.mockResolvedValue(makeAdminSession());
    // Route: findUnique to get user info for email, then update role
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user_2", email: "creator@example.com", name: "Bob",
      creatorRequest: true, creatorRequestStatus: "PENDING",
    });
    mockPrisma.user.update.mockResolvedValue({ id: "user_2", role: "CREATOR" });

    const req = makeRequest("PATCH", { action: "approve" });
    const res = await PATCH_REQUEST(req, { params: Promise.resolve({ userId: "user_2" }) });

    expect(res.status).toBe(200);
  });

  it("declines a creator request", async () => {
    mockGetSession.mockResolvedValue(makeAdminSession());
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user_2", email: "creator@example.com", name: "Bob",
      creatorRequest: true, creatorRequestStatus: "PENDING",
    });
    mockPrisma.user.update.mockResolvedValue({ id: "user_2" });

    const req = makeRequest("PATCH", { action: "decline", reason: "Not enough experience" });
    const res = await PATCH_REQUEST(req, { params: Promise.resolve({ userId: "user_2" }) });

    expect(res.status).toBe(200);
  });
});
