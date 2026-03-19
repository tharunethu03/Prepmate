"use client";
import { useEffect, useState } from "react";
import { X, Loader2, Swords, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { toast } from "sonner";

type Friend = {
  id: string;
  name: string | null;
  avatar: string | null;
  level: number;
};

type Interview = {
  id: string;
  title: string;
  difficulty: string;
  questionCount: number;
};

export default function SendChallengeModal({
  onFinish,
  onSent,
}: {
  onFinish: () => void;
  onSent: () => void;
}) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [friendSearch, setFriendSearch] = useState("");
  const [interviewSearch, setInterviewSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState<"friend" | "interview" | "confirm">(
    "friend",
  );

  useEffect(() => {
    // Fetch friends
    fetch("/api/friends")
      .then((r) => r.json())
      .then((d) => setFriends(d.friends ?? []))
      .catch(console.error);

    // Fetch own interviews
    fetch("/api/interviews?mine=true")
      .then((r) => r.json())
      .then((d) => setInterviews(d.interviews ?? []))
      .catch(console.error);
  }, []);

  const handleSend = async () => {
    if (!selectedFriend || !selectedInterview) return;
    setSending(true);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengedId: selectedFriend.id,
          interviewId: selectedInterview.id,
          message: message.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to send challenge");
        return;
      }
      toast.success(`Challenge sent to ${selectedFriend.name}!`);
      onSent();
    } catch {
      toast.error("Failed to send challenge");
    } finally {
      setSending(false);
    }
  };

  function difficultyColor(d: string) {
    if (d === "beginner") return "#22c55e";
    if (d === "intermediate") return "#facc15";
    return "#ef4444";
  }

  const filteredFriends = friends.filter((f) =>
    f.name?.toLowerCase().includes(friendSearch.toLowerCase()),
  );

  const filteredInterviews = interviews.filter((i) =>
    i.title.toLowerCase().includes(interviewSearch.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 px-4">
      <div className="bg-foreground border-2 border-accent rounded-[22px] w-full max-w-lg max-h-[80vh] overflow-y-auto relative flex flex-col p-6">
        <button className="absolute top-4 right-4" onClick={onFinish}>
          <X className="text-tertiary hover:text-secondary cursor-pointer" />
        </button>

        <h2 className="text-lg font-semibold flex items-center gap-2 mb-1">
          <Swords size={18} className="text-accent" /> New Challenge
        </h2>
        <p className="text-xs text-secondary mb-5">
          Challenge a friend to an interview
        </p>

        {/* Step indicator */}
        <div className="flex gap-2 mb-5">
          {["friend", "interview", "confirm"].map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                ["friend", "interview", "confirm"].indexOf(step) >= i
                  ? "bg-accent"
                  : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Pick friend */}
        {step === "friend" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">Select a friend</p>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
              />
              <Input
                placeholder="Search friends..."
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {filteredFriends.length === 0 ? (
                <p className="text-xs text-secondary text-center py-5">
                  No friends found. Add friends first!
                </p>
              ) : (
                filteredFriends.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFriend(f)}
                    className={`flex items-center gap-3 border rounded-[12px] px-4 py-2.5 cursor-pointer transition-colors ${
                      selectedFriend?.id === f.id
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent"
                    }`}
                  >
                    <Image
                      src={f.avatar ?? "/profile-setup/avatar1.png"}
                      width={36}
                      height={36}
                      alt="avatar"
                      className="rounded-full"
                    />
                    <div>
                      <p className="text-sm font-semibold">{f.name}</p>
                      <p className="text-xs text-secondary">Level {f.level}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button
              className="mt-2"
              disabled={!selectedFriend}
              onClick={() => setStep("interview")}
            >
              Next →
            </Button>
          </div>
        )}

        {/* Step 2: Pick interview */}
        {step === "interview" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">Select an interview</p>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
              />
              <Input
                placeholder="Search your interviews..."
                value={interviewSearch}
                onChange={(e) => setInterviewSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {filteredInterviews.length === 0 ? (
                <p className="text-xs text-secondary text-center py-5">
                  No interviews found. Create one first!
                </p>
              ) : (
                filteredInterviews.map((i) => (
                  <div
                    key={i.id}
                    onClick={() => setSelectedInterview(i)}
                    className={`flex items-center justify-between border rounded-[12px] px-4 py-2.5 cursor-pointer transition-colors ${
                      selectedInterview?.id === i.id
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold">{i.title}</p>
                      <span
                        className="text-xs font-medium"
                        style={{ color: difficultyColor(i.difficulty) }}
                      >
                        {i.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-tertiary">{i.questionCount}Q</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("friend")}
              >
                ← Back
              </Button>
              <Button
                className="flex-1"
                disabled={!selectedInterview}
                onClick={() => setStep("confirm")}
              >
                Next →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm + optional message */}
        {step === "confirm" && selectedFriend && selectedInterview && (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium">Confirm challenge</p>

            <div className="bg-background rounded-[12px] p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Image
                  src={selectedFriend.avatar ?? "/profile-setup/avatar1.png"}
                  width={40}
                  height={40}
                  alt="avatar"
                  className="rounded-full"
                />
                <div>
                  <p className="text-xs text-secondary">Challenging</p>
                  <p className="text-sm font-semibold">{selectedFriend.name}</p>
                </div>
              </div>
              <hr className="border-border" />
              <div>
                <p className="text-xs text-secondary">Interview</p>
                <p className="text-sm font-semibold">
                  {selectedInterview.title}
                </p>
                <p className="text-xs text-tertiary mt-0.5">
                  {selectedInterview.questionCount} questions ·{" "}
                  <span
                    style={{
                      color: difficultyColor(selectedInterview.difficulty),
                    }}
                  >
                    {selectedInterview.difficulty}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">
                Add a message (optional)
              </p>
              <Textarea
                placeholder="e.g. Bet you can't beat my score 😏"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="h-20 resize-none text-sm w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("interview")}
              >
                ← Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Swords size={14} /> Send Challenge
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
