"use client";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { RoleDropdown } from "@/components/ui/role-dropdown";
import { nanoid } from "nanoid";
import { RadioGroup } from "@radix-ui/react-radio-group";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import InterviewPreview from "./interviewPreview";
import { Interview } from "@/app/types/interview";

interface InterviewFormProps {
  onFinish: () => void;
  onCreate: (interview: Interview) => void;
}

type InterviewQuestion = {
  id: string;
  index: number;
  question: string;
  answer: string;
  keywords: string[];
  newKeyword?: string;
};

export default function InterviewForm({
  onFinish,
  onCreate,
}: InterviewFormProps) {
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [roleIndustry, setRoleIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced" | ""
  >("");
  const [interviewType, setInterviewType] = useState<
    "technical" | "behavioral" | "hr" | "mixed" | ""
  >("");
  const [numberOfQuestion, setNumberOfQuestion] = useState<number>(0);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [mode, setMode] = useState<"custom" | "ai" | "">("");
  const [visibility, setVisibility] = useState<"private" | "public" | "">("");
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [showQuestions, setShowQuestions] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState("");

  const { data: session } = useSession();
  const userRole = session?.user?.role;

  // ── Topic helpers ───────────────────────────────────────────
  const addTopic = () => {
    if (!value.trim() || topics.includes(value.trim())) return;
    setTopics([...topics, value.trim()]);
    setValue("");
  };
  const removeTopic = (topic: string) =>
    setTopics(topics.filter((t) => t !== topic));

  // ── Question helpers ────────────────────────────────────────
  const updateField = (
    id: string,
    field: "question" | "answer",
    val: string,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: val } : q)),
    );
  };
  const addKeyword = (id: string, keyword: string) => {
    if (!keyword.trim()) return;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, keywords: [...q.keywords, keyword.trim()] } : q,
      ),
    );
  };
  const removeKeyword = (id: string, keyword: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, keywords: q.keywords.filter((k) => k !== keyword) }
          : q,
      ),
    );
  };

  // ── AI Generation ───────────────────────────────────────────
  const handleGenerate = async () => {
    if (!role || !topics.length || !difficulty || !numberOfQuestion) {
      setGenerateError(
        "Please fill in Role, Topics, Difficulty and Number of Questions first.",
      );
      return;
    }
    setGenerateError("");
    setIsGenerating(true);
    try {
      const res = await fetch("/api/interviews/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          topics,
          difficulty,
          interviewType: interviewType || "mixed",
          questionCount: numberOfQuestion,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 429) {
          setGenerateError(
            err.error ?? "Daily limit reached. Try again tomorrow.",
          );
        } else {
          setGenerateError("Failed to generate questions. Please try again.");
        }
        return;
      }

      const { questions: generated } = await res.json();

      setQuestions(
        generated.map(
          (
            q: { question: string; answer: string; keywords: string[] },
            i: number,
          ) => ({
            id: nanoid(),
            index: i,
            question: q.question,
            answer: q.answer,
            keywords: q.keywords,
          }),
        ),
      );
    } catch {
      setGenerateError("Failed to generate questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhanceAnswers = async () => {
    const unanswered = questions.filter((q) => q.question.trim());
    if (!unanswered.length) {
      setEnhanceError("Please enter at least one question first.");
      return;
    }
    if (!role || !difficulty || !interviewType) {
      setEnhanceError(
        "Please fill in Role, Difficulty and Interview Type first.",
      );
      return;
    }

    setEnhanceError("");
    setIsEnhancing(true);

    try {
      const res = await fetch("/api/interviews/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          topics,
          difficulty,
          interviewType: interviewType || "mixed",
          questionCount: unanswered.length,
          existingQuestions: unanswered.map((q) => q.question.trim()),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 429) {
          setEnhanceError(
            err.error ?? "Daily limit reached. Try again tomorrow.",
          );
        } else {
          setEnhanceError("Failed to generate answers. Please try again.");
        }
        return;
      }

      const { questions: enhanced } = await res.json();

      // Merge AI answers+keywords back into existing questions by index
      setQuestions((prev) =>
        prev.map((q, i) => {
          const match = enhanced[i];
          if (!match) return q;
          return {
            ...q,
            answer: match.answer,
            keywords: match.keywords,
          };
        }),
      );
    } catch {
      setEnhanceError("Failed to generate answers. Please try again.");
    } finally {
      setIsEnhancing(false);
    }
  };

  // ── Preview gate ────────────────────────────────────────────
  const aiReady =
    mode === "ai" &&
    questions.length === numberOfQuestion &&
    numberOfQuestion > 0;
  const customReady =
    mode === "custom" &&
    questions.length === numberOfQuestion &&
    numberOfQuestion > 0 &&
    questions.every((q) => q.question.trim() && q.answer.trim()); // still requires answers, just AI fills them

  const canPreview =
    title &&
    role &&
    description &&
    topics.length > 0 &&
    difficulty &&
    interviewType &&
    mode &&
    visibility &&
    (aiReady || customReady);

  return (
    <div>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 px-4 ${showPreview ? "invisible" : "visible"}`}
      >
        <div className="bg-foreground border-2 border-accent rounded-[22px] w-full sm:w-[90%] md:w-[80%] max-w-6xl max-h-[90vh] overflow-y-auto relative flex flex-col p-5 md:p-10">
          <button className="absolute top-4 right-4" onClick={onFinish}>
            <X className="text-tertiary hover:text-secondary cursor-pointer" />
          </button>

          <h2 className="text-lg md:text-2xl font-semibold">
            Create Interview
          </h2>
          <p className="sub-text text-sm md:text-base mb-4">
            Customize your interview experience for targeted preparation
          </p>
          <hr className="border border-border my-5" />

          <form className="flex-1 flex flex-col gap-4">
            {/* Title & Role */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-1">
                <Label>
                  Title <span className="text-error">*</span>
                </Label>
                <Input
                  className="mt-2 h-10 w-full"
                  placeholder="Enter interview title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label>
                  Category / Role <span className="text-error">*</span>
                </Label>
                <RoleDropdown
                  userIndustry={session?.user?.field}
                  placeholder="Choose the role"
                  value={role}
                  onChange={(r, industry) => {
                    setRole(r);
                    setRoleIndustry(industry);
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label>
                Description <span className="text-error">*</span>
              </Label>
              <Textarea
                className="mt-2 h-28 md:h-32 w-full"
                placeholder="Enter interview description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Topics & Difficulty */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-1 space-y-2">
                <Label>
                  Skills / Topics <span className="text-error">*</span>
                </Label>
                {topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {topics.map((topic) => (
                      <div
                        key={topic}
                        className="flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
                      >
                        <span>{topic}</span>
                        <button
                          type="button"
                          onClick={() => removeTopic(topic)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Input
                    placeholder="Add topic"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTopic()}
                    className="w-full pr-10 h-10"
                  />
                  <button
                    type="button"
                    onClick={addTopic}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-accent"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <Label>
                  Difficulty Level <span className="text-error">*</span>
                </Label>
                <Dropdown
                  className="mt-2 h-10 w-full"
                  options={["Beginner", "Intermediate", "Advanced"]}
                  colors={["#22c55e", "#facc15", "#ef4444"]}
                  placeholder="Choose the difficulty level"
                  onChange={(value) =>
                    setDifficulty(
                      value.toLowerCase() as
                        | "beginner"
                        | "intermediate"
                        | "advanced",
                    )
                  }
                />
              </div>
            </div>

            {/* Interview Type */}
            <div>
              <Label>
                Interview Type <span className="text-error">*</span>
              </Label>
              <RadioGroup
                className="flex gap-2 mt-2 flex-wrap"
                onValueChange={(val) =>
                  setInterviewType(
                    val as "technical" | "behavioral" | "hr" | "mixed",
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
                    className="flex items-center space-x-2 border border-muted rounded-[11px] px-4 py-2"
                  >
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <Label htmlFor={opt.value}>{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Mode & Number of Questions */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-1">
                <Label>
                  Mode <span className="text-error">*</span>
                </Label>
                <RadioGroup
                  className="flex gap-2 mt-2 flex-wrap"
                  onValueChange={(value) => {
                    setMode(value as "custom" | "ai");
                    setQuestions([]); // reset questions on mode switch
                  }}
                >
                  <div className="flex items-center space-x-2 border border-muted rounded-[11px] px-4 py-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Custom Interview</Label>
                  </div>
                  <div className="flex items-center space-x-2 border border-muted rounded-[11px] px-4 py-2">
                    <RadioGroupItem value="ai" id="ai" />
                    <Label htmlFor="ai">AI-Generated</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex-1">
                <Label>
                  Number of Questions <span className="text-error">*</span>
                </Label>
                <NumberInput
                  min={1}
                  max={20}
                  placeholder="Enter number of questions"
                  className="mt-2 w-full"
                  onChange={(value) => {
                    setNumberOfQuestion(value);
                    if (mode === "custom") {
                      setQuestions((prev) => {
                        if (value <= prev.length) return prev.slice(0, value);
                        return [
                          ...prev,
                          ...Array.from(
                            { length: value - prev.length },
                            (_, i) => ({
                              id: nanoid(),
                              index: prev.length + i,
                              question: "",
                              answer: "",
                              keywords: [],
                            }),
                          ),
                        ];
                      });
                    } else {
                      setQuestions([]); // clear AI questions when count changes
                    }
                  }}
                />
              </div>
            </div>

            {/* Custom Questions */}
            {mode === "custom" && (
              <>
                <div className="flex items-center justify-between mt-5">
                  <Label>
                    Interview Questions <span className="text-error">*</span>
                  </Label>
                </div>

                <div className="flex flex-col gap-3">
                  {questions.map((q, i) => (
                    <div
                      key={q.id}
                      className="flex flex-col gap-2 border border-border rounded-[12px] p-3"
                    >
                      <p className="text-xs text-tertiary">Question {i + 1}</p>

                      {/* User types only the question */}
                      <Textarea
                        placeholder="Enter your interview question"
                        value={q.question}
                        onChange={(e) =>
                          updateField(q.id, "question", e.target.value)
                        }
                        className="w-full h-10"
                      />

                      {/* Answer — shown after enhancement, still editable */}
                      {q.answer && (
                        <Textarea
                          placeholder="Ideal answer"
                          value={q.answer}
                          onChange={(e) =>
                            updateField(q.id, "answer", e.target.value)
                          }
                          className="w-full min-h-10"
                        />
                      )}

                      {/* Keywords — shown after enhancement */}
                      {q.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {q.keywords.map((k) => (
                            <div
                              key={k}
                              className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs"
                            >
                              <span>{k}</span>
                              <button
                                type="button"
                                onClick={() => removeKeyword(q.id, k)}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Visibility */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <Label>
                Visibility <span className="text-error">*</span>
              </Label>
              <RadioGroup
                className="flex gap-2 mt-2 flex-wrap"
                onValueChange={(value) =>
                  setVisibility(value as "private" | "public")
                }
              >
                <div className="flex items-center space-x-2 border border-muted rounded-[11px] px-4 py-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">Private</Label>
                </div>
                {userRole === "CREATOR" && (
                  <div className="flex items-center space-x-2 border border-muted rounded-[11px] px-4 py-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public">Public</Label>
                  </div>
                )}
              </RadioGroup>
              {userRole === "STUDENT" && (
                <p className="sub-text text-xs mt-1 sm:mt-0">
                  Only Creator accounts can choose public visibility
                </p>
              )}
            </div>
          </form>
          {mode === "ai" && (
            <button
              onClick={() => setShowQuestions((prev) => !prev)}
              className="border w-full px-3 py-3 mt-5"
            >
              {showQuestions ? (
                <div className="flex items-center justify-between w-full text-secondary">
                  <p className="text-xs text-secondary">
                    ✓ {questions.length} questions generated — you can edit them
                    before previewing.
                  </p>
                  <p className=" text-xs">
                    (Not recommended if you want an authentic interview
                    experience)
                  </p>
                  <ChevronUp />
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <p className="text-xs text-secondary">
                    ✓ {questions.length} questions generated — you can edit them
                    before previewing.
                  </p>
                  <p className=" text-xs text-error">
                    (Not recommended if you want an authentic interview
                    experience)
                  </p>
                  <ChevronDown />
                </div>
              )}
            </button>
          )}

          {/* AI Generation Button */}
          {showQuestions && (
            <div className="flex flex-col gap-2">
              {generateError && (
                <p
                  className={`text-xs text-right ${
                    generateError.includes("limit")
                      ? "text-warning"
                      : "text-error"
                  }`}
                >
                  {generateError.includes("limit") ? "⚠️ " : ""}
                  {generateError}
                </p>
              )}

              {/* Show generated questions (editable) */}
              {questions.length > 0 && (
                <div className="flex flex-col gap-3 mt-2">
                  {questions.map((q, i) => (
                    <div
                      key={q.id}
                      className="flex flex-col gap-2 border border-border rounded-[12px] p-3"
                    >
                      <p className="text-xs text-tertiary">Question {i + 1}</p>
                      <Textarea
                        placeholder="Question"
                        value={q.question}
                        onChange={(e) =>
                          updateField(q.id, "question", e.target.value)
                        }
                        className="w-full h-10"
                      />
                      <Textarea
                        placeholder="Ideal answer"
                        value={q.answer}
                        onChange={(e) =>
                          updateField(q.id, "answer", e.target.value)
                        }
                        className="w-full min-h-10"
                      />
                      <div className="flex flex-wrap gap-2">
                        {q.keywords.map((k) => (
                          <div
                            key={k}
                            className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs"
                          >
                            <span>{k}</span>
                            <button
                              type="button"
                              onClick={() => removeKeyword(q.id, k)}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* just above the button row */}
          {enhanceError && (
            <p className="text-error text-xs text-right">{enhanceError}</p>
          )}
          {generateError && (
            <p className="text-error text-xs text-right">{generateError}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-center justify-end mt-5">
            <Button
              className="w-full sm:w-32 h-10"
              variant="outline"
              onClick={onFinish}
            >
              Cancel
            </Button>

            {mode === "ai" ? (
              aiReady && canPreview ? (
                <Button
                  className="w-full sm:w-32 h-10"
                  type="button"
                  onClick={() => setShowPreview(true)}
                >
                  Preview
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleGenerate}
                  disabled={
                    isGenerating ||
                    !role ||
                    !topics.length ||
                    !difficulty ||
                    !numberOfQuestion
                  }
                  className="w-full sm:w-fit flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />{" "}
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Generate Questions
                    </>
                  )}
                </Button>
              )
            ) : mode === "custom" ? (
              customReady ? (
                <Button
                  className="w-full sm:w-32 h-10"
                  type="button"
                  onClick={() => setShowPreview(true)}
                >
                  Preview
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleEnhanceAnswers}
                  disabled={
                    isEnhancing ||
                    questions.every((q) => !q.question.trim()) ||
                    !role ||
                    !difficulty ||
                    !interviewType
                  }
                  className="w-full sm:w-fit flex items-center gap-2"
                >
                  {isEnhancing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Generating
                      Answers...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Generate Answers
                    </>
                  )}
                </Button>
              )
            ) : (
              <Button
                className="w-full sm:w-32 h-10"
                type="button"
                disabled={!canPreview}
                onClick={() => setShowPreview(true)}
              >
                Preview
              </Button>
            )}
          </div>
        </div>
      </div>
      {showPreview && mode && visibility && difficulty && interviewType && (
        <InterviewPreview
          onBack={() => setShowPreview(false)}
          onConfirm={() => setShowPreview(false)}
          onCreate={(newInterview) => {
            onCreate(newInterview);
            onFinish();
          }}
          data={{
            title,
            role,
            description,
            topics,
            difficulty,
            interviewType,
            numberOfQuestion,
            questions,
            mode,
            visibility,
            creatorField: roleIndustry || session?.user?.field || null,
          }}
        />
      )}
    </div>
  );
}
