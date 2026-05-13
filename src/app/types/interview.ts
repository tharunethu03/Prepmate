export type Interview = {
  id: string;
  title: string;
  role: string;
  difficulty: string;
  visibility: string;
  topics: string[];
  questionCount: number;
  createdBy: string;
  description: string;
  interviewType: "technical" | "behavioral" | "hr" | "mixed";

  questions: {
    id: string;
    question: string;
    answer: string;
    keywords: string[];
  }[];

  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  likeCount?: number;

  attemptCount: number;
  recentAttemptees: {
    id: string;
    avatar: string | null;
  }[];

  // The current user's latest attempt on this interview (null if never attempted)
  userAttempt?: {
    id: string;
    status: "IN_PROGRESS" | "SUBMITTED" | "ABANDONED";
    score: number | null;
    submittedAt: string | null;
  } | null;

  creator: {
    id: string;
    name: string | null;
    avatar: string | null;
  };

  // Field of the creator who made this interview — used for field-priority sorting
  creatorField?: string | null;
};
