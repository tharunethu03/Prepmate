"use client";

import { Crown, Sparkles, UserPlus, Users } from "lucide-react";
import Image from "next/image";
import AddFriendsModal from "./components/addFriendsModal";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

type LeaderboardEntry = {
  id: string;
  name: string | null;
  avatar: string | null;
  xp: number;
  level: number;
};

// Visual config per rank (index 0 = 1st place, etc.)
const RANK_CFG = [
  {
    ring: "ring-4 ring-yellow-400",
    badgeCls: "bg-yellow-400 text-black",
    podiumCls: "bg-yellow-400/20 border-yellow-400/30",
    xpCls: "text-yellow-300",
    podiumH: "h-24",
    avatarSize: 92,
    crown: true,
  },
  {
    ring: "ring-4 ring-slate-300",
    badgeCls: "bg-slate-300 text-black",
    podiumCls: "bg-slate-300/15 border-slate-300/20",
    xpCls: "text-slate-300",
    podiumH: "h-16",
    avatarSize: 78,
    crown: false,
  },
  {
    ring: "ring-[3px] ring-amber-600",
    badgeCls: "bg-amber-600 text-white",
    podiumCls: "bg-amber-600/15 border-amber-600/20",
    xpCls: "text-amber-400",
    podiumH: "h-12",
    avatarSize: 70,
    crown: false,
  },
] as const;

const RANK_EMOJI = ["🥇", "🥈", "🥉"];

// Left column = 2nd, centre = 1st, right = 3rd
const PODIUM_ORDER = [1, 0, 2] as const;

