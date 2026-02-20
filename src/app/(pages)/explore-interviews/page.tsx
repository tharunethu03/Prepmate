"use client";
import { Interview } from "@/app/types/interview";
import InterviewModal from "@/components/ui/interview-modal";
import InterviewPreviewModal from "@/components/ui/interview-preview-modal";
import React, { useEffect, useState } from "react";

const ExplorePage = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null,
  );

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
          <InterviewModal
            key={interview.id}
            interview={interview}
            onPreview={() => setSelectedInterview(interview)}
          />
        ))}
      </div>
      {selectedInterview && (
        <InterviewPreviewModal
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
        />
      )}
    </div>
  );
};

export default ExplorePage;
