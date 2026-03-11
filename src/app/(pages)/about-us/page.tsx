import { Bot, ChessPawn, HeartHandshake } from "lucide-react";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-col gap-5 py-5 px-5">
      <p className="text-sm text-secondary">
        <span className="text-accent font-semibold">PREPMATE</span> is a collaborative and
        gamified AI interview platform designed to help learners and
        professionals sharpen their communication, technical, and
        problem solving skills through realistic mock interviews. Our
        intelligent interview system provides instant feedback, detailed
        performance breakdowns, and personalized improvement tips helping you
        gain confidence and master real-world interviews with ease.
      </p>
      <div>
        <h4 className="text-accent font-bold">Our Mission</h4>
        <p className="text-sm text-secondary mt-3 w-full bg-foreground p-5 rounded-[22px] shadow-lg">
          To make interview preparation engaging, data-driven, and accessible
          for everyone. Bridge the gap between practice and performance using
          AI-powered insights, gamified challenges, and peer collaboration
        </p>
      </div>
      <div>
        <h4 className="text-accent font-bold">What Makes PREPMATE Different</h4>

        <div className="flex flex-col md:flex-row w-full items-center justify-center gap-5 mt-3">
          <div className="flex flex-col items-center bg-foreground p-5 md:w-100  rounded-[22px] shadow-lg">
            <Bot size={30} className="text-accent" />
            <h3 className="text-accent mt-5">AI-Powered Insights</h3>
            <p className="text-secondary text-sm text-center mt-3">
              Instant analysis of communication, confidence, and technical
              knowledge
            </p>
          </div>
          <div className="flex flex-col items-center bg-foreground p-5 md:w-100  rounded-[22px] shadow-lg">
            <ChessPawn size={30} className="text-accent" />
            <h3 className="text-accent mt-5">Gamified Learning</h3>
            <p className="text-secondary text-sm text-center mt-3">
              Earn badges, track levels, and climb leaderboards as you improve.
            </p>
          </div>
          <div className="flex flex-col items-center bg-foreground p-5 md:w-100  rounded-[22px] shadow-lg">
            <HeartHandshake size={30} className="text-accent" />
            <h3 className="text-accent mt-5">Collaborative Growth</h3>
            <p className="text-secondary text-sm text-center mt-3">
              Connect, share, and learn from others through challenges and
              feedback
            </p>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-accent font-bold">Our Story</h4>
        <p className="text-sm  text-secondary mt-3 w-full bg-foreground p-5 rounded-[22px] shadow-lg">
          PREPMATE started as a Final Year Project, a vision to transform how
          people prepare for interviews. Our team wanted to build something
          beyond traditional question lists a platform that feels alive,
          interactive, and truly helpful. What began as a student idea quickly
          evolved into a collaborative, gamified AI interview system designed to
          make preparation engaging and measurable. With every feature, from AI
          feedback to leaderboards, we focused on helping users grow through
          experience, not just memorization. PREPMATE is built by learners, for
          learners to help everyone face real interviews with confidence.
        </p>
      </div>
      <div className="flex items-center gap-5">
        <h4 className="text-accent font-bold">Have suggestions or feedback? We’d love to hear from you!</h4>
        <p className="text-sm text-secondary bg-foreground px-5 py-3 rounded-[12px] shadow-lg">hello@prepmate.com</p>

      </div>
    </div>
  );
};

export default page;
