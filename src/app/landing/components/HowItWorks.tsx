"use client";

import Image from "next/image";
import { Target, Sparkles, Mic, BarChart3 } from "lucide-react";
import { FadeIn } from "./FadeIn";

const steps = [
  {
    num: "01",
    icon: Target,
    title: "Pick your role & industry",
    desc: "Choose from 26+ industries and 100+ job roles. Set your difficulty level — beginner, intermediate, or advanced.",
  },
  {
    num: "02",
    icon: Sparkles,
    title: "Generate or browse interviews",
    desc: "Let AI instantly create a tailored interview for your role, or explore interviews published by the community.",
  },
  {
    num: "03",
    icon: Mic,
    title: "Practice with Alex",
    desc: "Speak or type your answers to Alex, your AI interviewer. She reacts naturally, gives hints when you're stuck, and asks follow-ups.",
  },
  {
    num: "04",
    icon: BarChart3,
    title: "Review your results",
    desc: "Get a full breakdown of every answer — what you nailed, what was missing, your score per question, and XP earned.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 px-5 bg-foreground border-y border-border overflow-hidden"
    >
      {/* prop5 — slingshot, bottom-left */}
      <div className="absolute bottom-8 left-4 hidden lg:block pointer-events-none opacity-50">
        <FadeIn delay={300} direction="none">
          <div style={{ animation: "floatWiggle 3.2s ease-in-out 1.2s infinite both" }}>
            <Image src="/landing/prop5.png" alt="" width={65} height={65} className="rotate-6" style={{ imageRendering: "auto" }} />
          </div>
        </FadeIn>
      </div>
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              From zero to interview-ready{" "}
              <span className="text-accent">in minutes</span>
            </h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <FadeIn key={s.num} delay={i * 110} direction="up">
              <div className="relative flex flex-col gap-4">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[calc(100%_-_12px)] w-full h-px bg-border z-0" />
                )}
                <div className="relative z-10 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-[14px] bg-accent text-foreground font-bold text-sm flex items-center justify-center shrink-0">
                      {s.num}
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-primary">
                    {s.title}
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
