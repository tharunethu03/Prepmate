import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/friends/route";
import { PATCH, DELETE } from "@/app/api/friends/[requestId]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { makeRequest, makeSession } from "../../setup";

const mockPrisma = prisma as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;
const mockGetSession = getServerSession as ReturnType<typeof vi.fn>;

// ── GET /api/friends ───────────────────────────────────────────────────────────
describe("GET /api/friends", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns friends and pending requests for authenticated user", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockPrisma.friendship.findMany.mockResolvedValue([]);
    mockPrisma.friendRequest.findMany.mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data.friends)).toBe(true);
    expect(Array.isArray(data.pendingReceived)).toBe(true);
    expect(Array.isArray(data.pendingSent)).toBe(true);
  });
});

// ── POST /api/friends ─────────────────────────────────────────────────────────
describe("POST /api/friends (send request)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = makeRequest("POST", { receiverId: "user_2" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when receiverId is missing", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    const req = makeRequest("POST", {});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when sending request to self", async () => {
    mockGetSession.mockResolvedValue(makeSession({ id: "user_1" }));
    const req = makeRequest("POST", { receiverId: "user_1" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 409 when already friends", async () => {
    mockGetSession.mockResolvedValue(makeSession({ id: "user_1" }));
    mockPrisma.friendship.findUnique.mockResolvedValue({ id: "existing_friendship" });

    const req = makeRequest("POST", { receiverId: "user_2" });
    const res = await POST(req);
    expect(res.status).toBe(409);
  });

  it("returns 409 when request already sent", async () => {
    mockGetSession.mockResolvedValue(makeSession({ id: "user_1" }));
    mockPrisma.friendship.findUnique.mockResolvedValue(null);
    mockPrisma.friendRequest.findUnique.mockResolvedValue({ id: "req_1" });

    const req = makeRequest("POST", { receiverId: "user_2" });
    const res = await POST(req);
    expect(res.status).toBe(409);
  });

  it("creates a friend request successfully", async () => {
    mockGetSession.mockResolvedValue(makeSession({ id: "user_1" }));
    mockPrisma.friendship.findUnique.mockResolvedValue(null);
    mockPrisma.friendRequest.findUnique.mockResolvedValue(null);
    mockPrisma.friendRequest.create.mockResolvedValue({ id: "req_new", senderId: "user_1", receiverId: "user_2" });

    const req = makeRequest("POST", { receiverId: "user_2" });
    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(mockPrisma.friendRequest.create).toHaveBeenCalledOnce();
  });
});

// ── PATCH /api/friends/[requestId] ────────────────────────────────────────────
describe("PATCH /api/friends/[requestId] (accept/decline)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = makeRequest("PATCH", { action: "accept" });
    const res = await PATCH(req, { params: Promise.resolve({ requestId: "req_1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when request not found", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockPrisma.friendRequest.findUnique.mockResolvedValue(null);

    const req = makeRequest("PATCH", { action: "accept" });
    const res = await PATCH(req, { params: Promise.resolve({ requestId: "req_ghost" }) });
    expect(res.status).toBe(404);
  });

  it("returns 403 when user is not the receiver", async () => {
    mockGetSession.mockResolvedValue(makeSession({ id: "user_3" }));
    mockPrisma.friendRequest.findUnique.mockResolvedValue({
      id: "req_1",
      receiverId: "user_2",
      senderId: "user_1",
      status: "PENDING",
    });

    const req = makeRequest("PATCH", { action: "accept" });
    const res = await PATCH(req, { params: Promise.resolve({ requestId: "req_1" }) });
    expect(res.status).toBe(403);
  });

  it("accepts a friend request and creates friendship", async () => {
    mockGetSession.mockResolvedValue(makeSession({ id: "user_2" }));
    mockPrisma.friendRequest.findUnique.mockResolvedValue({
      id: "req_1",
      receiverId: "user_2",
      senderId: "user_1",
      status: "PENDING",
    });
    mockPrisma.$transaction.mockResolvedValue([]);
    mockPrisma.user.findUnique.mockResolvedValue({ xp: 0 });

    const req = makeRequest("PATCH", { action: "accept" });
    const res = await PATCH(req, { params: Promise.resolve({ requestId: "req_1" }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("accepted");
  });

  it("declines a friend request", async () => {
    mockGetSession.mockResolvedValue(makeSession({ id: "user_2" }));
    mockPrisma.friendRequest.findUnique.mockResolvedValue({
      id: "req_1",
      receiverId: "user_2",
      senderId: "user_1",
      status: "PENDING",
    });
    mockPrisma.friendRequest.update.mockResolvedValue({});

    const req = makeRequest("PATCH", { action: "decline" });
    const res = await PATCH(req, { params: Promise.resolve({ requestId: "req_1" }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("declined");
  });
});

// ── DELETE /api/friends/[requestId] ───────────────────────────────────────────
describe("DELETE /api/friends/[requestId] (unfriend)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = makeRequest("DELETE");
    const res = await DELETE(req, { params: Promise.resolve({ requestId: "friendship_1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when friendship not found", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockPrisma.friendship.findUnique.mockResolvedValue(null);

    const req = makeRequest("DELETE");
    const res = await DELETE(req, { params: Promise.resolve({ requestId: "ghost" }) });
    expect(res.status).toBe(404);
  });

  it("returns 403 when user is not part of the friendship", async () => {
    mockGetSession.mockResolvedValue(makeSession({ id: "user_99" }));
    mockPrisma.friendship.findUnique.mockResolvedValue({
      id: "friendship_1",
      friendAId: "user_1",
      friendBId: "user_2",
    });

    const req = makeRequest("DELETE");
    const res = await DELETE(req, { params: Promise.resolve({ requestId: "friendship_1" }) });
    expect(res.status).toBe(403);
  });

  it("deletes friendship when user is part of it", async () => {
    mockGetSession.mockResolvedValue(makeSession({ id: "user_1" }));
    mockPrisma.friendship.findUnique.mockResolvedValue({
      id: "friendship_1",
      friendAId: "user_1",
      friendBId: "user_2",
    });
    mockPrisma.friendship.delete.mockResolvedValue({});

    const req = makeRequest("DELETE");
    const res = await DELETE(req, { params: Promise.resolve({ requestId: "friendship_1" }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("unfriended");
  });
});
