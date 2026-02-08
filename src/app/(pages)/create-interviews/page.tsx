"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import React, { useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import Onboarding from "@/app/(auth)/onboarding/page";
import InterviewForm from "./interviewForm";

const CreateInterviewPage = () => {
  const [openForm, setOpenForm] = useState(false);

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
      </div>
      {openForm && (
        <InterviewForm onFinish={() => setOpenForm(false)} />
      )}
    </div>
  );
};

export default CreateInterviewPage;
