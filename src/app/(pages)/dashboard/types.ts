export type RecentAttempt = {
  id: string;
  score: number | null;
  xpEarned: number;
  submittedAt: string | null;
  interview: {
    id: string;
    title: string;
    difficulty: string;
    role: string;
  };
};

export type ProfileData = {
  id: string;
  name: string | null;
  avatar: string | null;
  xp: number;
  level: number;
  role: string;
  field: string | null;
  _count: { interviews: number; attempts: number };
  attempts: RecentAttempt[];
  xpProgress: {
    current: number;
    needed: number;
    percent: number;
    nextLevel: number;
  };
};

export type LeaderboardEntry = {
  id: string;
  name: string | null;
  avatar: string | null;
  xp: number;
  level: number;
};
