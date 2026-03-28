"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  TrendingDown,
  TrendingUp,
  Minus,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  Dumbbell,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import type { WeakAreasResponse, WeakTopic } from "@/app/api/weak-areas/route";

function scoreColor(score: number) {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#facc15";
  return "#ef4444";
}

function TrendIcon({ trend }: { trend: WeakTopic["trend"] }) {
  if (trend === "improving")
    return <TrendingUp size={11} className="text-green-500" />;
  if (trend === "declining")
    return <TrendingDown size={11} className="text-red-400" />;
  return <Minus size={11} className="text-tertiary" />;
}

function TopicRow({ topic }: { topic: WeakTopic }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <TrendIcon trend={topic.trend} />
          <span
            className="text-xs font-medium truncate"
            style={{ color: "var(--primary)" }}
          >
            {topic.topic}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-tertiary">
            {topic.questionCount}q
          </span>
          <span
            className="text-xs font-bold w-8 text-right"
            style={{ color: scoreColor(topic.avgScore) }}
          >
            {topic.avgScore}%
          </span>
        </div>
      </div>
      {/* Score bar */}
      <div
        className="w-full h-1 rounded-full overflow-hidden"
        style={{ background: "var(--border)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${topic.avgScore}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: scoreColor(topic.avgScore) }}
        />
      </div>
    </div>
  );
}

export default function WeakAreasPanel() {
  const [data, setData] = useState<WeakAreasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStrong, setShowStrong] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/weak-areas");
      const json = await res.json();
      setData(json);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="border border-border rounded-[22px] p-5"
        style={{ background: "var(--foreground)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Brain size={15} className="text-accent" />
          <h3 className="font-semibold text-sm">Weak Areas</h3>
        </div>
        <div className="flex justify-center py-6">
          <Loader2 size={20} className="animate-spin text-accent" />
        </div>
      </div>
    );
  }

  // ── Not enough data ──────────────────────────────────────────────────
  if (!data || !data.hasEnoughData) {
    return (
      <div
        className="border border-border rounded-[22px] p-5"
        style={{ background: "var(--foreground)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Brain size={15} className="text-accent" />
          <h3 className="font-semibold text-sm">Weak Areas</h3>
        </div>
        <div className="flex flex-col items-center py-5 gap-2 text-center">
          <Dumbbell size={28} className="text-border" />
          <p className="text-xs font-medium" style={{ color: "var(--primary)" }}>
            Not enough data yet
          </p>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--tertiary)" }}>
            Complete{" "}
            <span className="font-semibold" style={{ color: "var(--accent)" }}>
              {Math.max(0, 5 - (data?.totalResponsesAnalyzed ?? 0))} more
            </span>{" "}
            interview{data?.totalResponsesAnalyzed !== 4 ? "s" : ""} to unlock
            your personalized weak areas analysis.
          </p>
          {/* Progress dots */}
          <div className="flex gap-1.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-colors"
                style={{
                  background:
                    i < (data?.totalResponsesAnalyzed ?? 0)
                      ? "var(--accent)"
                      : "var(--border)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasWeakTopics = data.weakTopics.length > 0;
  const hasInsights = data.aiInsights.length > 0;
  const hasStrongTopics = data.strongTopics.length > 0;

  // ── All good — no weak areas ─────────────────────────────────────────
  if (!hasWeakTopics) {
    return (
      <div
        className="border border-border rounded-[22px] p-5"
        style={{ background: "var(--foreground)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain size={15} className="text-accent" />
            <h3 className="font-semibold text-sm">Weak Areas</h3>
          </div>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: "#22c55e18", color: "#22c55e" }}
          >
            All strong
          </span>
        </div>
        <div className="flex flex-col items-center py-4 gap-1.5">
          <ShieldCheck size={28} className="text-green-500" />
          <p className="text-xs text-center" style={{ color: "var(--secondary)" }}>
            No consistent weak spots detected across your{" "}
            {data.totalResponsesAnalyzed} responses.
          </p>
        </div>
      </div>
    );
  }

  // ── Main panel ───────────────────────────────────────────────────────
  return (
    <div
      className="border border-border rounded-[22px] overflow-hidden"
      style={{ background: "var(--foreground)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <Brain size={15} className="text-accent" />
          <h3 className="font-semibold text-sm">Weak Areas</h3>
          <span
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            <Sparkles size={8} />
            AI
          </span>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="p-1 rounded-lg transition-colors hover:bg-border/40"
          title="Refresh analysis"
          style={{ color: "var(--tertiary)" }}
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="px-5 pb-4 flex flex-col gap-4">
        {/* Weak topic rows */}
        <div className="flex flex-col gap-3">
          {data.weakTopics.map((topic, i) => (
            <motion.div
              key={topic.topic}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
            >
              <TopicRow topic={topic} />
            </motion.div>
          ))}
        </div>

        {/* AI Insights */}
        {hasInsights && (
          <div
            className="rounded-[14px] p-3 flex flex-col gap-2"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--accent)" }}
            >
              <Sparkles size={10} />
              AI Insights
            </div>
            <div className="flex flex-col gap-2">
              {data.aiInsights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                  className="flex gap-2"
                >
                  <span className="text-[10px] mt-0.5 shrink-0">
                    {i === 0 ? "💡" : i === 1 ? "🎯" : "📌"}
                  </span>
                  <p
                    className="text-[11px] leading-relaxed"
                    style={{ color: "var(--secondary)" }}
                  >
                    {insight}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Strong topics (collapsible) */}
        {hasStrongTopics && (
          <div>
            <button
              onClick={() => setShowStrong((s) => !s)}
              className="flex items-center gap-1.5 text-[11px] font-medium transition-colors"
              style={{ color: "var(--tertiary)" }}
            >
              <ShieldCheck size={12} className="text-green-500" />
              Your strong areas
              {showStrong ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            <AnimatePresence>
              {showStrong && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-2.5 pt-3">
                    {data.strongTopics.map((topic) => (
                      <TopicRow key={topic.topic} topic={topic} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Footer: responses analysed */}
        <p className="text-[10px]" style={{ color: "var(--tertiary)" }}>
          Based on {data.totalResponsesAnalyzed} responses across your recent
          interviews
        </p>
      </div>
    </div>
  );
}
