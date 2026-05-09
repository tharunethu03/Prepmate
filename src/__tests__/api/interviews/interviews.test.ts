import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/interviews/route";
import { GET as GET_ONE, DELETE } from "@/app/api/interviews/[id]/route";
import { POST as LIKE } from "@/app/api/interviews/[id]/like/route";
import { POST as SAVE } from "@/app/api/interviews/[id]/save/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { makeRequest, makeSession, mockInterviewFull } from "../../setup";

const mockPrisma = prisma as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;
const mockGetSession = getServerSession as ReturnType<typeof vi.fn>;

const mockInterview = mockInterviewFull;

// ── GET /api/interviews ────────────────────────────────────────────────────────
describe("GET /api/interviews", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns public interviews without auth", async () => {
    mockGetSession.mockResolvedValue(null);
    mockPrisma.interview.findMany.mockResolvedValue([mockInterview]);
    mockPrisma.creatorFollow.findMany.mockResolvedValue([]);

    const req = makeRequest("GET");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data.interviews)).toBe(true);
  });

  it("returns 200 and filters by role when query param provided", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockPrisma.interview.findMany.mockResolvedValue([mockInterview]);

    const req = makeRequest("GET", undefined, { role: "Frontend Dev" });
    const res = await GET(req);

    expect(res.status).toBe(200);
  });
});

// ── POST /api/interviews ───────────────────────────────────────────────────────
describe("POST /api/interviews", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const req = makeRequest("POST", { title: "Test" });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("creates interview when authenticated with valid body", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockPrisma.interview.create.mockResolvedValue({ id: "interview_new", ...mockInterview });
    // checkAndAwardBadges mocks
    mockPrisma.user.findUnique.mockResolvedValue({ level: 1, profileCompleted: false });
    mockPrisma.interviewAttempt.count.mockResolvedValue(0);
    mockPrisma.friendship.count.mockResolvedValue(0);
    mockPrisma.challenge.count.mockResolvedValue(0);
    mockPrisma.interview.count.mockResolvedValue(1);
    mockPrisma.like.count.mockResolvedValue(0);
    mockPrisma.interviewAttempt.findMany.mockResolvedValue([]);
    mockPrisma.interviewAttempt.findFirst.mockResolvedValue(null);
    mockPrisma.badge.findUnique.mockResolvedValue(null);

    const req = makeRequest("POST", {
      title: "React Interview",
      role: "Frontend",
      description: "Advanced React topics",
      difficulty: "intermediate",
      topics: ["React", "Hooks"],
      mode: "custom",
      visibility: "public",
      questionCount: 5,
      interviewType: "technical",
      questions: [
        { question: "What is useEffect?", answer: "A hook...", keywords: ["hook"], topics: ["React"] },
      ],
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockPrisma.interview.create).toHaveBeenCalledOnce();
  });
});

// ── GET /api/interviews/[id] ───────────────────────────────────────────────────
describe("GET /api/interviews/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 404 when interview not found", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockPrisma.interview.findUnique.mockResolvedValue(null);

    const req = makeRequest("GET");
    const res = await GET_ONE(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("returns interview data when found", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockPrisma.interview.findUnique.mockResolvedValue(mockInterview);

    const req = makeRequest("GET");
    const res = await GET_ONE(req, { params: Promise.resolve({ id: "interview_1" }) });

    expect(res.status).toBe(200);
  });
});

// ── DELETE /api/interviews/[id] ────────────────────────────────────────────────
describe("DELETE /api/interviews/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const req = makeRequest("DELETE");
    const res = await DELETE(req, { params: Promise.resolve({ id: "interview_1" }) });

    expect(res.status).toBe(401);
  });

  it("returns 403 when user does not own the interview", async () => {
    mockGetSession.mockResolvedValue(makeSession({ id: "other_user" }));
    mockPrisma.interview.findUnique.mockResolvedValue({ ...mockInterview, createdBy: "user_1" });

    const req = makeRequest("DELETE");
    const res = await DELETE(req, { params: Promise.resolve({ id: "interview_1" }) });

    expect(res.status).toBe(403);
  });

  it("deletes interview when user is the owner", async () => {
    mockGetSession.mockResolvedValue(makeSession({ id: "user_1" }));
    mockPrisma.interview.findUnique.mockResolvedValue({ ...mockInterview, createdBy: "user_1" });
    mockPrisma.interview.delete.mockResolvedValue({});

    const req = makeRequest("DELETE");
    const res = await DELETE(req, { params: Promise.resolve({ id: "interview_1" }) });

    expect(res.status).toBe(200);
    expect(mockPrisma.interview.delete).toHaveBeenCalledOnce();
  });
});

// ── POST /api/interviews/[id]/like ────────────────────────────────────────────
describe("POST /api/interviews/[id]/like", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = makeRequest("POST");
    const res = await LIKE(req, { params: Promise.resolve({ id: "interview_1" }) });
    expect(res.status).toBe(401);
  });

  it("toggles like on — creates a like record", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockPrisma.like.findFirst.mockResolvedValue(null);
    mockPrisma.like.create.mockResolvedValue({ id: "like_1" });

    const req = makeRequest("POST");
    const res = await LIKE(req, { params: Promise.resolve({ id: "interview_1" }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.liked).toBe(true);
  });

  it("toggles like off — deletes the like record", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockPrisma.like.findFirst.mockResolvedValue({ id: "like_1" });
    mockPrisma.like.delete.mockResolvedValue({});

    const req = makeRequest("POST");
    const res = await LIKE(req, { params: Promise.resolve({ id: "interview_1" }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.liked).toBe(false);
  });
});

// ── POST /api/interviews/[id]/save ────────────────────────────────────────────
describe("POST /api/interviews/[id]/save", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = makeRequest("POST");
    const res = await SAVE(req, { params: Promise.resolve({ id: "interview_1" }) });
    expect(res.status).toBe(401);
  });

  it("saves an interview when not already saved", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockPrisma.savedInterview.findUnique.mockResolvedValue(null);
    mockPrisma.savedInterview.create.mockResolvedValue({ id: "saved_1" });

    const req = makeRequest("POST");
    const res = await SAVE(req, { params: Promise.resolve({ id: "interview_1" }) });
    const data = await res.json();

    expect(data.saved).toBe(true);
  });

  it("unsaves an interview when already saved", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockPrisma.savedInterview.findUnique.mockResolvedValue({ id: "saved_1" });
    mockPrisma.savedInterview.delete.mockResolvedValue({});

    const req = makeRequest("POST");
    const res = await SAVE(req, { params: Promise.resolve({ id: "interview_1" }) });
    const data = await res.json();

    expect(data.saved).toBe(false);
  });
});
