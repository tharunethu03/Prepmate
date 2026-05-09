<p align="center">
  <img width="314" height="50" alt="logo-text" src="https://github.com/user-attachments/assets/1d1dc2e8-ae91-4448-8300-b24bd9423f53" />
</p>

<p align="center">
  <strong>AI-Powered Gamified Web Platform for Interactive Interview Preparation</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest" />
  <img src="https://img.shields.io/badge/Tests-90%20passing-brightgreen" />
</p>

<br>

> *"Practice smarter, get ready faster — with PREPMATE."*

---

## Table of Contents

1. [Abstract](#abstract)
2. [Project Overview](#project-overview)
3. [Key Features](#key-features)
4. [System Architecture](#system-architecture)
5. [Tech Stack](#tech-stack)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Project Structure](#project-structure)
9. [Prerequisites](#prerequisites)
10. [Environment Variables](#environment-variables)
11. [Installation & Setup](#installation--setup)
12. [Running the Project](#running-the-project)
13. [Testing](#testing)
14. [Test Suite Breakdown](#test-suite-breakdown)
15. [Methodology](#methodology)
16. [UI Designs](#ui-designs)
17. [Future Enhancements](#future-enhancements)
18. [Developer](#developer)
19. [License](#license)

---

## Abstract

PREPMATE is a full-stack, AI-powered web application developed as a Final Year Project (FYP) to address the shortcomings of conventional interview preparation tools. Most existing platforms offer static, one-size-fits-all content with no personalisation or meaningful feedback. PREPMATE bridges this gap by combining large language model (LLM) driven question generation and answer evaluation, a comprehensive gamification engine (XP, levels, badges, leaderboards, challenges), and social networking features — all within a responsive, accessible web interface.

The system is built on the Next.js 16 App Router (full-stack), backed by MongoDB Atlas via Prisma ORM, secured with NextAuth.js, and tested with a fully automated Vitest test suite covering 90 test cases across 12 test files.

---

## Project Overview

Traditional interview preparation is often generic and unstructured, leaving candidates underprepared and unmotivated. PREPMATE addresses these challenges through:

- **Personalisation** — Interview questions are filtered by role, difficulty, topic, and user history
- **AI Feedback** — LLaMA 3.3 70B (via Groq) evaluates open-ended answers in real time and returns structured feedback
- **Gamification** — XP points, levels (formula: `floor(sqrt(xp / 100)) + 1`), 18 achievement badges, leaderboards, and peer challenges drive long-term engagement
- **Social Layer** — Friend system (send/accept/decline requests, unfriend), creator follows, and challenge-a-friend functionality
- **Creator Economy** — Approved creators can publish custom interview sets for the community
- **Admin Panel** — Administrators manage users, review creator applications, and monitor platform statistics

---

## Key Features

| Feature | Description |
|---|---|
| AI Question Generation | LLaMA 3.3 70B (via Groq) generates questions tailored to role, difficulty, and topic |
| AI Answer Evaluation | Keyword and LLM-based scoring with per-question feedback |
| Resume-Based Interviews | Upload a PDF resume; questions are generated from its content |
| Gamification Engine | XP, levels, 18 badges, leaderboard, challenges |
| Custom Interview Builder | Drag-and-drop editor for creating and publishing interview sets |
| Friend System | Send, accept, decline friend requests; unfriend |
| Creator Follows | Follow content creators and see their interviews in the feed |
| Peer Challenges | Challenge a friend to attempt the same interview; compare scores |
| Email Verification | Token-based signup flow with one-click email verification |
| Password Reset | Secure token-based password recovery via email |
| Dark / Light Mode | System-aware theme with manual override (next-themes) |
| Admin Dashboard | User management, role assignment, creator request moderation, platform stats |
| Rate Limiting | Upstash Redis rate limiting on sensitive API routes |
| Responsive Design | Fully responsive across desktop, tablet, and mobile |

---

## System Architecture

PREPMATE follows the **Next.js App Router full-stack monolith** pattern:

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                  │
│  React 19 · Tailwind CSS 4 · Framer Motion · Recharts│
└──────────────────────┬──────────────────────────────┘
                       │  HTTPS
┌──────────────────────▼──────────────────────────────┐
│              Next.js 16 App Router (Server)          │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  React Server│  │  Route       │  │ NextAuth  │  │
│  │  Components  │  │  Handlers    │  │ Sessions  │  │
│  │  (SSR/SSG)   │  │  (REST API)  │  │ (JWT/DB)  │  │
│  └──────────────┘  └──────┬───────┘  └───────────┘  │
│                            │                         │
│  ┌─────────────────────────▼───────────────────────┐ │
│  │              Business Logic Layer                 │ │
│  │  XP Engine · Badge Engine · Rate Limiter         │ │
│  │  Email Service (Nodemailer) · PDF Parser (unpdf) │ │
│  └─────────────────────────┬───────────────────────┘ │
└──────────────────────────────────────────────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
┌──────────▼──────┐ ┌────────▼────────┐ ┌─────▼──────────┐
│  MongoDB Atlas  │ │  Groq API       │ │  Upstash Redis  │
│  (Prisma ORM)   │ │  LLaMA 3.3 70B  │ │  (Rate Limits)  │
└─────────────────┘ └─────────────────┘ └────────────────┘
```

**Request lifecycle:**
1. The browser sends an HTTP request to a Next.js Route Handler (`/app/api/...`)
2. The route handler verifies the session via NextAuth `getServerSession`
3. Business logic executes (badge checks, XP awards, AI calls, etc.)
4. Prisma ORM translates queries to MongoDB Atlas operations
5. A JSON response is returned to the client

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 | Full-stack framework, App Router, SSR/SSG |
| React | 19 | UI component library |
| TypeScript | 5 | Static type safety |
| Tailwind CSS | 4 | Utility-first styling |
| Framer Motion | 12 | Animations and transitions |
| Recharts | 3 | Data visualisation charts |
| Radix UI | 1 | Accessible headless UI primitives |
| next-themes | 0.4 | Dark/light mode management |
| Lucide React | 0.556 | Icon library |
| Sonner | 2 | Toast notifications |
| canvas-confetti | 1.9 | Celebration animations |
| @dnd-kit | 6/10 | Drag-and-drop question builder |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Next.js Route Handlers | 16 | REST API endpoints |
| NextAuth.js | 4 | Authentication (credentials + OAuth) |
| Prisma ORM | 6 | Type-safe database access |
| Nodemailer | 7 | Transactional email sending |
| bcrypt | 6 | Password hashing |
| @upstash/ratelimit | 2 | Redis-backed API rate limiting |
| unpdf | 1.4 | PDF text extraction for resume parsing |

### Database & Infrastructure
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted NoSQL database |
| Upstash Redis | Serverless Redis for rate limiting |
| Groq (LLaMA 3.3 70B) | AI question generation and answer evaluation |

### Development & Testing
| Technology | Version | Purpose |
|---|---|---|
| Vitest | 4 | Unit and integration testing |
| @vitest/coverage-v8 | 4 | Code coverage reporting |
| ESLint | 9 | Code linting |
| tsx | 4 | TypeScript script execution |

---

## Database Schema

The database consists of **17 Prisma models** mapped to MongoDB Atlas collections:

| Model | Description |
|---|---|
| `User` | Core user record: credentials, profile, XP, level, settings |
| `Account` | OAuth provider accounts linked to a user (NextAuth) |
| `Interview` | Interview sets created by users or AI |
| `Question` | Individual questions belonging to an interview |
| `InterviewAttempt` | A user's single attempt at an interview |
| `QuestionResponse` | Per-question answer and score within an attempt |
| `Like` | Many-to-many: user likes on an interview |
| `SavedInterview` | Bookmarked interviews per user |
| `FriendRequest` | Pending friend connection between two users |
| `Friendship` | Confirmed friendship record (bidirectional) |
| `Challenge` | A challenge sent to a friend for a specific interview |
| `XpEvent` | Immutable audit log of every XP gain/loss |
| `Badge` | Badge definitions seeded into the database |
| `UserBadge` | Many-to-many: badges earned by users |
| `CreatorFollow` | Follow relationship between a user and a creator |
| `VerificationToken` | Password reset tokens with expiry |
| `PendingRegistration` | Temporary pre-verification user record |

**XP Level Formula:**
```
level = floor(sqrt(xp / 100)) + 1
```
Examples: 0 XP → Level 1 · 100 XP → Level 2 · 400 XP → Level 3 · 900 XP → Level 4

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Register new user (creates pending record, sends verification email) |
| GET | `/api/auth/verify-email` | Verify email token and create user account |
| GET | `/api/auth/check-verification` | Poll for email verification status |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Apply new password using reset token |
| POST | `/api/auth/change-password-request` | Change password for authenticated user |
| POST | `/api/auth/resend-verification` | Resend verification email |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth session endpoints |

### Interviews
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/interviews` | List public interviews (filterable by role, difficulty, topic) |
| POST | `/api/interviews` | Create a new interview set |
| GET | `/api/interviews/[id]` | Get a single interview with questions |
| DELETE | `/api/interviews/[id]` | Delete an interview (owner only) |
| POST | `/api/interviews/[id]/like` | Toggle like on/off |
| POST | `/api/interviews/[id]/save` | Toggle save (bookmark) on/off |

### Attempts
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/attempts` | Submit an interview attempt with responses |
| GET | `/api/attempts/[id]` | Get a specific attempt with feedback |

### Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/profile` | Get the authenticated user's profile |
| POST | `/api/profile-setup` | Complete or update profile setup |
| GET | `/api/profile/[userId]` | Get public profile of another user |

### Social — Friends
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/friends` | List friends, sent requests, and received requests |
| POST | `/api/friends` | Send a friend request |
| PATCH | `/api/friends/[requestId]` | Accept or decline a friend request |
| DELETE | `/api/friends/[requestId]` | Unfriend (delete friendship) |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/search` | Search users by name (students and creators) |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Platform-wide statistics (admin only) |
| GET | `/api/admin/users/[id]` | Get a specific user (admin only) |
| PATCH | `/api/admin/users/[id]` | Update user role (admin only) |
| GET | `/api/admin/creator-requests` | List pending creator applications (admin only) |
| PATCH | `/api/admin/creator-requests/[userId]` | Approve or decline a creator request (admin only) |

### Other
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tts` | Text-to-speech conversion for question audio |
| POST | `/api/resume` | Parse uploaded PDF resume for AI interview generation |
| GET | `/api/notifications` | Get user notifications |

---

## Project Structure

```
prepmate/
├── prisma/
│   ├── schema.prisma          # Database schema (17 models)
│   └── seed.ts                # Badge seeding script
├── scripts/
│   └── reset-admin-password.mjs   # Admin password recovery utility
├── public/                    # Static assets (logo, avatars, images)
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth pages: login, signup, verify-email, etc.
│   │   ├── (pages)/           # Main app pages (dashboard, interviews, profile…)
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── api/               # All REST API route handlers
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── interviews/    # Interview CRUD + like/save
│   │   │   ├── friends/       # Friend request management
│   │   │   ├── users/         # User search
│   │   │   ├── admin/         # Admin-only endpoints
│   │   │   └── …              # Other routes
│   │   ├── globals.css        # Global styles + custom utilities
│   │   ├── layout.tsx         # Root layout (ThemeProvider, Providers, Toaster)
│   │   └── providers.tsx      # SessionProvider wrapper
│   ├── components/            # Reusable UI components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── xp.ts              # XP award logic and level calculation
│   │   ├── badges.ts          # Badge award and check logic
│   │   ├── badge-definitions.ts  # 18 badge definitions
│   │   ├── mailer.ts          # Nodemailer transporter
│   │   ├── ratelimit.ts       # Upstash rate limiter
│   │   ├── utils.ts           # cn() class merging utility
│   │   └── …                  # Email templates, helpers
│   └── __tests__/
│       ├── setup.ts            # Global mock configuration
│       ├── lib/
│       │   ├── utils.test.ts   # cn() utility tests
│       │   ├── xp.test.ts      # XP engine tests
│       │   └── badges.test.ts  # Badge system tests
│       └── api/
│           ├── auth/           # Auth endpoint tests
│           ├── interviews/     # Interview endpoint tests
│           ├── friends/        # Friends endpoint tests
│           ├── admin/          # Admin endpoint tests
│           ├── users-search.test.ts
│           └── profile.test.ts
├── vitest.config.ts            # Vitest configuration
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

---

## Prerequisites

Before setting up the project, ensure the following are installed on your machine:

| Requirement | Minimum Version | Check Command |
|---|---|---|
| Node.js | 18.17 or later | `node --version` |
| npm | 9 or later | `npm --version` |
| Git | Any recent | `git --version` |

You will also need accounts and credentials for:
- **MongoDB Atlas** — cloud database (free tier is sufficient)
- **Groq** — API key for LLaMA 3.3 70B inference (free tier available at console.groq.com)
- **Upstash** — Redis database for rate limiting (free tier available)
- **SMTP Email Provider** — for sending verification and reset emails (Gmail, SendGrid, etc.)

---

## Environment Variables

Create a `.env` file in the project root. All variables below are required:

```env
# ── Database ──────────────────────────────────────────────────────────
# MongoDB Atlas connection string
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority"

# ── NextAuth ───────────────────────────────────────────────────────────
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# ── Groq ───────────────────────────────────────────────────────────────
GROQ_API_KEY="gsk_..."

# ── Email (SMTP via Nodemailer) ────────────────────────────────────────
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="PREPMATE <your-email@gmail.com>"

# ── Upstash Redis (Rate Limiting) ──────────────────────────────────────
UPSTASH_REDIS_REST_URL="https://your-upstash-endpoint.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# ── App URL ────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Gmail note:** Use an [App Password](https://myaccount.google.com/apppasswords) (not your account password) when 2FA is enabled.

---

## Installation & Setup

Follow these steps in order to get the project running locally.

### 1. Clone the repository

```bash
git clone https://github.com/tharunethu03/prepmate.git
cd prepmate
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

### 4. Generate Prisma client

```bash
npx prisma generate
```

### 5. Seed the database (required — seeds the 18 badge definitions)

```bash
npx tsx prisma/seed.ts
```

> This must be run at least once before the application works correctly. It creates badge records in MongoDB that the gamification engine references.

---

## Running the Project

### Development mode (recommended for local development)

```bash
npm run dev
```

This starts the Next.js dev server with Turbopack at [http://localhost:3000](http://localhost:3000). The server hot-reloads on file changes.

### Production build

```bash
npm run build
```

This runs `prisma generate` then `next build`. The output is a standalone Next.js production build.

### Start production server

```bash
npm run start
```

Starts the production server. Run `npm run build` first.

### Lint

```bash
npm run lint
```

Runs ESLint across the codebase using the Next.js ESLint config.

### Admin account setup

After seeding, reset or set the admin password using the provided utility script:

```bash
node scripts/reset-admin-password.mjs
```

This directly updates the first `ADMIN`-role user's password in the database. Edit the `NEW_PASSWORD` constant in the script before running.

---

## Testing

The project uses **Vitest** as the testing framework. All tests run in a Node.js environment with all external services (database, email, AI, authentication) fully mocked — no live credentials are needed to run tests.

### Run all tests (single pass)

```bash
npm test
```

### Run tests in watch mode (re-runs on file change)

```bash
npm run test:watch
```

### Run tests with coverage report

```bash
npm run test:coverage
```

Coverage reports are generated in two formats:
- **Terminal** — inline summary after the run
- **HTML** — open `coverage/index.html` in a browser for a detailed view

### Expected output

```
 Test Files  12 passed (12)
      Tests  90 passed (90)
   Duration  ~535ms
```

### How the test suite is structured

```
src/__tests__/
├── setup.ts              # Global mock setup (runs before every test file)
├── lib/
│   ├── utils.test.ts     # Utility function tests
│   ├── xp.test.ts        # XP engine and level formula tests
│   └── badges.test.ts    # Badge system tests
└── api/
    ├── auth/
    │   ├── register.test.ts           # POST /api/register
    │   ├── verify-email.test.ts       # GET /api/auth/verify-email
    │   ├── check-verification.test.ts # GET /api/auth/check-verification
    │   └── forgot-password.test.ts    # POST /api/auth/forgot-password
    ├── interviews/
    │   └── interviews.test.ts         # GET/POST /api/interviews + like/save
    ├── friends/
    │   └── friends.test.ts            # GET/POST/PATCH/DELETE /api/friends
    ├── admin/
    │   └── admin.test.ts              # Admin stats, user management, creator requests
    ├── users-search.test.ts           # GET /api/users/search
    └── profile.test.ts                # GET /api/profile + profile setup
```

### Global mock strategy (`src/__tests__/setup.ts`)

The setup file runs before every test and provides:
- **Prisma mock** — all 17 models with all methods replaced by `vi.fn()`
- **NextAuth mock** — both `"next-auth"` and `"next-auth/next"` entry points mocked to prevent `NextAuth()` from executing at import time
- **Route mock** — `@/app/api/auth/[...nextauth]/route` mocked to return stub `authOptions`
- **Mailer mock** — `sendMail` returns `{ messageId: "mock-id" }`
- **bcrypt mock** — `hash` returns `"hashed_password"`, `compare` returns `true`
- **crypto mock** — `randomBytes` returns a deterministic token

Helper exports:
- `makeSession(overrides?)` — creates a mock NextAuth session object
- `makeAdminSession(overrides?)` — creates a session with `role: "ADMIN"`
- `makeRequest(method, body?, searchParams?)` — creates a mock `Request` object
- `mockInterviewFull` — complete interview fixture with all relations
- `mockUserFull` — complete user fixture with all relations

---

## Test Suite Breakdown

| # | Test File | Tests | Area Covered |
|---|---|---|---|
| 1 | `lib/utils.test.ts` | 7 | `cn()` class merging utility |
| 2 | `lib/xp.test.ts` | 4 | XP awarding, level formula, edge cases |
| 3 | `lib/badges.test.ts` | 11 | Badge definitions, `awardBadge()`, `checkAndAwardBadges()` |
| 4 | `api/auth/register.test.ts` | 3 | Registration: duplicate email, success, DB error |
| 5 | `api/auth/verify-email.test.ts` | 4 | Email verification: missing token, invalid, expired, success |
| 6 | `api/auth/check-verification.test.ts` | 4 | Verification polling: no email, user not found, unverified, verified |
| 7 | `api/auth/forgot-password.test.ts` | 4 | Password reset: missing email, enumeration guard, sends email, OAuth skip |
| 8 | `api/interviews/interviews.test.ts` | 15 | Interview CRUD, like toggle, save toggle |
| 9 | `api/friends/friends.test.ts` | 17 | Friend request lifecycle, accept/decline, unfriend |
| 10 | `api/users-search.test.ts` | 6 | User search: auth, min-length, all roles, self-exclusion, friendship annotation |
| 11 | `api/admin/admin.test.ts` | 10 | Admin auth guard, stats, role change, creator request approve/decline |
| 12 | `api/profile.test.ts` | 5 | Profile retrieval, 404 handling, profile setup |
| | **Total** | **90** | |

---

## Methodology

PREPMATE was developed using an **Agile iterative approach** over two academic semesters:

### Development Phases

**Phase 1 — Requirements & Design**
- Stakeholder analysis and user story mapping
- System architecture design (App Router monolith with MongoDB)
- Database schema design and entity relationship modelling
- UI/UX wireframing and prototype design

**Phase 2 — Core Development**
- Authentication system (email/password + email verification)
- Interview CRUD with AI-powered question generation (LLaMA 3.3 70B via Groq)
- Interview attempt flow with real-time AI evaluation
- Dashboard with statistics and recent activity

**Phase 3 — Gamification & Social**
- XP engine with dynamic level calculation
- 18-badge achievement system
- Friend request system and challenges
- Creator follow system and discovery feed

**Phase 4 — Refinement & Testing**
- Admin dashboard and moderation tools
- Resume-based interview generation (PDF parsing)
- Rate limiting on sensitive endpoints
- Automated test suite (90 tests across 12 files)
- Performance and security hardening

### Design Decisions

| Decision | Rationale |
|---|---|
| Next.js App Router full-stack | Eliminates separate backend service; API routes and pages coexist |
| MongoDB + Prisma | Flexible schema for nested interview/question data; type-safe ORM |
| NextAuth v4 | Mature, battle-tested auth for Next.js with credential + OAuth support |
| Vitest over Jest | Faster, native ESM support, first-class TypeScript, compatible with Next.js |
| Mock-first testing | All external services mocked — tests are deterministic, fast, and CI-safe |
| Client-side email verification | Verification page fetches token client-side, preventing email scanner token consumption |

---

## UI Designs

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">

  <img src="https://github.com/user-attachments/assets/3fca6835-6712-43d2-acca-9cc1ebf6ee46" width="300"/>

  <img src="https://github.com/user-attachments/assets/44f97af6-ee55-4643-ae27-948ccfaead73" width="300" />

  <img src="https://github.com/user-attachments/assets/a55bcef8-9f8f-4271-a89e-7d70620ca7c5" width="300" />

  <img src="https://github.com/user-attachments/assets/6460690b-99e8-42c1-b67b-713f0d9eab57" width="300" />

  <img src="https://github.com/user-attachments/assets/b985236f-37e3-46a3-a132-9de73e14697b" width="300" />

  <img src="https://github.com/user-attachments/assets/0b264138-21ae-4afb-95b9-6f5751ebc09a" width="300"/>

</div>

---

## Future Enhancements

| Enhancement | Description |
|---|---|
| Voice Interview Mode | Real-time speech-to-text with conversational AI interviewer |
| AI Performance Prediction | Predict interview success probability based on attempt history |
| Streak System | Daily practice streaks with streak-break protection |
| Collaborative Mock Interviews | Live video sessions where two users interview each other |
| Mobile Application | Native iOS/Android app using React Native |
| Analytics Dashboard | Detailed creator insights: views, attempt rates, average scores |
| Certification System | Generate shareable PDF certificates upon completing interview tracks |
| LMS Integration | Export results to Learning Management Systems |

---

## Developer

**Tharunethu Gampola**
Final Year Undergraduate — BSc (Hons) in Computing / Software Engineering
*(Final Year Project: PREPMATE)*

[Portfolio](https://tharunerthu03.vercel.app/) &nbsp;&nbsp;&nbsp; [LinkedIn](https://www.linkedin.com/in/tharunethu-gampola-4219a2296) &nbsp;&nbsp;&nbsp; [GitHub](https://github.com/tharunethu03/)

---

## License

This project is developed solely for academic purposes as a Final Year Project (FYP) submission.
All rights reserved © 2025 Tharunethu Gampola.

Unauthorised reproduction, distribution, or commercial use of any part of this codebase is prohibited without explicit written permission from the author.

---

<p align="center">
  Developed with dedication as a Final Year Project &nbsp;|&nbsp; PREPMATE © 2025
</p>
