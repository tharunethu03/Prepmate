import { ProfileData } from "../types";

export default function XpProgressBar({
  profile,
}: {
  profile: ProfileData | null;
}) {
  if (!profile?.xpProgress) return null;

  return (
    <div className="bg-foreground border border-border rounded-[22px] card-shadow px-8 py-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">Level {profile.level}</p>
        <p className="text-xs text-secondary">
          {profile.xpProgress.current} / {profile.xpProgress.needed} XP → Level{" "}
          {profile.xpProgress.nextLevel}
        </p>
      </div>
      <div className="w-full h-3 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${profile.xpProgress.percent}%` }}
        />
      </div>
    </div>
  );
}
