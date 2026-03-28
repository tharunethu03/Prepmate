"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Briefcase,
  Code2,
  GraduationCap,
  Lightbulb,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ResumeSnapshot } from "@/app/api/resume/parse/route";
import { Dropdown } from "@/components/ui/dropdown";
import { RadioGroup } from "@radix-ui/react-radio-group";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";

type Step = "upload" | "review" | "generating";

// ── Helpers ─────────────────────────────────────────────────────────────────

function ChipList({ items, color }: { items: string[]; color?: string }) {
  if (!items.length) return <span className="text-xs text-tertiary">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border"
          style={{
            borderColor: color ?? "var(--border)",
            color: color ?? "var(--secondary)",
            background: color ? `${color}12` : "var(--background)",
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function SeniorityBadge({
  level,
}: {
  level: ResumeSnapshot["seniorityLevel"];
}) {
  const colors: Record<string, string> = {
    junior: "#22c55e",
    mid: "#3b82f6",
    senior: "#f59e0b",
    lead: "#8b5cf6",
    unknown: "var(--tertiary)",
  };
  const labels: Record<string, string> = {
    junior: "Junior",
    mid: "Mid-level",
    senior: "Senior",
    lead: "Lead / Principal",
    unknown: "Unknown",
  };
  const c = colors[level] ?? "var(--tertiary)";
  return (
    <span
      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color: c, background: `${c}18` }}
    >
      {labels[level]}
    </span>
  );
}

// ── Upload Step ──────────────────────────────────────────────────────────────

function UploadStep({
  onParsed,
}: {
  onParsed: (snapshot: ResumeSnapshot) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (f: File): string => {
    if (f.type !== "application/pdf") return "Please upload a PDF file.";
    if (f.size > 5 * 1024 * 1024) return "File too large. Maximum size is 5MB.";
    return "";
  };

  const handleFile = (f: File) => {
    const err = validate(f);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleParse = async () => {
    if (!file) return;
    setParsing(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to parse resume.");
        return;
      }
      onParsed(data.snapshot);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 max-w-lg w-full mx-auto">
      {/* Drop zone */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full rounded-[22px] border-2 border-dashed transition-all duration-200 cursor-pointer ${
          dragging ? "border-accent bg-accent/5 scale-[1.01]" : "border-border"
        }`}
        style={{ background: dragging ? undefined : "var(--foreground)" }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div className="flex flex-col items-center py-12 px-6 text-center gap-4">
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="file"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--accent)", opacity: 0.9 }}
                >
                  <FileText size={28} className="text-white" />
                </div>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "var(--primary)" }}
                  >
                    {file.name}
                  </p>
                  <p className="text-xs text-tertiary mt-0.5">
                    {(file.size / 1024).toFixed(0)} KB · PDF
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setError("");
                  }}
                  className="flex items-center gap-1.5 text-xs text-tertiary hover:text-secondary transition-colors"
                >
                  <X size={12} /> Remove
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--border)" }}
                >
                  <Upload size={28} className="text-secondary" />
                </div>
                <div>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--primary)" }}
                  >
                    Drop your resume here
                  </p>
                  <p className="text-sm text-secondary mt-1">
                    or{" "}
                    <span className="text-accent font-medium cursor-pointer">
                      browse files
                    </span>
                  </p>
                </div>
                <p className="text-xs text-tertiary">PDF only · Max 5MB</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm w-full px-4 py-3 rounded-[12px]"
          style={{ background: "#ef444418", color: "#ef4444" }}
        >
          <AlertCircle size={14} />
          {error}
        </motion.div>
      )}

      {/* Analyse button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        disabled={!file || parsing}
        onClick={handleParse}
        className="w-full h-12 rounded-[14px] font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
        style={{ background: "var(--accent-gradient)", color: "#fff" }}
      >
        {parsing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Analysing resume…
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Analyse Resume
          </>
        )}
      </motion.button>

      <p className="text-xs text-tertiary text-center max-w-xs">
        Your resume is processed securely and never stored on our servers.
      </p>
    </div>
  );
}

// ── Review + Configure Step ──────────────────────────────────────────────────

function ReviewStep({
  snapshot,
  onGenerate,
  onReset,
}: {
  snapshot: ResumeSnapshot;
  onGenerate: (
    difficulty: "beginner" | "intermediate" | "advanced",
    questionCount: number,
    interviewType: "technical" | "behavioral" | "hr" | "mixed",
  ) => void;
  onReset: () => void;
}) {
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced" | ""
  >("");
  const [questionCount, setQuestionCount] = useState(8);
  const [interviewType, setInterviewType] = useState<
    "technical" | "behavioral" | "hr" | "mixed" | ""
  >("");

  const canGenerate = difficulty && interviewType && questionCount >= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"
    >
      {/* ── Left: Resume Snapshot ─────────────────────────────── */}
      <div
        className="border border-border rounded-[22px] p-6 flex flex-col gap-5"
        style={{ background: "var(--foreground)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3
              className="font-bold text-lg"
              style={{ color: "var(--primary)" }}
            >
              {snapshot.detectedRole}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <SeniorityBadge level={snapshot.seniorityLevel} />
              {snapshot.yearsOfExperience !== "unknown" && (
                <span className="text-xs text-secondary">
                  {snapshot.yearsOfExperience}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-tertiary hover:text-secondary transition-colors shrink-0 mt-1"
          >
            <RefreshCw size={12} />
            Re-upload
          </button>
        </div>

        {/* Recent jobs */}
        {snapshot.recentJobs.length > 0 && (
          <div className="flex flex-col gap-2">
            <div
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ color: "var(--tertiary)" }}
            >
              <Briefcase size={12} />
              Recent Experience
            </div>
            <div className="flex flex-col gap-1.5">
              {snapshot.recentJobs.map((job, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                    style={{ background: "var(--accent)" }}
                  />
                  <div>
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--primary)" }}
                    >
                      {job.title}
                    </p>
                    <p className="text-[11px] text-secondary">
                      {job.company}
                      {job.duration ? ` · ${job.duration}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technologies */}
        {snapshot.technologies.length > 0 && (
          <div className="flex flex-col gap-2">
            <div
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ color: "var(--tertiary)" }}
            >
              <Code2 size={12} />
              Technologies
            </div>
            <ChipList items={snapshot.technologies} color="var(--accent)" />
          </div>
        )}

        {/* Skills */}
        {snapshot.skills.length > 0 && (
          <div className="flex flex-col gap-2">
            <div
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ color: "var(--tertiary)" }}
            >
              <Sparkles size={12} />
              Skills
            </div>
            <ChipList items={snapshot.skills} />
          </div>
        )}

        {/* Education */}
        {snapshot.education && snapshot.education !== "unknown" && (
          <div className="flex flex-col gap-2">
            <div
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ color: "var(--tertiary)" }}
            >
              <GraduationCap size={12} />
              Education
            </div>
            <p className="text-xs text-secondary">{snapshot.education}</p>
          </div>
        )}

        {/* Key highlights */}
        {snapshot.keyHighlights.length > 0 && (
          <div className="flex flex-col gap-2">
            <div
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ color: "var(--tertiary)" }}
            >
              <Lightbulb size={12} />
              Question Hooks
            </div>
            <div className="flex flex-col gap-1.5">
              {snapshot.keyHighlights.map((h, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <CheckCircle2
                    size={12}
                    className="text-accent mt-0.5 shrink-0"
                  />
                  <p className="text-[11px] text-secondary leading-relaxed">
                    {h}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Right: Configure ──────────────────────────────────── */}
      <div className="flex flex-col gap-5">
        <div
          className="border border-border rounded-[22px] p-6 flex flex-col gap-5"
          style={{ background: "var(--foreground)" }}
        >
          <h3
            className="font-bold text-base"
            style={{ color: "var(--primary)" }}
          >
            Configure Interview
          </h3>

          {/* Difficulty */}
          <div>
            <Label className="mb-2 block">Difficulty</Label>
            <Dropdown
              className="h-10 w-full"
              options={["Beginner", "Intermediate", "Advanced"]}
              colors={["#22c55e", "#facc15", "#ef4444"]}
              placeholder="Choose difficulty"
              onChange={(v) =>
                setDifficulty(
                  v.toLowerCase() as "beginner" | "intermediate" | "advanced",
                )
              }
            />
          </div>

          {/* Number of questions */}
          <div>
            <Label className="mb-2 block">
              Number of Questions{" "}
              <span className="text-tertiary font-normal">(3–15)</span>
            </Label>
            <NumberInput
              min={3}
              max={15}
              placeholder="e.g. 8"
              className="w-full"
              onChange={setQuestionCount}
            />
          </div>

          {/* Interview type */}
          <div>
            <Label className="mb-2 block">Interview Type</Label>
            <RadioGroup
              className="flex gap-2 flex-wrap"
              onValueChange={(v) =>
                setInterviewType(
                  v as "technical" | "behavioral" | "hr" | "mixed",
                )
              }
            >
              {[
                { value: "technical", label: "Technical" },
                { value: "behavioral", label: "Behavioral" },
                { value: "hr", label: "HR" },
                { value: "mixed", label: "Mixed" },
              ].map((opt) => (
                <div
                  key={opt.value}
                  className="flex items-center gap-2 border border-muted rounded-[11px] px-4 py-2 cursor-pointer"
                >
                  <RadioGroupItem value={opt.value} id={`type-${opt.value}`} />
                  <Label
                    htmlFor={`type-${opt.value}`}
                    className="cursor-pointer"
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Info card */}
        <div
          className="rounded-[16px] p-4 flex gap-3"
          style={{
            background: "var(--accent)",
            opacity: 0.92,
          }}
        >
          <Lightbulb size={16} className="text-white mt-0.5 shrink-0" />
          <p className="text-xs text-white leading-relaxed">
            Questions will reference your specific experience — your
            technologies, companies, and projects — making this interview
            uniquely yours.
          </p>
        </div>

        {/* Generate button */}
        <button
          disabled={!canGenerate}
          onClick={() =>
            canGenerate &&
            onGenerate(
              difficulty as "beginner" | "intermediate" | "advanced",
              questionCount,
              interviewType as "technical" | "behavioral" | "hr" | "mixed",
            )
          }
          className="h-14 rounded-[16px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98] text-white"
          style={{ background: "var(--accent-gradient)" }}
        >
          <Sparkles size={20} />
          Generate My Interview
          <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Generating Step ──────────────────────────────────────────────────────────

function GeneratingStep() {
  const messages = [
    "Reading your experience…",
    "Crafting personalised questions…",
    "Referencing your technologies…",
    "Building your interview…",
  ];
  const [msgIdx] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 py-16"
    >
      <div className="relative">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "var(--accent-gradient)" }}
        >
          <FileText size={32} className="text-white" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute -inset-2 rounded-full border-2 border-dashed border-accent opacity-50"
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <h3 className="font-bold text-lg" style={{ color: "var(--primary)" }}>
          Building your interview
        </h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-sm text-secondary"
          >
            {messages[msgIdx]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Loading bars */}
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ scaleY: [1, 2, 1] }}
            transition={{
              repeat: Infinity,
              duration: 1,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
            className="w-1.5 rounded-full"
            style={{
              height: "20px",
              background: "var(--accent)",
              opacity: 0.6,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ResumeInterviewPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [snapshot, setSnapshot] = useState<ResumeSnapshot | null>(null);

  const handleParsed = (s: ResumeSnapshot) => {
    setSnapshot(s);
    setStep("review");
  };

  const handleGenerate = async (
    difficulty: "beginner" | "intermediate" | "advanced",
    questionCount: number,
    interviewType: "technical" | "behavioral" | "hr" | "mixed",
  ) => {
    if (!snapshot) return;
    setStep("generating");

    try {
      const res = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshot,
          difficulty,
          questionCount,
          interviewType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to generate interview.");
        setStep("review");
        return;
      }

      router.push(`/interview/${data.interviewId}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setStep("review");
    }
  };

  const stepLabels: { key: Step; label: string }[] = [
    { key: "upload", label: "Upload" },
    { key: "review", label: "Review" },
    { key: "generating", label: "Generate" },
  ];

  const stepIndex = stepLabels.findIndex((s) => s.key === step);

  return (
    <div className="flex flex-col gap-8 py-5">
      {/* Step indicator */}
      <div className="flex items-center gap-0 max-w-xs p-2">
        {stepLabels.map((s, i) => (
          <div key={s.key} className="flex items-center gap-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i < stepIndex
                    ? "bg-accent text-white"
                    : i === stepIndex
                      ? "bg-accent text-white ring-2 ring-accent ring-offset-2"
                      : "border-2 border-border text-tertiary"
                }`}
                style={
                  i < stepIndex
                    ? { background: "var(--accent-gradient)" }
                    : i === stepIndex
                      ? { background: "var(--accent-gradient)" }
                      : {}
                }
              >
                {i < stepIndex ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span
                className="text-[10px] font-medium whitespace-nowrap"
                style={{
                  color:
                    i === stepIndex
                      ? "var(--accent)"
                      : i < stepIndex
                        ? "var(--accent)"
                        : "var(--tertiary)",
                }}
              >
                {s.label}
              </span>
            </div>
            {i < stepLabels.length - 1 && (
              <div
                className="h-0.5 w-12 mb-4 transition-colors duration-300"
                style={{
                  background: i < stepIndex ? "var(--accent)" : "var(--border)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div key="upload" exit={{ opacity: 0, y: -10 }}>
            <UploadStep onParsed={handleParsed} />
          </motion.div>
        )}
        {step === "review" && snapshot && (
          <motion.div key="review" exit={{ opacity: 0, y: -10 }}>
            <ReviewStep
              snapshot={snapshot}
              onGenerate={handleGenerate}
              onReset={() => {
                setSnapshot(null);
                setStep("upload");
              }}
            />
          </motion.div>
        )}
        {step === "generating" && (
          <motion.div key="generating">
            <GeneratingStep />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
