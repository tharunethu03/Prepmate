"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  BarChart3,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  BookOpen,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type {
  CreatorAnalyticsResponse,
  InterviewAnalytic,
} from "@/app/api/creator-analytics/route";
import { useRouter } from "next/navigation";

function difficultyColor(d: string) {
  if (d === "beginner") return "#22c55e";
  if (d === "intermediate") return "#facc15";
  return "#ef4444";
}

function scoreColor(score: number | null) {
  if (score === null) return "var(--tertiary)";
  if (score >= 70) return "#22c55e";
  if (score >= 45) return "#facc15";
  return "#ef4444";
}

function ScoreBar({ score }: { score: number | null }) {
  const pct = score ?? 0;
  return (
    <div className="flex items-center gap-2 flex-1">
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--border)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: scoreColor(score) }}
        />
      </div>
      <span
        className="text-xs font-semibold w-9 text-right shrink-0"
        style={{ color: scoreColor(score) }}
      >
        {score !== null ? `${score}%` : "—"}
      </span>
    </div>
  );
}

function InterviewCard({ iv }: { iv: InterviewAnalytic }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  return (
    <div
      className="border border-border rounded-[16px] overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Card header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  color: difficultyColor(iv.difficulty),
                  background: `${difficultyColor(iv.difficulty)}18`,
                }}
              >
                {iv.difficulty}
              </span>
              <span className="text-[11px] text-tertiary">{iv.role}</span>
            </div>
            <h4
              className="font-semibold text-sm leading-snug truncate cursor-pointer hover:text-accent transition-colors"
              style={{ color: "var(--primary)" }}
              onClick={() => router.push(`/interview/${iv.id}`)}
            >
              {iv.title}
            </h4>
          </div>

          {/* Avg score ring */}
          <div className="flex flex-col items-center shrink-0">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2"
              style={{
                borderColor: scoreColor(iv.avgScore),
                color: scoreColor(iv.avgScore),
                background: `${scoreColor(iv.avgScore)}12`,
              }}
            >
              {iv.avgScore !== null ? `${iv.avgScore}%` : "—"}
            </div>
            <span className="text-[9px] text-tertiary mt-0.5">avg score</span>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-secondary">
            <Users size={12} />
            <span>
              <strong style={{ color: "var(--primary)" }}>
                {iv.totalAttempts}
              </strong>{" "}
              attempt{iv.totalAttempts !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-secondary">
            <ThumbsUp size={12} />
            <span>
              <strong style={{ color: "var(--primary)" }}>{iv.likes}</strong>{" "}
              like{iv.likes !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-secondary">
            <BookOpen size={12} />
            <span>
              <strong style={{ color: "var(--primary)" }}>
                {iv.questions.length}
              </strong>{" "}
              questions
            </span>
          </div>
        </div>
      </div>

      {/* Expand toggle */}
      {iv.questions.length > 0 && iv.totalAttempts > 0 && (
        <>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium transition-colors hover:bg-border/30"
            style={{
              borderTop: "1px solid var(--border)",
              color: "var(--secondary)",
            }}
          >
            <span className="flex items-center gap-1.5">
              <TrendingDown size={12} />
              Question breakdown
            </span>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 flex flex-col gap-2.5 pt-2">
                  {iv.questions.map((q, idx) => (
                    <div key={q.id} className="flex flex-col gap-1">
                      <div className="flex items-start gap-2">
                        {/* Worst label badge */}
                        {idx === 0 && iv.questions.length > 1 && (
                          <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 mt-0.5">
                            WEAKEST
                          </span>
                        )}
                        <p
                          className="text-xs leading-snug flex-1"
                          style={{ color: "var(--secondary)" }}
                        >
                          <span
                            className="font-semibold mr-1"
                            style={{ color: "var(--primary)" }}
                          >
                            Q{q.order + 1}.
                          </span>
                          {q.question.length > 100
                            ? q.question.slice(0, 100) + "…"
                            : q.question}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pl-1">
                        <ScoreBar score={q.avgScore} />
                        <span className="text-[10px] text-tertiary whitespace-nowrap shrink-0">
                          {q.responseCount} resp.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* No attempts yet message */}
      {iv.totalAttempts === 0 && (
        <div
          className="px-4 pb-3 flex items-center gap-1.5 text-xs"
          style={{ color: "var(--tertiary)", borderTop: "1px solid var(--border)" }}
        >
          <AlertCircle size={11} />
          No one has attempted this yet
        </div>
      )}
    </div>
  );
}

export default function CreatorAnalyticsTab() {
  const [data, setData] = useState<CreatorAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/creator-analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={22} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!data || data.totalPublicInterviews === 0) {
    return (
      <div className="flex flex-col items-center py-14 gap-3 text-secondary">
        <BarChart3 size={36} className="text-border" />
        <p className="text-sm font-medium">No public interviews yet</p>
        <p className="text-xs text-tertiary text-center max-w-56">
          Publish an interview and share it with the community to see analytics
          here.
        </p>
        <button
          onClick={() => router.push("/create-interviews")}
          className="mt-2 text-xs font-semibold px-4 py-2 rounded-xl border transition-colors hover:border-accent hover:text-accent"
          style={{ borderColor: "var(--border)", color: "var(--secondary)" }}
        >
          Create Interview
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Overview strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: <BookOpen size={15} />,
            label: "Public Interviews",
            value: data.totalPublicInterviews,
            suffix: "",
            color: "var(--accent)",
          },
          {
            icon: <Users size={15} />,
            label: "Total Attempts",
            value: data.totalAttempts,
            suffix: "",
            color: "#22c55e",
          },
          {
            icon: <BarChart3 size={15} />,
            label: "Overall Avg Score",
            value: data.overallAvgScore ?? "—",
            suffix: data.overallAvgScore !== null ? "%" : "",
            color: scoreColor(data.overallAvgScore),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-border rounded-[14px] px-3 py-3 flex flex-col gap-1.5"
            style={{ background: "var(--foreground)" }}
          >
            <div className="flex items-center gap-1.5" style={{ color: stat.color }}>
              {stat.icon}
              <span className="text-[10px] font-medium text-secondary">
                {stat.label}
              </span>
            </div>
            <p
              className="text-xl font-bold leading-none"
              style={{ color: stat.color }}
            >
              {stat.value}
              {stat.suffix}
            </p>
          </div>
        ))}
      </div>

      {/* Per-interview cards */}
      <div className="flex flex-col gap-3">
        {data.interviews.map((iv) => (
          <motion.div
            key={iv.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <InterviewCard iv={iv} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
