"use client";
import { Interview } from "@/app/types/interview";
import InterviewModal from "@/components/ui/interview-modal";
import InterviewPreviewModal from "@/components/ui/interview-preview-modal";
import { LoaderOne } from "@/components/ui/loader";
import React, { useEffect, useState } from "react";

const SavedInterviewPage = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null,
  );

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await fetch("/api/interviews?saved=true");
        const data = await res.json();
        setInterviews(data.interviews ?? []);
      } catch {
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  return (
    <div>
      <div>
        {loading && (
          <div className="flex items-center justify-center h-full">
            <LoaderOne />
          </div>
        )}
      </div>
      <div className="flex flex-row md:flex-wrap gap-x-3 gap-y-5 overflow-x-auto mt-5 scrollbar-hide">
        {interviews.map((interview) => (
          <InterviewModal
            key={interview.id}
            interview={interview}
            onDelete={(id) =>
              setInterviews((prev) => prev.filter((i) => i.id !== id))
            }
            onPreview={() => setSelectedInterview(interview)}
          />
        ))}
      </div>
      {selectedInterview && (
        <InterviewPreviewModal
          interview={selectedInterview}
          onDelete={(id) =>
            setInterviews((prev) => prev.filter((i) => i.id !== id))
          }
          onClose={() => setSelectedInterview(null)}
        />
      )}
    </div>
  );
};

export default SavedInterviewPage;
