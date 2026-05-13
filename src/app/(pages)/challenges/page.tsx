"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LoaderOne } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import {
  Swords,
  Send,
  Inbox,
  ChevronRight,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react";
import SendChallengeModal from "./components/SendChallengeModal";

type ChallengeInterview = {
  id: string;
  title: string;
  difficulty: string;
  questionCount: number;
  role: string;
  topics: string[];
};

type ChallengeUser = {
  id: string;
  name: string | null;
  avatar: string | null;
};

type ChallengeAttempt = {
  id: string;
  score: number | null;
  status: string;
};

type ReceivedChallenge = {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  challenger: ChallengeUser;
  interview: ChallengeInterview;
  attempts: ChallengeAttempt[];
};

type SentChallenge = {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  challenged: ChallengeUser;
  interview: ChallengeInterview;
  attempts: ChallengeAttempt[];
};

function difficultyColor(d: string) {
  if (d === "beginner") return "#22c55e";
  if (d === "intermediate") return "#facc15";
  return "#ef4444";
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    PENDING: {
      label: "Pending",
      className: "bg-warning/10 text-warning border-warning/30",
      icon: <Clock size={11} />,
    },
    ACCEPTED: {
      label: "Accepted",
      className: "bg-accent/10 text-accent border-accent/30",
      icon: <Swords size={11} />,
    },
    COMPLETED: {
      label: "Completed",
      className: "bg-success/10 text-success border-success/30",
      icon: <CheckCircle size={11} />,
    },
    DECLINED: {
      label: "Declined",
      className: "bg-error/10 text-error border-error/30",
      icon: <XCircle size={11} />,
    },
  };
  const s = map[status] ?? map.PENDING;
  return (
    <span
      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${s.className}`}
    >
      {s.icon} {s.label}
    </span>
  );
}

export default function ChallengesPage() {
  const router = useRouter();
  const [received, setReceived] = useState<ReceivedChallenge[]>([]);
  const [sent, setSent] = useState<SentChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [showSendModal, setShowSendModal] = useState(false);
  const [decliningId, setDecliningId] = useState<string | null>(null);

  // Defined as a named function so I can call it again after sending a challenge
  const fetchChallenges = async () => {
    try {
      const res = await fetch("/api/challenges");
      const data = await res.json();
      setReceived(data.received ?? []);
      setSent(data.sent ?? []);
    } catch {
      // fetch failed — show empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleDecline = async (id: string) => {
    setDecliningId(id);
    try {
      await fetch(`/api/challenges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline" }),
      });
      // Optimistically update status so UI reflects instantly without a refetch
      setReceived((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "DECLINED" } : c)),
      );
    } catch {
      // decline failed — leave existing status
    } finally {
      setDecliningId(null);
    }
  };

  const handleAccept = (challenge: ReceivedChallenge) => {
    router.push(
      `/interview/${challenge.interview.id}?challengeId=${challenge.id}`,
    );
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <LoaderOne />
      </div>
    );

  const pendingCount = received.filter((c) => c.status === "PENDING").length;

  return (
    <div className="py-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setShowSendModal(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} /> New Challenge
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setTab("received")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            tab === "received"
              ? "border-accent text-accent"
              : "border-transparent text-secondary"
          }`}
        >
          <Inbox size={14} /> Received
          {pendingCount > 0 && (
            <span className="bg-error text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("sent")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            tab === "sent"
              ? "border-accent text-accent"
              : "border-transparent text-secondary"
          }`}
        >
          <Send size={14} /> Sent
        </button>
      </div>

      {/* Received challenges */}
      {tab === "received" && (
        <div className="flex flex-col gap-3">
          {received.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-3 text-secondary">
              <Inbox size={40} className="text-border" />
              <p className="text-sm">No challenges received yet</p>
              <p className="text-xs text-tertiary">
                When friends challenge you, they&apos;ll appear here
              </p>
            </div>
          ) : (
            received.map((c) => (
              <div
                key={c.id}
                className={`bg-foreground border rounded-[16px] p-4 flex flex-col gap-3 ${
                  c.status === "PENDING" ? "border-warning/40" : "border-border"
                }`}
              >
                {/* Challenger info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={c.challenger.avatar ?? "/profile-setup/avatar1.png"}
                      width={40}
                      height={40}
                      alt="avatar"
                      className="rounded-full cursor-pointer"
                      onClick={() => router.push(`/profile/${c.challenger.id}`)}
                      sizes="40px"
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        {c.challenger.name ?? "Someone"} challenged you
                      </p>
                      <p className="text-xs text-tertiary">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                {/* Message */}
                {c.message && (
                  <p className="text-xs text-secondary italic border-l-2 border-accent/40 pl-3">
                    {c.message}
                  </p>
                )}

                {/* Interview info */}
                <div className="bg-background rounded-[12px] px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{c.interview.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: difficultyColor(c.interview.difficulty),
                        }}
                      >
                        {c.interview.difficulty}
                      </span>
                      <span className="text-xs text-tertiary">
                        {c.interview.questionCount} questions
                      </span>
                      <span className="text-xs text-tertiary">
                        {c.interview.role}
                      </span>
                    </div>
                  </div>
                  {/* Score if completed */}
                  {c.attempts[0]?.status === "SUBMITTED" &&
                    c.attempts[0]?.score !== null && (
                      <div className="text-right">
                        <p className="text-accent font-bold">
                          {Math.round(c.attempts[0].score)}%
                        </p>
                        <p className="text-xs text-tertiary">your score</p>
                      </div>
                    )}
                </div>

                {/* Actions */}
                {c.status === "PENDING" && (
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      className="h-8 text-xs px-4 hover:border-error hover:text-error"
                      onClick={() => handleDecline(c.id)}
                      disabled={decliningId === c.id}
                    >
                      Decline
                    </Button>
                    <Button
                      className="h-8 text-xs px-4"
                      onClick={() => handleAccept(c)}
                    >
                      <Swords size={12} /> Accept Challenge
                    </Button>
                  </div>
                )}
                {c.status === "ACCEPTED" && (
                  <div className="flex justify-end">
                    <Button
                      className="h-8 text-xs px-4"
                      onClick={() =>
                        router.push(
                          `/interview/${c.interview.id}?challengeId=${c.id}`,
                        )
                      }
                    >
                      Continue <ChevronRight size={12} />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Sent challenges */}
      {tab === "sent" && (
        <div className="flex flex-col gap-3">
          {sent.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-3 text-secondary">
              <Send size={40} className="text-border" />
              <p className="text-sm">No challenges sent yet</p>
              <Button className="mt-2" onClick={() => setShowSendModal(true)}>
                <Plus size={14} /> Challenge a Friend
              </Button>
            </div>
          ) : (
            sent.map((c) => (
              <div
                key={c.id}
                className="bg-foreground border border-border rounded-[16px] p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={c.challenged.avatar ?? "/profile-setup/avatar1.png"}
                      width={40}
                      height={40}
                      alt="avatar"
                      className="rounded-full cursor-pointer"
                      onClick={() => router.push(`/profile/${c.challenged.id}`)}
                      sizes="40px"
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        You challenged {c.challenged.name ?? "someone"}
                      </p>
                      <p className="text-xs text-tertiary">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                {c.message && (
                  <p className="text-xs text-secondary italic border-l-2 border-accent/40 pl-3">
                    {c.message}
                  </p>
                )}

                <div className="bg-background rounded-[12px] px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{c.interview.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: difficultyColor(c.interview.difficulty),
                        }}
                      >
                        {c.interview.difficulty}
                      </span>
                      <span className="text-xs text-tertiary">
                        {c.interview.questionCount} questions
                      </span>
                    </div>
                  </div>
                  {/* Their score if completed */}
                  {c.attempts[0]?.status === "SUBMITTED" &&
                    c.attempts[0]?.score !== null && (
                      <div className="text-right">
                        <p className="text-accent font-bold">
                          {Math.round(c.attempts[0].score)}%
                        </p>
                        <p className="text-xs text-tertiary">their score</p>
                      </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showSendModal && (
        <SendChallengeModal
          onFinish={() => setShowSendModal(false)}
          onSent={() => {
            setShowSendModal(false);
            fetchChallenges();
          }}
        />
      )}
    </div>
  );
}
