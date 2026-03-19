import { ProfileData } from "../page";
import { Sparkles, Trophy, BookOpen, Target } from "lucide-react";

export default function StatsRow({ profile }: { profile: ProfileData | null }) {
  const stats = [
    {
      icon: <Target size={20} className="text-accent" />,
      label: "Attempts",
      value: profile?._count.attempts ?? 0,
    },
    {
      icon: <BookOpen size={20} className="text-accent" />,
      label: "Created",
      value: profile?._count.interviews ?? 0,
    },
    {
      icon: <Sparkles size={20} className="text-warning" />,
      label: "XP",
      value: profile?.xp ?? 0,
    },
    {
      icon: <Trophy size={20} className="text-warning" />,
      label: "Level",
      value: profile?.level ?? 1,
    },
  ];

  return (
    <div className="flex gap-3 flex-wrap md:flex-nowrap">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex-1 min-w-[100px] bg-foreground border border-border rounded-[22px] px-5 py-4 flex flex-col items-center gap-1"
        >
          {stat.icon}
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-xs text-secondary">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
