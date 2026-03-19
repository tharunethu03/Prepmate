// import { LeaderboardEntry } from "../page";
import { Trophy, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

type Props = {
  leaderboard: LeaderboardEntry[];
  currentUserId?: string;
};

export default function FriendsLeaderboard({
  leaderboard,
  currentUserId,
}: Props) {
  return (
    <div className="flex-1 bg-foreground border border-border rounded-[22px] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Friends Leaderboard</h3>
        <Link href="/leaderboard">
          <Button variant="outline" className="h-7 text-xs px-3">
            Full View <ChevronRight size={12} />
          </Button>
        </Link>
      </div>
      {leaderboard.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-secondary">
          <Trophy size={32} className="text-border" />
          <p className="text-sm">No friends yet</p>
          <p className="text-xs text-tertiary">
            Add friends to see how you rank
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {leaderboard.map((entry, i) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 border rounded-[12px] px-4 py-3 ${
                entry.id === currentUserId
                  ? "border-accent bg-accent/5"
                  : "border-border"
              }`}
            >
              <span
                className={`text-sm font-bold w-6 text-center ${i === 0 ? "text-warning" : "text-secondary"}`}
              >
                {i + 1}
              </span>
              <Image
                src={entry.avatar ?? "/profile-setup/avatar1.png"}
                width={36}
                height={36}
                alt="avatar"
                className="rounded-full"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold truncate">
                  {entry.name ?? "Unknown"}
                  {entry.id === currentUserId && (
                    <span className="text-accent text-xs ml-1">(You)</span>
                  )}
                </p>
                <p className="text-xs text-secondary">Level {entry.level}</p>
              </div>
              <div className="flex items-center gap-1 text-warning text-xs font-semibold">
                <Sparkles size={12} />
                {entry.xp}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
