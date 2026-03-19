import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "./avatar";
import { Bookmark, ThumbsUp, Trash, Trash2 } from "lucide-react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { motion } from "framer-motion";
import { Button } from "./button";
import { Interview } from "@/app/types/interview";
import { useRouter } from "next/navigation";

type InterviewModalProps = {
  interview: Interview;
  onDelete?: (id: string) => void;
  onPreview: () => void;
};

const InterviewModal = ({
  interview,
  onDelete,
  onPreview,
}: InterviewModalProps) => {
  const [saved, setSaved] = useState(interview.isSaved);
  const [likes, setLikes] = useState(interview.likes);
  const [liked, setLiked] = useState(interview.isLiked);
  const [deletemodal, setDeleteModal] = useState(false);

  const { data: session } = useSession();
  const userid = session?.user?.id;

  const router = useRouter();

  let color;

  if (interview.difficulty === "beginner") color = "#22c55e";
  else if (interview.difficulty === "intermediate") color = "#facc15";
  else color = "#ef4444";

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/interviews/${interview.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data.error);
        return;
      }

      console.log("Interview deleted:", data);

      setDeleteModal(false);
      onDelete?.(interview.id);
    } catch (error) {
      console.log("Error deleting interview", error);
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

  return (
    <TooltipPrimitive.Provider delayDuration={1000}>
      <div
        onClick={onPreview}
        className="flex flex-col gap-3 w-full shadow-lg min-w-85 md:min-w-100 max-w-85 md:max-w-100 h-70 bg-foreground border border-border px-4 sm:px-8 py-4 sm:py-5 rounded-[22px] hover:scale-102 transition-transform cursor-pointer"
      >
        <h2 className="text-sm sm:text-lg font-semibold">{interview.title}</h2>

        <div className="flex flex-wrap gap-2 sm:gap-2">
          <div
            className="flex bg-accent w-fit px-2 sm:px-3 py-1 sm:py-1.5 rounded-[12px] gap-1 items-center text-xs sm:text-xs cursor-pointer hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/profile/${interview.createdBy}`);
            }}
          >
            <Image
              src={interview.creator?.avatar || "/profile-setup/avatar1.png"}
              width={25}
              height={25}
              alt="AVATAR"
              className="rounded-full"
            />
            <span className="text-foreground font-bold truncate max-w-[100px] md:max-w-[120px]">
              {interview.creator?.name || "Unknown"}
            </span>
          </div>

          <div
            className="flex border w-fit px-3  py-1 sm:py-1.5 rounded-[12px] gap-1 items-center text-xs "
            style={{ borderColor: color }}
          >
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-primary font-bold">
              {interview.difficulty}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:gap-5">
          <p className="text-secondary text-xs sm:text-sm">Topics</p>
          <p className="text-secondary text-xs sm:text-sm truncate">
            {interview.topics.join(", ")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-auto text-end gap-2 sm:gap-0">
          <div className="mb-2 sm:mb-0">
            <AvatarGroup>
              {interview.recentAttemptees?.slice(0, 5).map((attemptee) => (
                <Avatar key={attemptee.id}>
                  <AvatarImage
                    src={attemptee.avatar || "/profile-setup/avatar1.png"}
                    alt="attemptee-avatar"
                  />
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
              ))}
              {(interview.attemptCount ?? 0) > 5 && (
                <AvatarGroupCount>
                  +{(interview.attemptCount ?? 0) - 5}
                </AvatarGroupCount>
              )}
            </AvatarGroup>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
            {interview.createdBy !== userid && (
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

            {interview.createdBy === userid && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteModal(true);
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 className="text-tertiary hover:text-error" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {deletemodal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 px-4">
          <div className="bg-foreground border border-border rounded-[22px] shadow-lg p-5 sm:p-10 max-w-100 w-full">
            <div className="flex flex-col items-center justify-center gap-3">
              <h3 className="text-lg font-semibold">Delete Interview?</h3>
              <p className="text-sm text-center max-w-xs">
                Are you sure you want to delete this interview?
              </p>
              <div className="flex flex-wrap justify-between gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 px-4 sm:px-6"
                  onClick={() => setDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className="flex-1 bg-error hover:bg-error/90 text-white px-4 sm:px-6"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TooltipPrimitive.Provider>
  );
};

export default InterviewModal;
