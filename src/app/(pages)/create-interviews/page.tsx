"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import InterviewForm from "./interviewForm";
import InterviewModal from "@/components/ui/interview-modal";
import { LoaderOne } from "@/components/ui/loader";
import { Interview } from "@/app/types/interview";

const CreateInterviewPage = () => {
  const [openForm, setOpenForm] = useState(false);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  const handleCreateInterview = (newInterview: Interview) => {
    setInterviews((prev) => [newInterview, ...prev]);
  };

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await fetch("/api/interviews?mine=true");
        const data = await res.json();

        console.log("Fetched interviews:", data);

        setInterviews(data.interviews ?? []);
      } catch (error) {
        console.log("Failed to fetch interviews", error);
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  return (
    <div className="py-5">
      <TooltipProvider delayDuration={800}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Button
              onClick={() => setOpenForm(true)}
              variant="default"
              size="icon"
              className="absolute bottom-10 right-10 w-18 h-18 rounded-[22px] p-0 hover:scale-105 transition-transform "
            >
              <PlusIcon className="size-10" />
            </Button>
          </Tooltip.Trigger>
          <TooltipContent
            side="top"
            align="center"
            className="rounded-[12px] border border-border"
          >
            <p className="text-sm text-secondary">Create</p>
          </TooltipContent>
        </Tooltip.Root>
      </TooltipProvider>

      <div>
        <h2>My Interviews</h2>
        <p className="sub-text">Here you can manage your own interviews.</p>

        {loading && (
          <div className="flex items-center justify-center h-full">
            <LoaderOne />
          </div>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-5 mt-5 pb-5">
          {interviews.map((interview) => (
            <InterviewModal
              key={interview.id}
              interview={interview}
              onDelete={(id) =>
                setInterviews((prev) => prev.filter((i) => i.id !== id))
              }
            />
          ))}
        </div>
      </div>
      {openForm && (
        <InterviewForm
          onFinish={() => setOpenForm(false)}
          onCreate={handleCreateInterview}
        />
      )}
    </div>
  );
};

export default CreateInterviewPage;
