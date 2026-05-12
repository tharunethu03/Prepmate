"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { LoaderOne } from "@/components/ui/loader";
import {
  Sparkles,
  Trophy,
  Target,
  BookOpen,
  Globe,
  Github,
  Linkedin,
  Lock,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { BADGES } from "@/lib/badge-definitions";
import CreatorAnalyticsTab from "./CreatorAnalyticsTab";
import WeakAreasPanel from "./WeakAreasPanel";

type Attempt = {
  id: string;
  score: number | null;
  xpEarned: number;
  submittedAt: string | null;
  interview: { id: string; title: string; difficulty: string; role: string };
};

type InterviewCard = {
  id: string;
  title: string;
  difficulty: string;
  visibility: string;
  questionCount: number;
  mode: string;
  topics: string[];
  role: string;
  createdAt: string;
  _count: { attempts: number; likes: number };
};

type UserBadge = {
  badge: {
    key: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
  };
  earnedAt: string;
};

type ProfileData = {
  id: string;
  name: string | null;
  avatar: string | null;
  xp: number;
  level: number;
  role: string;
  field: string | null;
  roleTitle: string | null;
  portfolioLink: string | null;
  linkedinLink: string | null;
  githubLink: string | null;
  showXp: boolean;
  showScore: boolean;
  showAttempts: boolean;
  isOwnProfile: boolean;
  avgScore: number | null;
  publicInterviews: InterviewCard[];
  privateInterviews: InterviewCard[];
  attempts: Attempt[];
  badges: UserBadge[];
  _count: {
    interviews: number;
    attempts: number;
    followers: number;
    following: number;
  };
  xpProgress: {
    current: number;
    needed: number;
    percent: number;
    nextLevel: number;
  };
};

function difficultyColor(d: string) {
  if (d === "beginner") return "#22c55e";
  if (d === "intermediate") return "#facc15";
  return "#ef4444";
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"attempts" | "public" | "private" | "creator">("attempts");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <LoaderOne />
      </div>
    );
  if (!profile)
    return (
      <div className="text-secondary text-center py-20">Profile not found</div>
    );

  const earnedBadgeKeys = new Set(
    profile.badges?.map((b) => b.badge.key) ?? [],
  );

  return (
    <div className="py-5 flex flex-col gap-6">
      {/* Header card — full width */}
      <div className="bg-foreground border border-border rounded-[22px] p-6 flex flex-col sm:flex-row gap-5">
        <Image
          src={profile.avatar ?? "/profile-setup/avatar1.png"}
          width={90}
          height={90}
          alt="avatar"
          className="rounded-full ring-2 ring-accent border-3 border-foreground shrink-0 w-[90px] h-[90px] object-cover"
        />
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-bold text-xl">{profile.name}</h2>
              <p className="text-secondary text-sm">
                {profile.roleTitle ?? profile.field ?? profile.role}
              </p>
            </div>
            {profile.isOwnProfile && (
              <Button
                variant="outline"
                className="h-8 text-xs px-4"
                onClick={() => router.push("/settings")}
              >
                Edit Profile
              </Button>
            )}
          </div>

          {/* Links */}
          <div className="flex gap-3 flex-wrap">
            {profile.portfolioLink && (
              <a
                href={profile.portfolioLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-secondary hover:text-accent"
              >
                <Globe size={12} /> Portfolio
              </a>
            )}
            {profile.linkedinLink && (
              <a
                href={profile.linkedinLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-secondary hover:text-accent"
              >
                <Linkedin size={12} /> LinkedIn
              </a>
            )}
            {profile.githubLink && (
              <a
                href={profile.githubLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-secondary hover:text-accent"
              >
                <Github size={12} /> GitHub
              </a>
            )}
          </div>

          {/* Stats row */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-1 text-sm">
              <Trophy size={14} className="text-warning" />
              <span className="font-semibold">Level {profile.level}</span>
            </div>
            {(profile.isOwnProfile || profile.showXp) && (
              <div className="flex items-center gap-1 text-sm">
                <Sparkles size={14} className="text-warning" />
                <span className="font-semibold">{profile.xp} XP</span>
              </div>
            )}
            {(profile.isOwnProfile || profile.showAttempts) && (
              <div className="flex items-center gap-1 text-sm">
                <Target size={14} className="text-accent" />
                <span className="font-semibold">
                  {profile._count.attempts} attempts
                </span>
              </div>
            )}
            {!profile.isOwnProfile &&
              profile.showScore &&
              profile.avgScore !== null && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-semibold text-accent">
                    {profile.avgScore}% avg score
                  </span>
                </div>
              )}
            <div className="flex items-center gap-1 text-sm">
              <BookOpen size={14} className="text-accent" />
              <span className="font-semibold">
                {profile._count.interviews} interviews
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          {/* XP Progress */}
          {profile.isOwnProfile && (
            <div className="bg-foreground border border-border rounded-[22px] px-6 py-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="font-semibold">Level {profile.level}</span>
                <span className="text-secondary text-xs">
                  {profile.xpProgress.current} / {profile.xpProgress.needed} XP
                  → Level {profile.xpProgress.nextLevel}
                </span>
              </div>
              <div className="w-full h-3 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${profile.xpProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Tabs + content */}
          <div className="bg-foreground border border-border rounded-[22px] p-5">
            <div className="flex gap-2 border-b border-border mb-4">
              {profile.isOwnProfile && (
                <button
                  onClick={() => setTab("attempts")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    tab === "attempts"
                      ? "border-accent text-accent"
                      : "border-transparent text-secondary"
                  }`}
                >
                  Recent Attempts
                </button>
              )}
              {profile.role !== "STUDENT" && (
                <button
                  onClick={() => setTab("public")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    tab === "public"
                      ? "border-accent text-accent"
                      : "border-transparent text-secondary"
                  }`}
                >
                  Public
                  <span className="ml-1 text-xs text-tertiary">
                    ({profile.publicInterviews.length})
                  </span>
                </button>
              )}
              {profile.isOwnProfile && (
                <button
                  onClick={() => setTab("private")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    tab === "private"
                      ? "border-accent text-accent"
                      : "border-transparent text-secondary"
                  }`}
                >
                  Private
                  <span className="ml-1 text-xs text-tertiary">
                    ({profile.privateInterviews.length})
                  </span>
                </button>
              )}
              {profile.isOwnProfile && profile.role !== "STUDENT" && (
                <button
                  onClick={() => setTab("creator")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    tab === "creator"
                      ? "border-accent text-accent"
                      : "border-transparent text-secondary"
                  }`}
                >
                  <BarChart3 size={13} />
                  Creator
                </button>
              )}
            </div>

            {/* Attempts tab */}
            {tab === "attempts" && profile.isOwnProfile && (
              <div className="flex flex-col gap-3">
                {profile.attempts.length === 0 ? (
                  <div className="flex flex-col items-center py-10 gap-2 text-secondary">
                    <Target size={32} className="text-border" />
                    <p className="text-sm">No attempts yet</p>
                  </div>
                ) : (
                  profile.attempts.map((a) => (
                    <div
                      key={a.id}
                      onClick={() =>
                        router.push(`/interview/${a.interview.id}`)
                      }
                      className="flex items-center justify-between border border-border rounded-[12px] px-4 py-3 hover:border-accent cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {a.interview.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-xs font-medium"
                            style={{
                              color: difficultyColor(a.interview.difficulty),
                            }}
                          >
                            {a.interview.difficulty}
                          </span>
                          <span className="text-xs text-tertiary">
                            {a.submittedAt
                              ? new Date(a.submittedAt).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="font-bold text-accent">
                          {Math.round(a.score ?? 0)}%
                        </p>
                        <p className="text-xs text-warning">+{a.xpEarned} XP</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Creator Analytics tab */}
            {tab === "creator" && profile.isOwnProfile && (
              <CreatorAnalyticsTab />
            )}

            {/* Public/Private tabs */}
            {(tab === "public" || tab === "private") && (
              <div className="flex flex-col gap-3">
                {(tab === "public"
                  ? profile.publicInterviews
                  : profile.privateInterviews
                ).length === 0 ? (
                  <div className="flex flex-col items-center py-10 gap-2 text-secondary">
                    <BookOpen size={32} className="text-border" />
                    <p className="text-sm">No {tab} interviews yet</p>
                    {profile.isOwnProfile && (
                      <Button
                        variant="outline"
                        className="text-xs h-8 mt-1"
                        onClick={() => router.push("/create-interviews")}
                      >
                        Create one
                      </Button>
                    )}
                  </div>
                ) : (
                  (tab === "public"
                    ? profile.publicInterviews
                    : profile.privateInterviews
                  ).map((i) => (
                    <div
                      key={i.id}
                      onClick={() => router.push(`/interview/${i.id}`)}
                      className="flex items-center justify-between border border-border rounded-[12px] px-4 py-3 hover:border-accent cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          {i.visibility === "private" && (
                            <Lock size={12} className="text-tertiary" />
                          )}
                          <p className="text-sm font-semibold">{i.title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-medium"
                            style={{ color: difficultyColor(i.difficulty) }}
                          >
                            {i.difficulty}
                          </span>
                          <span className="text-xs text-tertiary">
                            {i.questionCount} questions
                          </span>
                          <span className="text-xs text-tertiary capitalize">
                            {i.mode}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 text-xs text-tertiary">
                        <span>{i._count.attempts} attempts</span>
                        <span>{i._count.likes} likes</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:w-72 flex flex-col gap-4 shrink-0">
          {/* Quick stats */}
          <div className="bg-foreground border border-border rounded-[22px] p-5">
            <h3 className="font-semibold mb-3 text-sm">Stats</h3>
            <div className="flex flex-col">
              {[
                {
                  label: "Total Attempts",
                  value: profile._count.attempts,
                  icon: "🎯",
                },
                {
                  label: "Interviews Created",
                  value: profile._count.interviews,
                  icon: "✍️",
                },
                {
                  label: "Public Interviews",
                  value: profile.publicInterviews.length,
                  icon: "🌐",
                },
                {
                  label: "Friends",
                  value: profile._count.followers,
                  icon: "👥",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-xs text-secondary flex items-center gap-2">
                    {s.icon} {s.label}
                  </span>
                  <span className="text-sm font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Areas — own profile only */}
          {profile.isOwnProfile && <WeakAreasPanel />}

          {/* Badges */}
          <div className="bg-foreground border border-border rounded-[22px] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Badges</h3>
              <span className="text-xs text-tertiary">
                {earnedBadgeKeys.size}/{BADGES.length}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {BADGES.map((badge) => {
                const earned = earnedBadgeKeys.has(badge.key);
                return (
                  <div
                    key={badge.key}
                    title={`${badge.name}: ${badge.description}`}
                    className={`flex flex-col items-center gap-1 p-2 rounded-[12px] transition-colors cursor-default ${
                      earned
                        ? "bg-accent/10 border border-accent/30"
                        : "bg-border/20 border border-transparent opacity-35"
                    }`}
                  >
                    <span className="text-2xl">{badge.emoji}</span>
                    <span className="text-[9px] text-center text-secondary leading-tight line-clamp-2">
                      {badge.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
