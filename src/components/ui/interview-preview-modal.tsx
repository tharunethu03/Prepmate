import {
  Bookmark,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "./avatar";
import { Button } from "./button";
import { motion } from "framer-motion";
import { Interview } from "@/app/types/interview";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";

type InterviewPreviewModalProps = {
  interview: Interview;
  onDelete?: (id: string) => void;
  onClose: () => void;
};

const InterviewPreviewModal = ({
  interview,
  onDelete,
  onClose,
}: InterviewPreviewModalProps) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const [saved, setSaved] = useState(interview.isSaved);
  const [likes, setLikes] = useState(interview.likes);
  const [liked, setLiked] = useState(interview.isLiked);
  const [deletemodal, setDeleteModal] = useState(false);

  const session = useSession();

  const handleSave = async () => {
    if (!session) return;

    try {
      const res = await fetch(`/api/interviews/${interview.id}/save`, {
        method: "POST",
      });

      if (!res.ok) return;

      const data = await res.json();

      setSaved(data.saved);

      // Remove from UI instantly if unsaved
      if (!data.saved) {
        onDelete?.(interview.id);
      }
    } catch (error) {
      console.log("Error saving interview", error);
    }
  };

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/interviews/${interview.id}/like`, {
        method: "POST",
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data.liked) {
        setLikes((prev) => prev + 1);
        setLiked(true);
      } else {
        setLikes((prev) => prev - 1);
        setLiked(false);
      }
    } catch (error) {
      console.log("Error liking interview", error);
    }
  };

  const userId = session?.data?.user.id;

  let color;

  if (interview.difficulty === "beginner") color = "#22c55e";
  else if (interview.difficulty === "intermediate") color = "#facc15";
  else color = "#ef4444";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-foreground rounded-2xl shadow-lg p-10 mx-5 border-2 border-accent  w-[110vh] h-[85vh] relative">
        <button
          className="absolute top-5 right-5 text-tertiary hover:text-secondary cursor-pointer"
          onClick={onClose}
        >
          <X />
        </button>
        <div className="flex flex-col h-full">
          <h2>{interview.title}</h2>
          <div className="flex gap-2 my-5">
            <div className="flex bg-accent w-fit px-3 py-1 rounded-[12px] gap-1 items-center">
              <Image
                src={interview.creator?.avatar || "/profile-setup/avatar1.png"}
                width={25}
                height={25}
                alt="AVATAR"
                className="rounded-full "
              />
              <span className="text-foreground font-bold text-xs">
                {interview.creator?.name || "Unknown"}
              </span>
            </div>
            <div className="flex bg-accent w-fit px-3 py-1 rounded-[12px] gap-1 items-center">
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
          <p className="sub-text">Topics : {interview.topics.join(", ")}</p>
          <p className="sub-text mt-5">{interview.description}</p>
          <button
            onClick={() => setShowQuestions((prev) => !prev)}
            className="border w-full px-3 py-3 mt-5"
          >
            {showQuestions ? (
              <div className="flex items-center justify-between w-full text-secondary">
                <p className="text-sm">Preview interview questions</p>
                <p className=" text-xs">
                  (Not recommended if you want an authentic interview
                  experience)
                </p>
                <ChevronUp />
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <p className="text-sm">Preview interview questions</p>
                <p className=" text-xs text-error">
                  (Not recommended if you want an authentic interview
                  experience)
                </p>
                <ChevronDown />
              </div>
            )}
          </button>
          {showQuestions && (
            <div className="flex flex-col px-3 py-3 overflow-y-auto scrollbar-hide text-sm gap-3 border border-border mb-5">
              {interview.questions?.length ? (
                interview.questions.map((q, index) => (
                  <div key={q.id} className="flex items-center gap-3">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                    <p className="text-primary">{q.question}</p>
                  </div>
                ))
              ) : (
                <p className="text-secondary text-center">
                  No questions available
                </p>
              )}
            </div>
          )}
          <div className="flex items-center justify-between text-end mt-auto">
            <div>
              <AvatarGroup>
                {interview.candidates?.slice(0, 5).map((candidate) => (
                  <Avatar key={candidate.id}>
                    <AvatarImage
                      src={candidate.avatar || "/profile-setup/avatar1.png"}
                      alt="candidate-avatar"
                    />
                    <AvatarFallback>C</AvatarFallback>
                  </Avatar>
                ))}
                {interview.candidates.length > 5 && (
                  <AvatarGroupCount>
                    +{interview.candidates?.length - 5}
                  </AvatarGroupCount>
                )}
              </AvatarGroup>
              {interview.createdBy !== userId && (
                <div className="flex gap-2 items-center">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike();
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp
                      className={`text-accent ${liked ? "fill-accent/80" : ""}`}
                    />
                    <span className="text-accent font-semibold">{likes}</span>
                  </motion.button>

                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave();
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Bookmark
                      className={`text-accent ${saved ? "fill-accent/80" : ""}`}
                    />
                  </motion.button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-5">
              <Button>
                Start Interview <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPreviewModal;
