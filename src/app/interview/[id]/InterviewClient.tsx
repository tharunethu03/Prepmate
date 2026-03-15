"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Interview } from "@/app/types/interview";
import CameraComponent from "@/components/ui/camera";
import { useSession } from "next-auth/react";
import Agent from "@/components/ui/Agent";
import { Keyboard, Mic, MicOff } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

type InterviewClientProps = { interview: Interview };
type QuestionResponse = { questionId: string; userAnswer: string };
type Message = { role: "user" | "assistant"; content: string };
type Phase = "answering" | "confirming";

export default function InterviewClient({ interview }: InterviewClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("challengeId");
  const { data: session } = useSession();

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    xpEarned: number;
  } | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [aiMessage, setAiMessage] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [phase, setPhase] = useState<Phase>("answering");

  // ── Refs ────────────────────────────────────────────────────
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentIndexRef = useRef(0);
  const responsesRef = useRef<QuestionResponse[]>([]);
  const attemptIdRef = useRef<string | null>(null);
  const currentAnswerRef = useRef("");
  const historyRef = useRef<Message[]>([]);
  const phaseRef = useRef<Phase>("answering");

  // ── Ref sync helpers ────────────────────────────────────────
  const updateCurrentIndex = (idx: number) => {
    currentIndexRef.current = idx;
    setCurrentIndex(idx);
  };
  const updateResponses = (r: QuestionResponse[]) => {
    responsesRef.current = r;
    setResponses(r);
  };
  const updateHistory = (h: Message[]) => {
    historyRef.current = h;
    setHistory(h);
  };
  const updateAttemptId = (id: string) => {
    attemptIdRef.current = id;
    setAttemptId(id);
  };
  const updateCurrentAnswer = (a: string) => {
    currentAnswerRef.current = a;
    setCurrentAnswer(a);
  };
  const updatePhase = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const isLastQuestion = currentIndex === interview.questions.length - 1;

  // ── Preload voices ──────────────────────────────────────────
  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () =>
      window.speechSynthesis.getVoices();
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // ── Navigation guards ───────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!allowNavigation) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [allowNavigation]);

  useEffect(() => {
    const handlePopState = () => {
      if (!allowNavigation) {
        window.history.pushState(null, "", window.location.href);
        setShowExitModal(true);
      }
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [allowNavigation]);

  // ── TTS ─────────────────────────────────────────────────────
  const speak = (text: string, onDone?: () => void) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.name.includes("Google US English") ||
        v.name.includes("Samantha") ||
        v.name.includes("Daniel"),
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onDone?.();
    };
    window.speechSynthesis.speak(utterance);
  };

  // ── Speech recognition ──────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      updateCurrentAnswer(transcript);
    };

    recognition.onerror = (event: Event) => {
      const err = (event as Event & { error: string }).error;
      if (err === "no-speech" || err === "aborted") return;
      if (err === "not-allowed") {
        alert("Microphone access denied. Allow it in browser settings.");
        setIsListening(false);
        return;
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  };

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmitAuto = async (finalResponses: QuestionResponse[]) => {
    const id = attemptIdRef.current;
    if (!id) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/attempts/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: finalResponses }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to submit");
      }
      const data = await res.json();
      setResult({ score: data.score, xpEarned: data.xpEarned });
      setAllowNavigation(true);
      setSubmitted(true);
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Ask ready to move on ────────────────────────────────────
  const askReadyToMoveOn = (isLast: boolean) => {
    const msg = isLast
      ? "Are you ready to submit the interview?"
      : "Are you ready to move on to the next question?";
    setAiMessage(msg);
    updatePhase("confirming");
    updateCurrentAnswer("");
    speak(msg, () => startListening());
  };

  // ── Move to next question ───────────────────────────────────
  const moveToNext = (idx: number) => {
    const nextQ = interview.questions[idx];
    const msg = `Here's question ${idx + 1}: ${nextQ.question}`;
    setAiMessage(msg);
    updatePhase("answering");
    updateCurrentAnswer("");
    speak(msg, () => startListening());
  };

  // ── Evaluate answer with AI ─────────────────────────────────
  const evaluateAnswer = async (answer: string) => {
    setAiThinking(true);
    stopListening();

    const idx = currentIndexRef.current;
    const currentQ = interview.questions[idx];
    const isLast = idx === interview.questions.length - 1;

    const newHistory: Message[] = [
      ...historyRef.current,
      { role: "user", content: answer },
    ];

    try {
      const res = await fetch("/api/interviews/converse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "evaluate",
          userMessage: answer,
          currentQuestionIndex: idx,
          questions: interview.questions.map((q) => ({
            id: q.id,
            question: q.question,
          })),
          history: historyRef.current,
          userName: session?.user?.name ?? "there",
          role: interview.role,
          difficulty: interview.difficulty,
          interviewType: interview.interviewType ?? "mixed",
        }),
      });

      const data: { message: string; action: "ready" | "hint" | "explain" } =
        await res.json();

      const updatedHistory: Message[] = [
        ...newHistory,
        { role: "assistant", content: data.message },
      ];
      updateHistory(updatedHistory);
      setAiMessage(data.message);

      if (data.action === "ready") {
        // Save answer and ask to move on
        const newResponses = [
          ...responsesRef.current,
          { questionId: currentQ.id, userAnswer: answer },
        ];
        updateResponses(newResponses);
        speak(data.message, () => askReadyToMoveOn(isLast));
      } else if (data.action === "explain") {
        // Save answer (they don't know it), ask to move on after explaining
        const newResponses = [
          ...responsesRef.current,
          { questionId: currentQ.id, userAnswer: answer || "Did not know" },
        ];
        updateResponses(newResponses);
        speak(data.message, () => askReadyToMoveOn(isLast));
      } else {
        // "hint" — don't save yet, stay on same question
        speak(data.message, () => {
          updateCurrentAnswer("");
          startListening();
        });
      }
    } catch {
      // Fallback — save and move on
      const newResponses = [
        ...responsesRef.current,
        { questionId: currentQ.id, userAnswer: answer || "No answer" },
      ];
      updateResponses(newResponses);
      askReadyToMoveOn(isLast);
    } finally {
      setAiThinking(false);
      updateCurrentAnswer("");
    }
  };

  // ── Check if user is ready ──────────────────────────────────
  const checkReady = async (userSaid: string) => {
    stopListening();

    const msg = userSaid.toLowerCase();
    const notReady = [
      "no",
      "not yet",
      "wait",
      "hold on",
      "nope",
      "actually",
      "one sec",
    ].some((w) => msg.includes(w));

    if (notReady) {
      const idx = currentIndexRef.current;
      const isLast = idx === interview.questions.length - 1;
      const currentQ = interview.questions[idx];

      // Remove the last saved response so they can re-answer
      const withoutLast = responsesRef.current.filter(
        (r) => r.questionId !== currentQ.id,
      );
      updateResponses(withoutLast);

      const reply = isLast
        ? `No problem. Let's revisit the question: ${currentQ.question}`
        : `Of course, take your time. Feel free to add anything about the current question.`;

      setAiMessage(reply);
      updatePhase("answering");
      updateCurrentAnswer("");
      speak(reply, () => startListening());
    } else {
      const idx = currentIndexRef.current;
      const isLast = idx === interview.questions.length - 1;

      if (isLast) {
        const closing =
          "Excellent! Let me calculate your score now. That’s all for this interview. Thanks for taking the time to participate!";
        setAiMessage(closing);
        speak(closing, () => handleSubmitAuto(responsesRef.current));
      } else {
        updateCurrentIndex(idx + 1);
        moveToNext(idx + 1);
      }
      updateCurrentAnswer("");
    }
  };

  // ── Main handler: Done Speaking button ──────────────────────
  const handleDone = () => {
    const answer = currentAnswerRef.current.trim();
    if (!answer) return;

    if (phaseRef.current === "confirming") {
      checkReady(answer);
    } else {
      evaluateAnswer(answer);
    }
  };

  // ── Text mode send ──────────────────────────────────────────
  const handleTextSend = () => {
    const answer = currentAnswerRef.current.trim();
    if (!answer) return;

    if (phaseRef.current === "confirming") {
      checkReady(answer);
    } else {
      evaluateAnswer(answer);
    }
  };

  // ── Start ───────────────────────────────────────────────────
  const handleStart = async () => {
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: interview.id,
          ...(challengeId ? { challengeId } : {}),
        }),
      });
      if (!res.ok) throw new Error("Failed to start attempt");
      const attempt = await res.json();
      updateAttemptId(attempt.id);
      setInterviewStarted(true);
      updatePhase("answering");

      const greeting = `Hi ${session?.user?.name ?? "there"}! I'm Alex, your interviewer today. Let's get started. Here's your first question: ${interview.questions[0].question}`;
      setAiMessage(greeting);
      updateHistory([{ role: "assistant", content: greeting }]);
      speak(greeting, () => startListening());
    } catch (err) {
      console.error("Failed to start:", err);
    }
  };

  const handleExitConfirm = () => {
    window.speechSynthesis.cancel();
    stopListening();
    setAllowNavigation(true);
    router.push("/dashboard");
  };

  let color;
  if (interview.difficulty === "beginner") color = "#22c55e";
  else if (interview.difficulty === "intermediate") color = "#facc15";
  else color = "#ef4444";

  // ── Results ─────────────────────────────────────────────────
  if (submitted && result) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 p-10">
        <div className="bg-foreground border border-accent rounded-[22px] p-10 max-w-md w-full flex flex-col items-center gap-5">
          <h2 className="text-2xl font-bold">Interview Complete!</h2>
          <div className="flex flex-col items-center gap-2">
            <p className="text-6xl font-bold text-accent">
              {Math.round(result.score)}%
            </p>
            <p className="text-secondary text-sm">Overall Score</p>
          </div>
          <div className="flex items-center gap-2 bg-warning/20 text-warning px-4 py-2 rounded-[12px]">
            <span className="font-bold">+{result.xpEarned} XP</span>
            <span className="text-sm">earned</span>
          </div>
          <div className="flex flex-col gap-3 w-full mt-3">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/explore-interviews")}
              className="w-full"
            >
              Explore More Interviews
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen gap-5 p-5">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-5 py-5 rounded-[22px] border border-border">
        <div>
          <h2>{interview.title}</h2>
          <div className="flex gap-2 mt-3">
            <div className="flex bg-accent w-fit px-3 py-2 rounded-[12px] gap-1 items-center">
              <span className="text-foreground font-bold text-xs">
                {interview.role}
              </span>
            </div>
            <div
              className="flex border w-fit px-3 py-1 rounded-[12px] gap-1 items-center"
              style={{ borderColor: color }}
            >
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-primary font-bold text-xs">
                {interview.difficulty}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTextMode((prev) => !prev)}
            className="flex items-center gap-2 text-xs text-secondary border border-border rounded-[11px] px-3 py-1.5 hover:text-accent"
          >
            <Keyboard size={14} />
            {textMode ? "Switch to Voice" : "Switch to Text"}
          </button>
          {!interviewStarted ? (
            <Button
              onClick={handleStart}
              className="bg-success hover:bg-success/90 px-6 text-white"
            >
              Start Interview
            </Button>
          ) : (
            <Button
              onClick={() => setShowExitModal(true)}
              className="bg-error hover:bg-error/90 px-6 text-white"
            >
              End Interview
            </Button>
          )}
        </div>
      </div>

      <div className="flex h-dvh w-full gap-5">
        {/* Agent + Camera */}
        <div className="flex flex-col flex-1 rounded-[22px]">
          <div className="border border-border flex-1 min-h-[50px] rounded-t-[22px]">
            <Agent isSpeaking={isSpeaking} />
          </div>
          <div className="border border-border flex-1 min-h-[50px] rounded-b-[22px]">
            <CameraComponent isUserSpeaking={isListening} />
          </div>
        </div>

        {/* Conversation panel */}
        <div className="border border-border flex-1 min-h-[50px] rounded-[22px] p-5 flex flex-col gap-4 overflow-y-auto">
          {!interviewStarted ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-secondary">
              <p className="text-sm text-center max-w-xs">
                Click{" "}
                <span className="text-accent font-semibold">
                  Start Interview
                </span>{" "}
                when you&apos;re ready. Alex will guide you through{" "}
                {interview.questions.length} questions.
              </p>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div className="flex items-center justify-between text-xs text-secondary">
                <span>
                  Question {currentIndex + 1} of {interview.questions.length}
                </span>
                <div className="flex gap-1">
                  {interview.questions.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-6 rounded-full ${
                        i < currentIndex
                          ? "bg-accent"
                          : i === currentIndex
                            ? "bg-accent/50"
                            : "bg-border"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* AI message bubble */}
              {aiMessage && (
                <div className="w-fit max-w-[85%] bg-accent text-foreground px-5 py-3 rounded-b-[12px] rounded-tr-[12px] shadow-lg text-sm">
                  {aiThinking ? (
                    <span className="flex gap-1 items-center text-xs">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce [animation-delay:0.1s]">
                        ●
                      </span>
                      <span className="animate-bounce [animation-delay:0.2s]">
                        ●
                      </span>
                    </span>
                  ) : (
                    aiMessage
                  )}
                </div>
              )}

              {/* Answer area */}
              <div className="flex flex-col gap-2 mt-auto">
                <Textarea
                  placeholder={
                    phase === "confirming"
                      ? textMode
                        ? "Type yes or no..."
                        : "Say yes or no..."
                      : textMode
                        ? "Type your answer here..."
                        : isListening
                          ? "Listening... speak your answer"
                          : isSpeaking
                            ? "Alex is speaking..."
                            : "Waiting..."
                  }
                  value={currentAnswer}
                  onChange={(e) =>
                    textMode ? updateCurrentAnswer(e.target.value) : undefined
                  }
                  readOnly={!textMode}
                  className={`min-h-32 resize-none ${isListening ? "border-accent" : ""}`}
                />

                <div className="flex items-center justify-between">
                  {/* Mic indicator */}
                  {!textMode && (
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-[11px] text-sm font-medium ${
                        isListening
                          ? "bg-error/10 text-error border border-error"
                          : isSpeaking
                            ? "bg-accent/10 text-accent border border-accent"
                            : "bg-border/10 text-secondary border border-border"
                      }`}
                    >
                      {isListening ? (
                        <>
                          <Mic size={16} className="animate-pulse" /> Listening
                        </>
                      ) : isSpeaking ? (
                        <>
                          <MicOff size={16} /> Alex is speaking
                        </>
                      ) : (
                        <>
                          <MicOff size={16} /> Waiting
                        </>
                      )}
                    </div>
                  )}

                  <div className="ml-auto flex gap-2">
                    {/* Text mode */}
                    {textMode && (
                      <Button
                        onClick={handleTextSend}
                        disabled={
                          !currentAnswer.trim() || aiThinking || submitting
                        }
                      >
                        {submitting
                          ? "Submitting..."
                          : phase === "confirming"
                            ? "Confirm →"
                            : "Send Answer →"}
                      </Button>
                    )}

                    {/* Voice mode */}
                    {!textMode && currentAnswer.trim() && !isSpeaking && (
                      <Button
                        onClick={handleDone}
                        disabled={aiThinking || submitting}
                        variant={phase === "confirming" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {submitting
                          ? "Submitting..."
                          : phase === "confirming"
                            ? "Confirm"
                            : "Done Speaking"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Answered list */}
              {responses.length > 0 && (
                <div className="flex flex-col gap-1 border-t border-border pt-3">
                  <p className="text-xs text-tertiary">Answered</p>
                  {responses.map((r, i) => (
                    <div key={i} className="text-xs text-secondary flex gap-2">
                      <span className="text-accent font-semibold shrink-0">
                        Q{i + 1}
                      </span>
                      <span className="truncate">{r.userAnswer}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Exit modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-100">
          <div className="bg-foreground border border-accent rounded-[22px] shadow-lg px-10 py-5">
            <div className="flex flex-col items-center justify-center">
              <h3 className="mb-3">Leaving so soon?</h3>
              <p className="sub-text mb-5 max-w-xs text-center">
                If you leave now your progress won&apos;t be saved.
              </p>
              <div className="flex flex-col gap-3 w-full px-10">
                <Button
                  variant="default"
                  className="px-6 w-full"
                  onClick={() => setShowExitModal(false)}
                >
                  Continue Interview
                </Button>
                <Button
                  variant="outline"
                  className="hover:bg-error px-6 hover:text-white w-full hover:border-error"
                  onClick={handleExitConfirm}
                >
                  End Anyway
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
