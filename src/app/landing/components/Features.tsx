"use client";

import Image from "next/image";
import { Mic, Brain, BarChart3, Trophy, Users, Target } from "lucide-react";
import { FadeIn } from "./FadeIn";

const features = [
  {
    icon: Mic,
    title: "Voice-first interview practice",
    desc: "Speak your answers naturally. Our AI interviewer Alex listens, responds, and asks intelligent follow-up questions — just like a real interviewer.",
  },
  {
    icon: Brain,
    title: "AI-powered question generation",
    desc: "Generate tailored interview questions for any role and industry in seconds, with ideal answers and scoring keywords included.",
  },
  {
    icon: BarChart3,
    title: "Detailed score breakdown",
    desc: "Every answer is scored semantically by AI. See exactly what you got right, what was missing, and how your final score was calculated.",
  },
  {
    icon: Trophy,
    title: "XP, levels & badges",
    desc: "Stay motivated with a gamified experience. Earn XP for every interview, level up, and unlock badges as you improve.",
  },
  {
    icon: Users,
    title: "Challenge your friends",
    desc: "Send interview challenges to friends and compete on the same interview. Who scores higher? Find out on the leaderboard.",
  },
  {
    icon: Target,
    title: "Explore community interviews",
    desc: "Browse and attempt interviews created by the community across dozens of roles, or keep your practice sessions private.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 px-5 overflow-hidden">
      <div className="absolute top-10 left-4 hidden lg:block pointer-events-none opacity-50">
        <FadeIn delay={300} direction="none">
          <div
            style={{ animation: "floatUpL 4s ease-in-out 1s infinite both" }}
          >
            <Image
              src="/landing/prop3.png"
              alt=""
              width={70}
              height={70}
              className="-rotate-12"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </FadeIn>
      </div>

      <div className="absolute bottom-8 right-4 hidden lg:block pointer-events-none opacity-50">
        <FadeIn delay={400} direction="none">
          <div
            style={{ animation: "floatUp 3.5s ease-in-out 0.8s infinite both" }}
          >
            <Image
              src="/landing/prop1.png"
              alt=""
              width={75}
              height={75}
              className="rotate-12"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </FadeIn>
      </div>

      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Everything you need to{" "}
              <span className="text-accent">prepare smarter</span>
            </h2>
            <p className="text-secondary max-w-xl mx-auto text-sm md:text-base">
              From AI-generated questions to real-time voice coaching and
              detailed feedback — Prepmate covers the full interview prep
              journey.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 70} direction="up">
              <div className="bg-foreground border border-border rounded-[20px] p-6 hover:border-accent/40 transition-colors group h-full">
                <div className="h-10 w-10 rounded-[12px] bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <f.icon size={20} className="text-accent" />
                </div>
                <h3 className="text-base font-semibold text-primary mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