export default function LeaderboardPage() {
  const [showAddFriendsModal, setShowAddFriendsModal] = useState(false);
  const [friends, setFriends] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  const handleProfileClick = (friend: LeaderboardEntry) => {
    router.push(
      friend.id === session?.user?.id ? "/profile" : `/profile/${friend.id}`,
    );
  };

  useEffect(() => {
    (async () => {
      try {
        const [friendsRes, profileRes] = await Promise.all([
          fetch("/api/friends"),
          fetch("/api/profile"),
        ]);
        const { friends: fList = [] } = await friendsRes.json();
        const profileData = await profileRes.json();

        const me: LeaderboardEntry = {
          id: profileData.id,
          name: profileData.name,
          avatar: profileData.avatar,
          xp: profileData.xp,
          level: profileData.level,
        };

        setFriends([me, ...fList].sort((a, b) => b.xp - a.xp));
      } catch {
        console.error("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const top3 = friends.slice(0, 3);
  const rest = friends.slice(3);
  const maxXp = friends[0]?.xp || 1;

  if (loading) return <Skeleton />;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Podium ─────────────────────────────────────────────── */}
      {top3.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-accent-gradient rounded-[22px] px-4 sm:px-10 pt-8 pb-0 relative overflow-hidden"
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-14 -left-14 h-40 w-40 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -top-6 right-8 h-24 w-24 rounded-full bg-white/5" />

          <div className="flex items-end justify-center gap-3 sm:gap-8">
            {PODIUM_ORDER.map((rankIdx, pos) => {
              const friend = top3[rankIdx];
              if (!friend)
                return (
                  <div key={`empty-${pos}`} className="max-w-[160px] flex-1" />
                );

              const cfg = RANK_CFG[rankIdx];
              const isMe = friend.id === session?.user?.id;

              return (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.12 + pos * 0.08,
                    type: "spring",
                    stiffness: 220,
                    damping: 20,
                  }}
                  onClick={() => handleProfileClick(friend)}
                  className="group flex flex-1 max-w-[160px] cursor-pointer flex-col items-center"
                >
                  {/* Crown / spacer row — keeps all columns same top gap */}
                  <div className="flex h-9 items-end justify-center">
                    {cfg.crown && (
                      <Crown
                        size={30}
                        className=" fill-yellow-400 text-yellow-400"
                      />
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="relative mb-3">
                    <Image
                      src={friend.avatar ?? "/profile-setup/avatar1.png"}
                      alt="avatar"
                      width={cfg.avatarSize}
                      height={cfg.avatarSize}
                      className={`rounded-full object-cover transition-opacity group-hover:opacity-85 ${cfg.ring}`}
                    />
                    <span
                      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ${cfg.badgeCls}`}
                    >
                      #{rankIdx + 1}
                    </span>
                  </div>

                  {/* Name + XP */}
                  <div className="mb-4 px-1 text-center">
                    <p className="max-w-[130px] truncate text-sm font-semibold leading-snug text-white transition-colors group-hover:text-white/80">
                      {friend.name ?? "Unknown"}
                      {isMe && (
                        <span className="text-xs text-white/50"> (You)</span>
                      )}
                    </p>
                    <div
                      className={`mt-0.5 flex items-center justify-center gap-1 text-xs font-semibold ${cfg.xpCls}`}
                    >
                      <Sparkles size={11} />
                      {friend.xp.toLocaleString()} XP
                    </div>
                    <p className="text-xs text-white/40">
                      Level {friend.level}
                    </p>
                  </div>

                  {/* Podium block */}
                  <div
                    className={`flex w-full items-center justify-center rounded-t-[10px] border border-b-0 ${cfg.podiumH} ${cfg.podiumCls}`}
                  >
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Rank list (4th onwards) ─────────────────────────────── */}
      {rest.length > 0 && (
        <div className="flex flex-col gap-2">
          {rest.map((friend, i) => {
            const rank = i + 4;
            const isMe = friend.id === session?.user?.id;
            const barPct = Math.round((friend.xp / maxXp) * 100);

            return (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleProfileClick(friend)}
                className={`group flex cursor-pointer items-center gap-3 rounded-[14px] border px-4 py-3 transition-all hover:border-accent sm:gap-4 ${
                  isMe
                    ? "border-accent bg-accent/5"
                    : "border-border bg-foreground"
                }`}
              >
                {/* Rank */}
                <span className="w-6 shrink-0 text-center text-sm font-bold text-secondary">
                  {rank}
                </span>

                {/* Avatar */}
                <Image
                  src={friend.avatar ?? "/profile-setup/avatar1.png"}
                  alt="avatar"
                  width={44}
                  height={44}
                  className="shrink-0 rounded-full border-2 border-border"
                />

                {/* Name + XP bar */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {friend.name ?? "Unknown"}
                    {isMe && (
                      <span className="ml-1 text-xs font-normal text-accent">
                        (You)
                      </span>
                    )}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barPct}%` }}
                        transition={{ delay: 0.2 + i * 0.04, duration: 0.5 }}
                        className="h-full rounded-full bg-accent"
                      />
                    </div>
                    <span className="hidden shrink-0 text-xs text-secondary sm:inline">
                      {friend.xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>

                {/* Level badge */}
                <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  Lv {friend.level}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {friends.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-20 text-center"
        >
          <Users size={48} className="text-secondary opacity-40" />
          <p className="font-semibold">No friends on the board yet</p>
          <p className="max-w-xs text-sm text-secondary">
            Add friends to compete and see how you rank against each other.
          </p>
        </motion.div>
      )}

      {showAddFriendsModal && (
        <AddFriendsModal onFinish={() => setShowAddFriendsModal(false)} />
      )}

      {/* ── Floating Add Friends button ──────────────────────────── */}
      <TooltipProvider delayDuration={800}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Button
              onClick={() => setShowAddFriendsModal(true)}
              variant="default"
              size="icon"
              className="absolute bottom-10 right-10 w-18 h-18 rounded-[22px] p-0 hover:scale-105 transition-transform "
            >
              <UserPlus className="size-8" />
            </Button>
          </Tooltip.Trigger>
          <TooltipContent
            side="top"
            align="center"
            className="rounded-[12px] border border-border"
          >
            <p className="text-sm text-secondary">Add Friends</p>
          </TooltipContent>
        </Tooltip.Root>
      </TooltipProvider>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-40 rounded-lg bg-border" />
          <div className="h-4 w-56 rounded bg-border" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-border" />
      </div>
      <div className="h-64 rounded-[22px] bg-accent-gradient opacity-30" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 rounded-[14px] bg-border" />
      ))}
    </div>
  );
}
