"use client";
import InterviewModal from "@/components/ui/interview-modal";
import React, { useEffect, useState } from "react";

type Interview = {
  id: string;
  title: string;
  role: string;
  difficulty: string;
  visibility: string;
  topics: string[];
  questionCount: number;
  createdBy: string;

  likes: number;
  isLiked: boolean;

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

const ExplorePage = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularInterviews = async () => {
      try {
        const res = await fetch("/api/interviews?visibility=public");
        const data = await res.json();

        console.log("Fetched interviews", data);

        setInterviews(data.interviews ?? []);
      } catch (error) {
        console.log("Failed to fetch interviews", error);
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPopularInterviews();
  }, []);

  return (
    <div>
      <div className="flex flex-wrap gap-x-3 gap-y-5 mt-5 pb-5">
        {interviews.map((interview) => (
          <InterviewModal key={interview.id} interview={interview} />
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
