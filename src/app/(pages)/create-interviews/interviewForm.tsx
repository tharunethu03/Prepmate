"use client";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { useState } from "react";
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
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced" | ""
  >("");
  const [numberOfQuestion, setNumberOfQuestion] = useState<number>(0);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [mode, setMode] = useState<"custom" | "ai" | "">("");
  const [visibility, setVisibility] = useState<"private" | "public" | "">("");
  const { data: session } = useSession();
  const [showPreview, setShowPreview] = useState(false);

  const userRole = session?.user?.role;

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: nanoid(),
        index: prev.length,
        question: "",
        answer: "",
        keywords: [],
      },
    ]);
  };

  const updateField = (
    id: string,
    field: "question" | "answer",
    value: string,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
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

  const addTopic = () => {
    if (!value.trim()) return;
    if (topics.includes(value.trim())) return;

    setTopics([...topics, value.trim()]);
    setValue("");
  };

  const removeTopic = (topic: string) => {
    setTopics(topics.filter((t) => t !== topic));
  };

  const canPreview =
    title &&
    role &&
    description &&
    topics.length > 0 &&
    difficulty &&
    mode &&
    visibility &&
    (mode === "ai" || questions.length === numberOfQuestion);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 px-4">
      <div className="bg-foreground border-2 border-accent rounded-[22px] w-full sm:w-[90%] md:w-[80%] max-w-6xl max-h-[90vh] overflow-y-auto relative flex flex-col p-5 md:p-10">
        <button className="absolute top-4 right-4" onClick={onFinish}>
          <X className="text-tertiary hover:text-secondary cursor-pointer" />
        </button>

        <h2 className="text-lg md:text-2xl font-semibold">Create Interview</h2>
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
              <Dropdown
                className="mt-2 h-10 w-full"
                options={[
                  "Frontend Engineer",
                  "Backend Engineer",
                  "Fullstack Engineer",
                  "Mobile Developer",
                  "DevOps Engineer",
                  "QA Engineer",
                ]}
                placeholder="Choose the category"
                onChange={(value) => setRole(value)}
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
            {/* Topics */}
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
                        className="text-muted-foreground hover:text-destructive"
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

            {/* Difficulty */}
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

          {/* Mode & Number of Questions */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <Label>
                Mode <span className="text-error">*</span>
              </Label>
              <RadioGroup
                className="flex gap-2 mt-2 flex-wrap"
                onValueChange={(value) => setMode(value as "custom" | "ai")}
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
                max={5}
                placeholder="Enter number of questions"
                className="mt-2 w-full"
                onChange={(value) => {
                  setNumberOfQuestion(value);
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
                }}
              />
            </div>
          </div>

          {/* Custom Questions */}
          {mode === "custom" && (
            <>
              <Label className="mt-5">
                Interview Questions <span className="text-error">*</span>
              </Label>
              <div className="flex flex-col gap-3">
                {questions.map((q) => (
                  <div key={q.id} className="flex flex-col gap-2">
                    <Textarea
                      placeholder="Enter interview question"
                      value={q.question}
                      onChange={(e) =>
                        updateField(q.id, "question", e.target.value)
                      }
                      className="w-full h-10"
                    />
                    <Textarea
                      placeholder="Enter expected answer"
                      value={q.answer}
                      onChange={(e) =>
                        updateField(q.id, "answer", e.target.value)
                      }
                      className="w-full min-h-10"
                    />

                    {/* Keywords */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add keyword"
                        value={q.newKeyword || ""}
                        onChange={(e) =>
                          setQuestions((prev) =>
                            prev.map((ques) =>
                              ques.id === q.id
                                ? { ...ques, newKeyword: e.target.value }
                                : ques,
                            ),
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addKeyword(q.id, q.newKeyword || "");
                            setQuestions((prev) =>
                              prev.map((ques) =>
                                ques.id === q.id
                                  ? { ...ques, newKeyword: "" }
                                  : ques,
                              ),
                            );
                          }
                        }}
                        className="h-10 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addKeyword(q.id, q.newKeyword || "");
                          setQuestions((prev) =>
                            prev.map((ques) =>
                              ques.id === q.id
                                ? { ...ques, newKeyword: "" }
                                : ques,
                            ),
                          );
                        }}
                        className="text-secondary hover:text-accent"
                      >
                        <Plus size={18} />
                      </button>

                      {q.keywords.map((k) => (
                        <div
                          key={k}
                          className="flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
                        >
                          <span>{k}</span>
                          <button
                            type="button"
                            onClick={() => removeKeyword(q.id, k)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Visibility */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-5">
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

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-center justify-end mt-5">
          <Button
            className="w-full sm:w-32 h-10"
            variant="outline"
            onClick={onFinish}
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:w-32 h-10"
            type="button"
            disabled={!canPreview}
            onClick={() => setShowPreview(true)}
          >
            Preview
          </Button>
        </div>
      </div>

      {showPreview && mode && visibility && difficulty && (
        <InterviewPreview
          onBack={() => setShowPreview(false)}
          onConfirm={() => setShowPreview(false)}
          onCreate={(newInterview) => {
            onCreate(newInterview); // call parent
            onFinish(); // close form overlay
          }}
          data={{
            title,
            role,
            description,
            topics,
            difficulty,
            numberOfQuestion,
            questions,
            mode,
            visibility,
          }}
        />
      )}
    </div>
  );
}
