"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Sparkles, Trophy } from "lucide-react";

type ProfileSnap = {
  name: string | null;
  avatar: string | null;
  xp: number;
  level: number;
  field: string | null;
  xpProgress: {
    current: number;
    needed: number;
    percent: number;
    nextLevel: number;
  };
};

export default function WelcomeCard() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileSnap | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfile)
      .catch(console.error);
  }, []);

  return (
    <div className="bg-accent-gradient rounded-[22px] px-8 py-6 flex flex-col md:flex-row md:items-center gap-6 card-shadow">
      <div className="flex items-center gap-5 flex-1">
        <Image
          src={
            profile?.avatar ??
            session?.user?.avatar ??
            "/profile-setup/avatar1.png"
          }
          width={72}
          height={72}
          alt="avatar"
          className="rounded-full border-3 border-transparent ring-3 ring-foreground shrink-0"
        />
        <div>
          <h4 className="text-foreground font-bold text-2xl">
            {profile?.name ?? session?.user?.name ?? ""}
          </h4>
          <p className="text-foreground/70 text-xs mt-0.5">
            {profile?.field ?? ""}
          </p>
        </div>
      </div>

      {/* Quick XP snapshot */}
      <div className="flex flex-col gap-2 min-w-[200px]">
        <div className="flex items-center justify-between text-foreground text-xs">
          <span className="flex items-center gap-1">
            <Trophy size={12} /> Level {profile?.level ?? 1}
          </span>
          <span className="flex items-center gap-1">
            <Sparkles size={12} /> {profile?.xp ?? 0} XP
          </span>
        </div>
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${profile?.xpProgress?.percent ?? 0}%` }}
          />
        </div>
        <p className="text-foreground/60 text-xs text-right">
          {profile?.xpProgress?.current ?? 0} /{" "}
          {profile?.xpProgress?.needed ?? 100} XP to Level{" "}
          {profile?.xpProgress?.nextLevel ?? 2}
        </p>
      </div>
    </div>
  );
}
