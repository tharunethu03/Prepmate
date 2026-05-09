import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/users/search/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { makeRequest, makeSession } from "../setup";

const mockPrisma = prisma as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;
const mockGetSession = getServerSession as ReturnType<typeof vi.fn>;

describe("GET /api/users/search", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = makeRequest("GET", undefined, { q: "test" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns empty array when query is less than 2 characters", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    const req = makeRequest("GET", undefined, { q: "a" });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.users).toEqual([]);
  });

  it("returns empty array when no query param", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    const req = makeRequest("GET");
    const res = await GET(req);
    const data = await res.json();

    expect(data.users).toEqual([]);
  });

  it("searches all roles — students and creators", async () => {
    mockGetSession.mockResolvedValue(makeSession({ id: "user_1" }));
    mockPrisma.friendship.findMany.mockResolvedValue([]);
    mockPrisma.friendRequest.findMany.mockResolvedValue([]);
    mockPrisma.user.findMany.mockResolvedValue([
      { id: "user_2", name: "Alice Student", email: "alice@example.com", avatar: null, level: 3, xp: 300, role: "STUDENT", field: "Engineering" },
      { id: "user_3", name: "Bob Creator", email: "bob@example.com", avatar: null, level: 5, xp: 600, role: "CREATOR", field: "Design" },
    ]);

    const req = makeRequest("GET", undefined, { q: "alice" });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.users).toHaveLength(2);
    // Both student and creator appear
    const roles = data.users.map((u: { role: string }) => u.role);
    expect(roles).toContain("STUDENT");
    expect(roles).toContain("CREATOR");
  });

  it("excludes the current user from results", async () => {
    mockGetSession.mockResolvedValue(makeSession({ id: "user_1" }));
    mockPrisma.friendship.findMany.mockResolvedValue([]);
    mockPrisma.friendRequest.findMany.mockResolvedValue([]);
    // Returns results — the DB query has the exclude-self filter
    mockPrisma.user.findMany.mockResolvedValue([
      { id: "user_2", name: "Another User", email: "other@example.com", avatar: null, level: 1, xp: 0, role: "STUDENT", field: null },
    ]);

    const req = makeRequest("GET", undefined, { q: "user" });
    const res = await GET(req);
    const data = await res.json();

    // Verify that the DB query excluded self (id: { not: userId })
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ id: { not: "user_1" } }),
          ]),
        }),
      }),
    );
    expect(data.users.find((u: { id: string }) => u.id === "user_1")).toBeUndefined();
  });

  it("annotates results with friendship status", async () => {
    mockGetSession.mockResolvedValue(makeSession({ id: "user_1" }));
    mockPrisma.friendship.findMany.mockResolvedValue([
      { friendAId: "user_1", friendBId: "user_2" },
    ]);
    mockPrisma.friendRequest.findMany
      .mockResolvedValueOnce([]) // sent
      .mockResolvedValueOnce([]); // received
    mockPrisma.user.findMany.mockResolvedValue([
      { id: "user_2", name: "Friend", email: "friend@example.com", avatar: null, level: 2, xp: 100, role: "STUDENT", field: null },
    ]);

    const req = makeRequest("GET", undefined, { q: "friend" });
    const res = await GET(req);
    const data = await res.json();

    expect(data.users[0].isFriend).toBe(true);
  });
});
