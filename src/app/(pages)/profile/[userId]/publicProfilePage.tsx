"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
} from "lucide-react";
import InterviewModal from "@/components/ui/interview-modal";
import InterviewPreviewModal from "@/components/ui/interview-preview-modal";
import { Interview } from "@/app/types/interview";
import { BADGES } from "@/lib/badge-definitions";

type UserBadge = {
  badge: { key: string; name: string; description: string; icon: string };
  earnedAt: string;
};

type PublicProfile = {
  id: string;
  name: string | null;
  avatar: string | null;
  level: number;
  xp: number;
  role: string;
  field: string | null;
  roleTitle: string | null;
  portfolioLink: string | null;
  linkedinLink: string | null;
  githubLink: string | null;
  showXp: boolean;
  showScore: boolean;
  showAttempts: boolean;
  avgScore: number | null;
  isOwnProfile: boolean;
  badges: UserBadge[];
  publicInterviews: {
    id: string;
    title: string;
    difficulty: string;
    visibility: string;
    questionCount: number;
    mode: string;
    topics: string[];
    role: string;
    createdAt: string;
    interviewType: string;
    _count: { attempts: number; likes: number };
  }[];
  _count: { interviews: number; attempts: number; followers: number };
};

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null,
  );

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/profile?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.isOwnProfile) {
          router.replace("/profile");
          return;
        }
        setProfile(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId, router]);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <LoaderOne />
      </div>
    );
  if (!profile)
    return (
      <div className="text-secondary text-center py-20">User not found</div>
    );

  const earnedBadgeKeys = new Set(
    profile.badges?.map((b) => b.badge.key) ?? [],
  );

  return (
    <div className="py-5 flex flex-col gap-6">
      {/* Header */}
      <div className="bg-foreground border border-border rounded-[22px] p-6 flex flex-col sm:flex-row gap-5">
        <Image
          src={profile.avatar ?? "/profile-setup/avatar1.png"}
          width={90}
          height={90}
          alt="avatar"
          className="rounded-full ring-2 ring-accent border-3 border-foreground shrink-0 w-[90px] h-[90px] object-cover"
          sizes="90px"
        />
        <div className="flex-1 flex flex-col gap-2">
          <div>
            <h2 className="font-bold text-xl">{profile.name}</h2>
            <p className="text-secondary text-sm">
              {profile.roleTitle ?? profile.field ?? profile.role}
            </p>
          </div>

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

          <div className="flex gap-4 flex-wrap mt-1">
            <div className="flex items-center gap-1 text-sm">
              <Trophy size={14} className="text-warning" />
              <span className="font-semibold">Level {profile.level}</span>
            </div>
            {profile.showXp && (
              <div className="flex items-center gap-1 text-sm">
                <Sparkles size={14} className="text-warning" />
                <span className="font-semibold">{profile.xp} XP</span>
              </div>
            )}
            {profile.showAttempts && (
              <div className="flex items-center gap-1 text-sm">
                <Target size={14} className="text-accent" />
                <span className="font-semibold">
                  {profile._count.attempts} attempts
                </span>
              </div>
            )}
            {profile.showScore && profile.avgScore !== null && (
              <div className="flex items-center gap-1 text-sm">
                <span className="font-semibold text-accent">
                  {profile.avgScore}% avg score
                </span>
              </div>
            )}
            {profile.role !== "STUDENT" && (
              <div className="flex items-center gap-1 text-sm">
                <BookOpen size={14} className="text-accent" />
                <span className="font-semibold">
                  {profile.publicInterviews.length} public interviews
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left — public interviews (creators only) */}
        {profile.role !== "STUDENT" && (
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-4">Public Interviews</h3>
            {profile.publicInterviews.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2 text-secondary">
                <BookOpen size={32} className="text-border" />
                <p className="text-sm">No public interviews yet</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-x-3 gap-y-5">
                {profile.publicInterviews.map((i) => (
                  <InterviewModal
                    key={i.id}
                    interview={{
                      ...i,
                      description: "",
                      createdBy: profile.id,
                      isLiked: false,
                      isSaved: false,
                      likes: i._count.likes,
                      attemptCount: i._count.attempts,
                      recentAttemptees: [],
                      questions: [],
                      interviewType: i.interviewType as
                        | "technical"
                        | "behavioral"
                        | "hr"
                        | "mixed",
                      creator: {
                        id: profile.id,
                        name: profile.name,
                        avatar: profile.avatar,
                      },
                    }}
                    onPreview={() =>
                      fetch(`/api/interviews/${i.id}`)
                        .then((r) => r.json())
                        .then(setSelectedInterview)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right — badges (full width for students) */}
        <div className={profile.role === "STUDENT" ? "w-full" : "lg:w-72 shrink-0"}>
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
                    className={`flex flex-col items-center gap-1 p-2 rounded-[12px] cursor-default transition-colors ${
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

      {selectedInterview && (
        <InterviewPreviewModal
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
        />
      )}
    </div>
  );
}
