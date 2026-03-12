"use client";

import { Crown, Plus, Sparkles } from "lucide-react";
import Image from "next/image";
import AddFriendsModal from "./components/addFriendsModal";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

type LeaderboardEntry = {
  id: string;
  name: string | null;
  avatar: string | null;
  xp: number;
  level: number;
};

const LeaderboardPage = () => {
  const [showAddFriendsModal, setShowAddFriendsModal] = useState(false);

  const [friends, setFriends] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const [friendsRes, profileRes] = await Promise.all([
          fetch("/api/friends"),
          fetch("/api/profile"),
        ]);

        const friendsData = await friendsRes.json();
        const profileData = await profileRes.json();

        const me: LeaderboardEntry = {
          id: profileData.id,
          name: profileData.name,
          avatar: profileData.avatar,
          xp: profileData.xp,
          level: profileData.level,
        };

        const all = [me, ...(friendsData.friends ?? [])];
        const sorted = all.sort((a, b) => b.xp - a.xp);
        setFriends(sorted);
      } catch {
        console.error("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div>
      {/* Podium - top 3 */}
      <div className="bg-accent-gradient w-full py-10 px-10 mx-auto rounded-[22px] flex items-center justify-center gap-20">
        {friends.slice(0, 3).map((friend, index) => (
          <div key={friend.id} className="flex flex-col items-center">
            <div className="relative flex flex-col items-center">
              {index === 0 && (
                <Crown
                  size={40}
                  className={`absolute -top-1 left-0 rotate-333 ${
                    friend.id === session?.user?.id
                      ? "text-accent fill-accent"
                      : "text-warning fill-warning"
                  }`}
                />
              )}
              <Image
                src={friend.avatar ?? "/profile-setup/avatar1.png"}
                alt="Avatar"
                width={100}
                height={100}
                className={`border-4 rounded-full mt-6 ${
                  friend.id === session?.user?.id
                    ? "border-accent"
                    : "border-warning"
                }`}
              />
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-warning text-foreground font-bold rounded-full px-4 py-1.5 text-lg">
                {index + 1}
              </span>
            </div>
            <h4 className="text-foreground text-lg font-semibold mt-5">
              {friend.name} {friend.id === session?.user?.id && "(You)"}
            </h4>
            <div className="flex gap-5 text-warning">
              <p className="flex gap-3">
                <span>
                  <Sparkles />
                </span>
                {friend.xp} Points
              </p>
              <p>Level {friend.level}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List - position 4 onwards */}
      <div className="flex flex-col gap-3 mt-5">
        {friends.slice(3).map((friend, index) => (
          <div
            key={friend.id}
            className={`flex w-full border rounded-[12px] py-3 px-10 items-center justify-between ${
              friend.id === session?.user?.id
                ? "border-accent bg-accent/10"
                : "border-tertiary"
            }`}
          >
            <p className="text-accent text-lg font-bold">{index + 4}</p>
            <Image
              src={friend.avatar ?? "/profile-setup/avatar1.png"}
              alt="Avatar"
              width={50}
              height={50}
              className="border-4 border-warning rounded-full"
            />
            <h3>
              {friend.name} {friend.id === session?.user?.id && "(You)"}
            </h3>
            <p className="font-semibold">{friend.xp} Points</p>
            <p className="font-semibold">Level {friend.level}</p>
          </div>
        ))}

        <div
          onClick={() => setShowAddFriendsModal(true)}
          className="flex w-full border border-tertiary rounded-[12px] items-center justify-center py-3 px-10 gap-5 text-secondary hover:text-accent cursor-pointer"
        >
          <Plus />
          <p>Add more friends</p>
        </div>
      </div>

      {showAddFriendsModal && (
        <AddFriendsModal onFinish={() => setShowAddFriendsModal(false)} />
      )}
    </div>
  );
};

export default LeaderboardPage;
