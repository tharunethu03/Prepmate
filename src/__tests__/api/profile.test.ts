import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/profile/route";
import { POST } from "@/app/api/profile-setup/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { makeRequest, makeSession, mockUserFull } from "../setup";

const mockPrisma = prisma as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;
const mockGetSession = getServerSession as ReturnType<typeof vi.fn>;

const mockProfile = mockUserFull;

describe("GET /api/profile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = makeRequest("GET");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns profile data for authenticated user", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockPrisma.user.findUnique.mockResolvedValue(mockProfile);

    const req = makeRequest("GET");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.name).toBe("Test User");
  });

  it("returns 404 when profile not found", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const req = makeRequest("GET");
    const res = await GET(req);

    expect(res.status).toBe(404);
  });
});

describe("POST /api/profile (profile setup)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = makeRequest("POST", { name: "Test", field: "Engineering" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("updates profile with valid fields", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    // profile-setup route: findUnique first to confirm user exists, then update
    mockPrisma.user.findUnique.mockResolvedValue(mockProfile);
    mockPrisma.user.update.mockResolvedValue({ ...mockProfile, name: "Updated Name" });
    mockPrisma.badge.findUnique.mockResolvedValue(null);
    mockPrisma.interviewAttempt.count.mockResolvedValue(0);
    mockPrisma.friendship.count.mockResolvedValue(0);
    mockPrisma.challenge.count.mockResolvedValue(0);
    mockPrisma.interview.count.mockResolvedValue(0);
    mockPrisma.like.count.mockResolvedValue(0);
    mockPrisma.interviewAttempt.findMany.mockResolvedValue([]);
    mockPrisma.interviewAttempt.findFirst.mockResolvedValue(null);

    const req = makeRequest("POST", {
      name: "Updated Name",
      field: "Data Science",
      roleTitle: "Analyst",
      avatar: "/profile-setup/avatar2.png",
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockPrisma.user.update).toHaveBeenCalledOnce();
  });
});
