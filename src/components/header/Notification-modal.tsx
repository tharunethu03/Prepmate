"use client";

import { Check, Loader2, PackageOpen, Swords, UserPlus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  type: "FRIEND_REQUEST" | "CHALLENGE";
  message: string;
  actor: { id: string; name: string | null; avatar: string | null };
  createdAt: string;
  meta: {
    requestId?: string;
    challengeId?: string;
    interviewId?: string;
    difficulty?: string;
  };
};

interface NotificationModalProps {
  onFinish: () => void;
  onCountChange?: (count: number) => void;
}

export default function NotificationModal({
  onFinish,
  onCountChange,
}: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data.notifications ?? []);
        onCountChange?.(data.unreadCount ?? 0);
      } catch {
        console.error("Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  const handleFriendRequest = async (
    requestId: string,
    action: "accept" | "decline",
  ) => {
    setActionLoading(requestId);
    try {
      const res = await fetch(`/api/friends/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== requestId));
        onCountChange?.(notifications.length - 1);
      }
    } catch {
      console.error("Failed to handle friend request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptChallenge = (interviewId: string, challengeId: string) => {
    onFinish();
    router.push(`/interview/${interviewId}?challengeId=${challengeId}`);
  };

  const handleDeclineChallenge = async (challengeId: string) => {
    setActionLoading(challengeId);
    try {
      const res = await fetch(`/api/challenges/${challengeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline" }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== challengeId));
        onCountChange?.(notifications.length - 1);
      }
    } catch {
      console.error("Failed to decline challenge");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50"
        onClick={onFinish}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-28 md:top-23 right-5 md:right-30 bg-foreground border border-accent  w-xs md:w-md rounded-[22px] p-5 shadow-2xl"
          initial={{ opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <div className="flex items-center justify-between">
            <h3>Notifications</h3>
            <button onClick={onFinish}>
              <X
                size={20}
                className="text-tertiary hover:text-secondary cursor-pointer absolute top-4 right-4"
              />
            </button>
          </div>

          <hr className="mt-3 mb-3" />

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-secondary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-secondary gap-3">
              <PackageOpen />
              <p className="sub-text">No notifications at the moment</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex flex-col gap-2 border border-border rounded-[12px] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src={n.actor.avatar ?? "/profile-setup/avatar1.png"}
                        alt="avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      {/* Type icon badge */}
                      <div className="absolute -bottom-1 -right-1 bg-foreground rounded-full p-0.5">
                        {n.type === "FRIEND_REQUEST" ? (
                          <UserPlus size={12} className="text-accent" />
                        ) : (
                          <Swords size={12} className="text-warning" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm flex-1">{n.message}</p>
                  </div>

                  {/* Actions */}
                  {n.type === "FRIEND_REQUEST" && (
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        className="h-7 text-xs px-3"
                        onClick={() =>
                          handleFriendRequest(n.meta.requestId!, "decline")
                        }
                        disabled={actionLoading === n.meta.requestId}
                      >
                        Decline
                      </Button>
                      <Button
                        className="h-7 text-xs px-3"
                        onClick={() =>
                          handleFriendRequest(n.meta.requestId!, "accept")
                        }
                        disabled={actionLoading === n.meta.requestId}
                      >
                        {actionLoading === n.meta.requestId ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <>
                            <Check size={12} /> Accept
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {n.type === "CHALLENGE" && (
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        className="h-7 text-xs px-3"
                        onClick={() =>
                          handleDeclineChallenge(n.meta.challengeId!)
                        }
                        disabled={actionLoading === n.meta.challengeId}
                      >
                        Decline
                      </Button>
                      <Button
                        className="h-7 text-xs px-3"
                        onClick={() =>
                          handleAcceptChallenge(
                            n.meta.interviewId!,
                            n.meta.challengeId!,
                          )
                        }
                      >
                        <Swords size={12} /> Accept Challenge
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
