"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import HelpForm from "./HelpForm";

const HelpCenterPage = () => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 👇 Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenQuestion(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const faqs = [
    {
      id: 1,
      question: "How does PREPMATE evaluate my interview performance?",
      answer: `PREPMATE uses AI-powered natural language processing to analyze your answers. It evaluates communication clarity, technical accuracy, confidence level, and response structure. After each interview, you receive a detailed score breakdown and improvement suggestions.`,
    },
    {
      id: 2,
      question: "Is the AI interviewer the same as a real human interviewer?",
      answer: `The AI is designed to simulate real-world interview scenarios. While it’s not a human recruiter, it mimics professional questioning patterns and provides realistic follow-up questions based on your answers.`,
    },
    {
      id: 3,
      question: "Are my interview recordings saved?",
      answer: `Your recordings are securely stored as transcripts. PREPMATE follows strict data privacy practices and does not share your data with third parties.`,
    },
    {
      id: 4,
      question: "Can I practice different job roles?",
      answer: `Yes. You can select different roles such as Software Engineer, UI/UX Designer, Data Analyst, and more.`,
    },
    {
      id: 5,
      question: "Can I retake an interview?",
      answer: `Absolutely. You can retake any interview to track your improvement over time.`,
    },
    {
      id: 6,
      question: "How is my score calculated?",
      answer: `Scores are calculated using AI models that assess answer relevance, communication clarity, confidence, and technical accuracy.`,
    },
    {
      id: 7,
      question: "What happens if I exit an interview midway?",
      answer: `If you exit early, the interview is marked incomplete. You can restart anytime.`,
    },
    {
      id: 8,
      question: "Is PREPMATE suitable for beginners?",
      answer: `Yes. PREPMATE supports beginner to advanced levels.`,
    },
    {
      id: 9,
      question: "How do I reset my password?",
      answer: `Click 'Forgot Password' on login and follow the instructions.`,
    },
    {
      id: 10,
      question: "How can I delete my account?",
      answer: `Go to settings and click 'Delete Account' and confirm.`,
    },
  ];

  return (
    <div ref={containerRef} className="p-5">
      <h4 className="font-semibold mb-3">Frequently Asked Questions</h4>

      {faqs.map((faq, index) => (
        <div key={faq.id} className="">
          <div
            onClick={() =>
              setOpenQuestion(openQuestion === faq.id ? null : faq.id)
            }
            className={`flex items-center justify-between border border-border py-2 px-5 cursor-pointer text-secondary hover:text-accent transition
          ${index === 0 ? "rounded-t-[12px]" : ""}
          ${index === faqs.length - 1 && openQuestion !== faq.id ? "rounded-b-[12px]" : ""}
        `}
          >
            <p className="text-sm">{faq.question}</p>
            {openQuestion === faq.id ? <ChevronUp /> : <ChevronDown />}
          </div>

          {openQuestion === faq.id && (
            <div
              className={`border border-border py-2 px-5 pr-10 text-sm
            ${index === faqs.length - 1 ? "rounded-b-[12px]" : ""}
          `}
            >
              <p>{faq.answer}</p>
            </div>
          )}
        </div>
      ))}

      <div className="mt-10">
        <HelpForm />
      </div>
    </div>
  );
};

export default HelpCenterPage;
