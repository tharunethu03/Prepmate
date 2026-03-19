"use client";
import { useEffect, useState } from "react";
import { Swords, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Challenge = {
  id: string;
  status: string;
  message: string | null;
  challenger: { id: string; name: string | null; avatar: string | null };
  interview: { id: string; title: string; difficulty: string };
};

export default function PendingChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/challenges")
      .then((r) => r.json())
      .then((d) =>
        setChallenges(
          (d.received ?? [])
            .filter((c: Challenge) => c.status === "PENDING")
            .slice(0, 2),
        ),
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!loading && challenges.length === 0) return null;

  if (loading)
    return (
      <div className="flex flex-col gap-3 animate-pulse">
        <div className="h-5 bg-border rounded-full w-40" />
        <div className="h-16 bg-foreground border border-border rounded-[12px]" />
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Swords size={16} className="text-warning" /> Pending Challenges
        </h3>
        <Link href="/challenges">
          <Button variant="outline" className="h-7 text-secondary text-xs px-3">
            See all <ChevronRight size={12} />
          </Button>
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {challenges.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between border border-warning/30 bg-warning/5 rounded-[12px] px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <Image
                src={c.challenger.avatar ?? "/profile-setup/avatar1.png"}
                width={36}
                height={36}
                alt="avatar"
                className="rounded-full"
              />
              <div>
                <p className="text-sm font-semibold">
                  {c.challenger.name ?? "Someone"} challenged you!
                </p>
                <p className="text-xs text-secondary">{c.interview.title}</p>
              </div>
            </div>
            <Button
              className="h-8 text-xs px-4"
              onClick={() =>
                router.push(`/interview/${c.interview.id}?challengeId=${c.id}`)
              }
            >
              Accept
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
