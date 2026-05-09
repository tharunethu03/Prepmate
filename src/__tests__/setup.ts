import { vi } from "vitest";

// ── NextAuth route mock — prevents NextAuth() being called at import time ───────
vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
  GET: vi.fn(),
  POST: vi.fn(),
}));

// ── NextAuth mocks (both entry points) ────────────────────────────────────────
vi.mock("next-auth", () => ({
  default: vi.fn(() => ({ GET: vi.fn(), POST: vi.fn() })),
  getServerSession: vi.fn(),
}));

vi.mock("next-auth/next", () => ({
  default: vi.fn(() => ({ GET: vi.fn(), POST: vi.fn() })),
  getServerSession: vi.fn(),
}));

// ── Prisma mock ────────────────────────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    pendingRegistration: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    interview: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    interviewAttempt: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _avg: { score: 72 } }),
    },
    questionResponse: {
      create: vi.fn(),
      createMany: vi.fn(),
    },
    question: {
      findMany: vi.fn(),
    },
    like: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    savedInterview: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    friendship: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    friendRequest: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    challenge: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    badge: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    userBadge: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    xpEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    verificationToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    creatorFollow: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn((ops: unknown) =>
      Array.isArray(ops) ? Promise.all(ops) : ops,
    ),
  },
}));

// ── Mailer mock ────────────────────────────────────────────────────────────────
vi.mock("@/lib/mailer", () => ({
  default: {
    sendMail: vi.fn().mockResolvedValue({ messageId: "mock-id" }),
  },
}));

// ── Bcrypt mock ────────────────────────────────────────────────────────────────
vi.mock("bcrypt", () => ({
  hash: vi.fn().mockResolvedValue("hashed_password"),
  compare: vi.fn().mockResolvedValue(true),
}));

// ── Crypto mock — deterministic token ─────────────────────────────────────────
vi.mock("crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("crypto")>();
  return {
    ...actual,
    randomBytes: vi.fn(() => ({ toString: () => "mock_token_abc123" })),
  };
});

// ── Shared test helpers ────────────────────────────────────────────────────────
export function makeSession(overrides = {}) {
  return {
    user: {
      id: "user_1",
      email: "test@example.com",
      name: "Test User",
      role: "STUDENT",
      profileCompleted: true,
      ...overrides,
    },
    expires: new Date(Date.now() + 3600 * 1000).toISOString(),
  };
}

export function makeAdminSession(overrides = {}) {
  return makeSession({ role: "ADMIN", ...overrides });
}

export function makeRequest(
  method: string,
  body?: object,
  searchParams?: Record<string, string>,
): Request {
  const url = new URL("http://localhost:3000/api/test");
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) =>
      url.searchParams.set(k, v),
    );
  }
  return new Request(url.toString(), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/** Full interview shape the findMany mapping expects */
export const mockInterviewFull = {
  id: "interview_1",
  title: "React Basics",
  role: "Frontend Dev",
  description: "A test interview",
  difficulty: "beginner",
  topics: ["React"],
  mode: "ai",
  visibility: "public",
  questionCount: 5,
  interviewType: "technical",
  createdBy: "user_1",
  source: null,
  creator: { name: "Test User", avatar: null },
  _count: { likes: 3, attempts: 10 },
  likes: [],
  savedInterviews: [],
  attempts: [],
  questions: [
    { id: "q_1", question: "What is React?", answer: "A UI library", keywords: ["react"] },
  ],
};

/** Full user shape with relations the profile route expects */
export const mockUserFull = {
  id: "user_1",
  name: "Test User",
  email: "test@example.com",
  field: "Engineering",
  roleTitle: "Developer",
  avatar: "/profile-setup/avatar1.png",
  level: 3,
  xp: 350,
  role: "STUDENT",
  profileCompleted: true,
  showXp: true,
  showScore: true,
  showAttempts: true,
  creatorRequest: false,
  creatorRequestStatus: null,
  portfolioLink: null,
  linkedinLink: null,
  githubLink: null,
  interviews: [],
  attempts: [],
  badges: [],
  followers: [],
  following: [],
  _count: { attempts: 5, interviews: 0 },
};
