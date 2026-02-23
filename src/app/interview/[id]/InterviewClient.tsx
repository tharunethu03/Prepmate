"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Interview } from "@/app/types/interview";
import CameraComponent from "@/components/ui/camera";
import { useSession } from "next-auth/react";
import Agent from "@/components/ui/Agent";

type InterviewClientProps = {
  interview: Interview;
};

export default function InterviewClient({ interview }: InterviewClientProps) {
  const router = useRouter();

  const [showExitModal, setShowExitModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [allowNavigation, setAllowNavigation] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!allowNavigation) {
        e.preventDefault();
        e.returnValue = ""; // Required for browser confirmation
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [allowNavigation]);

  useEffect(() => {
    const handlePopState = () => {
      if (!allowNavigation) {
        window.history.pushState(null, "", window.location.href);
        setShowExitModal(true);
      }
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [allowNavigation]);

  const handleExitConfirm = () => {
    router.push("/dashboard");
  };

  const session = useSession();

  let color;
  if (interview.difficulty === "beginner") color = "#22c55e";
  else if (interview.difficulty === "intermediate") color = "#facc15";
  else color = "#ef4444";

  return (
    <div className="flex flex-col h-screen gap-5 p-5 ">
      <div className="flex items-center justify-between w-full px-5 py-5 rounded-[22px] border border-border">
        <div>
          <h2>{interview.title}</h2>
          <div className="flex gap-2 mt-3">
            <div className="flex bg-accent w-fit px-3 py-2 rounded-[12px] gap-1 items-center">
              <span className="text-foreground font-bold text-xs">
                {interview.role}
              </span>
            </div>
            <div
              className="flex border w-fit px-3 py-1 rounded-[12px] gap-1 items-center"
              style={{ borderColor: color }}
            >
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-primary font-bold text-xs">
                {interview.difficulty}
              </span>
            </div>
          </div>
        </div>
        {!interviewStarted ? (
          <Button
            onClick={() => setInterviewStarted(true)}
            className="bg-success hover:bg-success/90 px-6 text-white"
          >
            Start Interview
          </Button>
        ) : (
          <Button
            onClick={() => setShowExitModal(true)}
            className="bg-error hover:bg-error/90 px-6 text-white"
          >
            End Interview
          </Button>
        )}
      </div>
      <div className="flex h-dvh w-full gap-5">
        {/* Rest of viewport */}
        <div className="flex flex-col flex-1 rounded-[22px]">
          <div className="border border-border flex-1 min-h-[50px] rounded-t-[22px]">
            <Agent />
          </div>
          <div className="border border-border flex-1 min-h-[50px] rounded-b-[22px]">
            <CameraComponent />
          </div>
        </div>
        <div className="border border-border flex-1 min-h-[50px] rounded-[22px] p-5">
            {interview.questions.map((question, index) => (
              <div key={index} className="w-fit bg-accent text-foreground px-5 py-2 rounded-b-[12px] rounded-tr-[12px] shadow-lg mb-3">
                {question.question}
              </div>
            ))}
        </div>
      </div>
      {showExitModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-100">
          <div className="bg-foreground border border-accent  rounded-[22px] shadow-lg px-10 py-5">
            <div className="flex flex-col items-center justify-center">
              <h3 className="mb-3">Leaving so soon?</h3>
              <p className="sub-text mb-5 max-w-xs text-center">
                You still have questions left to answer.If you leave now, your
                progress won’t be saved. Are you sure you want to end this
                interview?
              </p>
              <div className="flex flex-col gap-3 items-center justify-between w-full px-10">
                <Button
                  variant={"default"}
                  className="cursor-pointer px-6 w-full"
                  onClick={() => setShowExitModal(false)}
                >
                  Continue Interview
                </Button>
                <Button
                  variant={"outline"}
                  className=" hover:bg-error px-6 hover:text-white w-full hover:border-error"
                  onClick={handleExitConfirm}
                >
                  End Anyway
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
