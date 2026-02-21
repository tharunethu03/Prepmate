"use client";

import { Button } from "@/components/ui/button";
import { Lightbulb, TriangleAlert, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { SortableQuestion } from "@/components/ui/sortable-question";
import { Interview } from "@/app/types/interview";

type Question = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
};

type InterviewPreviewData = {
  title: string;
  role: string;
  description: string;
  topics: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  numberOfQuestion: number;
  mode: "ai" | "custom";
  visibility: "public" | "private";
  questions: Question[];
};

type InterviewPreviewProps = {
  data: InterviewPreviewData;
  onBack: () => void;
  onConfirm: () => void;
  onCreate: (interview: Interview) => void; // ✅ add this
};

export default function InterviewPreview({
  data,
  onBack,
  onConfirm,
  onCreate,
}: InterviewPreviewProps) {
  const { data: session } = useSession();
  const avatar = session?.user?.avatar;
  const userName = session?.user?.name;
  const [questions, setQuestions] = useState(data.questions);

  const difficultyLevel = data.difficulty;

  let color;

  if (difficultyLevel === "beginner") color = "#22c55e";
  else if (difficultyLevel === "intermediate") color = "#facc15";
  else color = "#ef4444";

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setQuestions((items) => {
      const oldIndex = items.findIndex((q) => q.id === active.id);
      const newIndex = items.findIndex((q) => q.id === over.id);

      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          role: data.role,
          description: data.description,
          topics: data.topics,
          difficulty: data.difficulty,
          mode: data.mode,
          visibility: data.visibility,
          questions,
        }),
      });

      if (!res.ok) throw new Error("Failed to create interview");

      const createdInterview: Interview = await res.json();

      onCreate(createdInterview);
      onConfirm();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0   z-[60] flex items-center justify-center">
      <div className="bg-foreground border-1 border-accent px-5 md:px-10 py-10 rounded-[22px] max-w-6xl max-h-[90vh] w-[90%] md:w-full relative flex flex-col mx-5 md:mx-0 overflow-y-auto scrollbar-hide">
        <button
          className="absolute top-5 right-5 text-tertiary hover:text-secondary cursor-pointer"
          onClick={onBack}
        >
          <X />
        </button>

        <h2>{data.title}</h2>
        <div className="flex gap-2 my-5">
          <div className="flex bg-accent w-fit px-3 py-1.5 rounded-[12px] gap-1 items-center">
            <Image
              src={avatar || "/profile-setup/avatar1.png"}
              width={25}
              height={25}
              alt="AVATAR"
              className="rounded-full "
            />
            <span className="text-foreground font-bold text-xs">
              {userName}
            </span>
          </div>
          <div className="flex bg-accent w-fit px-3 py-1.5 rounded-[12px] gap-1 items-center">
            <span className="text-foreground font-bold text-xs">
              {data.role}
            </span>
          </div>
          <div
            className="flex border w-fit px-3 py-1.5 rounded-[12px] gap-1 items-center"
            style={{ borderColor: color }}
          >
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-primary font-bold text-xs">
              {data.difficulty}
            </span>
          </div>
        </div>

        <div className="space-y-4 text-secondary text-md">
          <div>
            <div className="flex items-center gap-2">
              <p className=" text-muted-foreground">Topics :</p>
              <div className="flex flex-wrap gap-2">
                {data.topics.map((topic: string) => (
                  <span key={topic} className="px-3 py-1 rounded-full border ">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="whitespace-pre-wrap break-words">
              {data.description}
            </p>
          </div>

          <div className="space-y-3 border border-border rounded-[12px] p-5">
            {data.mode === "custom" ? (
              <p className="sub-text">Custom made questions</p>
            ) : (
              <p className="sub-text">AI generated questions</p>
            )}
            <hr />

            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={questions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {questions.map((q) => (
                    <SortableQuestion key={q.id} question={q} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <p className="flex gap-1 text-xs text-tertiary mb-2 mt-5">
              <span>
                <Lightbulb size={15} />
              </span>
              Drag questions to reorder
            </p>
          </div>
          <div className="flex gap-5 items-center px-2 text-tertiary">
            <TriangleAlert size={20} />
            <p className="text-tertiary text-xs">
              Please confirm the details above before creating your interview.
              Once created, you’ll be able to start it immediately or share it
              if it’s public. You can delete but{" "}
              <span className="text-accent">cannot edit</span> it after the
              interview goes public.
            </p>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button className="w-30 h-10" variant="outline" onClick={onBack}>
            Edit
          </Button>
          <Button className="h-10" onClick={handleSubmit}>
            Confirm & Create
          </Button>
        </div>
      </div>
    </div>
  );
}
