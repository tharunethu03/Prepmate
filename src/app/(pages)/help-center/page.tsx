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

  return (
    <div ref={containerRef} className="p-5">
      <h4 className="font-semibold">Frequently Asked Questions</h4>

      {/* Question 1 */}
      <div className="mt-3">
        <div
          onClick={() => setOpenQuestion(openQuestion === 1 ? null : 1)}
          className="flex items-center justify-between border border-border py-2 px-5 rounded-t-[12px] cursor-pointer text-secondary hover:text-accent transition"
        >
          <p className="text-sm">
            How does PREPMATE evaluate my interview performance?
          </p>
          {openQuestion === 1 ? <ChevronUp /> : <ChevronDown />}
        </div>

        {openQuestion === 1 && (
          <div className="border border-border py-2 px-5 text-sm">
            <p>
              PREPMATE uses AI-powered natural language processing to analyze
              your answers. It evaluates communication clarity, technical
              accuracy, confidence level, and response structure. After each
              interview, you receive a detailed score breakdown and improvement
              suggestions.
            </p>
          </div>
        )}
      </div>

      {/* Question 2 */}
      <div>
        <div
          onClick={() => setOpenQuestion(openQuestion === 2 ? null : 2)}
          className="flex items-center justify-between border border-border py-2 px-5  cursor-pointer text-secondary hover:text-accent transition ${openQuestion !== 2 "
        >
          <p className="text-sm">
            Is the AI interviewer the same as a real human interviewer?
          </p>
          {openQuestion === 2 ? <ChevronUp /> : <ChevronDown />}
        </div>

        {openQuestion === 2 && (
          <div className="border border-border  py-2 px-5 text-sm">
            <p>
              The AI is designed to simulate real-world interview scenarios.
              While it’s not a human recruiter, it mimics professional
              questioning patterns and provides realistic follow-up questions
              based on your answers.
            </p>
          </div>
        )}
      </div>

      {/* Question 3 */}
      <div>
        <div
          onClick={() => setOpenQuestion(openQuestion === 3 ? null : 3)}
          className="flex items-center justify-between border border-border py-2 px-5  cursor-pointer text-secondary hover:text-accent transition "
        >
          <p className="text-sm">Are my interview recordings saved?</p>
          {openQuestion === 3 ? <ChevronUp /> : <ChevronDown />}
        </div>

        {openQuestion === 3 && (
          <div className="border border-border  py-2 px-5 text-sm">
            <p>
              Your recordings are securely stored as transcripts. PREPMATE
              follows strict data privacy practices and does not share your data
              with third parties.
            </p>
          </div>
        )}
      </div>

      {/* Question 4 */}
      <div>
        <div
          onClick={() => setOpenQuestion(openQuestion === 4 ? null : 4)}
          className="flex items-center justify-between border border-border py-2 px-5  cursor-pointer text-secondary hover:text-accent transition "
        >
          <p className="text-sm">Can I practice different job roles?</p>
          {openQuestion === 4 ? <ChevronUp /> : <ChevronDown />}
        </div>

        {openQuestion === 4 && (
          <div className="border border-border  py-2 px-5 text-sm">
            <p>
              Yes. You can select different roles such as Software Engineer,
              UI/UX Designer, Data Analyst, and more. Each role has tailored
              questions based on industry standards.
            </p>
          </div>
        )}
      </div>

      {/* Question 5 */}
      <div>
        <div
          onClick={() => setOpenQuestion(openQuestion === 5 ? null : 5)}
          className="flex items-center justify-between border border-border py-2 px-5  cursor-pointer text-secondary hover:text-accent transition "
        >
          <p className="text-sm">Can I retake an interview?</p>
          {openQuestion === 5 ? <ChevronUp /> : <ChevronDown />}
        </div>

        {openQuestion === 5 && (
          <div className="border border-border  py-2 px-5 text-sm">
            <p>
              Absolutely. You can retake any interview to track your improvement
              over time. Your previous attempts will remain saved for
              comparison.
            </p>
          </div>
        )}
      </div>

      {/* Question 6 */}
      <div>
        <div
          onClick={() => setOpenQuestion(openQuestion === 6 ? null : 6)}
          className="flex items-center justify-between border border-border py-2 px-5  cursor-pointer text-secondary hover:text-accent transition "
        >
          <p className="text-sm">How is my score calculated?</p>
          {openQuestion === 6 ? <ChevronUp /> : <ChevronDown />}
        </div>

        {openQuestion === 6 && (
          <div className="border border-border  py-2 px-5 text-sm">
            <p>Scores are calculated using AI models that assess:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Answer relevance</li>
              <li>Communication clarity</li>
              <li>Confidence indicators</li>
              <li>Technical accuracy</li>
            </ul>
            <p className="mt-2">
              Each category is scored separately and combined into an overall
              performance score.
            </p>
          </div>
        )}
      </div>

      {/* Question 7 */}
      <div>
        <div
          onClick={() => setOpenQuestion(openQuestion === 7 ? null : 7)}
          className="flex items-center justify-between border border-border py-2 px-5  cursor-pointer text-secondary hover:text-accent transition "
        >
          <p className="text-sm">What happens if I exit an interview midway?</p>
          {openQuestion === 7 ? <ChevronUp /> : <ChevronDown />}
        </div>

        {openQuestion === 7 && (
          <div className="border border-border  py-2 px-5 text-sm">
            <p>
              If you exit before completing the session, your interview will be
              marked as incomplete. You can restart it anytime, but partial
              responses may not be evaluated fully.
            </p>
          </div>
        )}
      </div>

      {/* Question 8 */}
      <div>
        <div
          onClick={() => setOpenQuestion(openQuestion === 8 ? null : 8)}
          className="flex items-center justify-between border border-border py-2 px-5  cursor-pointer text-secondary hover:text-accent transition "
        >
          <p className="text-sm">Is PREPMATE suitable for beginners?</p>
          {openQuestion === 8 ? <ChevronUp /> : <ChevronDown />}
        </div>

        {openQuestion === 8 && (
          <div className="border border-border  py-2 px-5 text-sm">
            <p>
              Yes. PREPMATE offers beginner, intermediate, and advanced
              difficulty levels so you can practice according to your experience
              level.
            </p>
          </div>
        )}
      </div>

      {/* Question 9 */}
      <div>
        <div
          onClick={() => setOpenQuestion(openQuestion === 9 ? null : 9)}
          className="flex items-center justify-between border border-border py-2 px-5  cursor-pointer text-secondary hover:text-accent transition "
        >
          <p className="text-sm">How do I reset my password?</p>
          {openQuestion === 9 ? <ChevronUp /> : <ChevronDown />}
        </div>

        {openQuestion === 9 && (
          <div className="border border-border  py-2 px-5 text-sm">
            <p>
              To reset your password, go to the login page or settings and click
              on the
              <span className="font-semibold"> Forgot Password</span> link. You
              will be prompted to enter your email address and receive a reset
              link.
            </p>
          </div>
        )}
      </div>

      {/* Question 10 */}
      <div>
        <div
          onClick={() => setOpenQuestion(openQuestion === 10 ? null : 10)}
          className={`flex items-center justify-between border border-border py-2 px-5  cursor-pointer text-secondary hover:text-accent transition ${openQuestion !== 10 ? "rounded-b-[12px]" : ""}`}
        >
          <p className="text-sm">How can I delete my account?</p>
          {openQuestion === 10 ? <ChevronUp /> : <ChevronDown />}
        </div>

        {openQuestion === 10 && (
          <div className="border border-border rounded-b-[12px] py-2 px-5 text-sm">
            <p>
              To delete your account, go to settings and click on the
              <span className="font-semibold"> Delete Account</span> button. You
              will be prompted to confirm the action.
            </p>
          </div>
        )}
      </div>

      
    </div>
  );
};

export default HelpCenterPage;
