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
  questions: {
    id: string;
    question: string;
    answer: string;
    keywords: string[];
  }[];

  likes: number;
  isLiked: boolean;
  isSaved: boolean;

  creator: {
    id: string;
    name: string | null;
    avatar: string | null;
  };

  candidates: {
    id: string;
    avatar: string | null;
  }[];
};
