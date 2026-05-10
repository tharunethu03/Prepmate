"use client";

import Image from "next/image";
import { CheckCircle, BarChart3 } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { useDarkMode } from "./useDarkMode";

const benefits = [
  "Practice anytime, anywhere — no scheduling needed",
  "Get feedback in real-time, not days later",
  "Covers technical, behavioral, HR, and mixed interviews",
  "Works for 26+ industries from IT to Healthcare to Finance",
  "Earn XP and badges to stay motivated",
  "Challenge friends and see who scores higher",
  "Track your improvement over multiple attempts",
  "AI adapts its tone based on your performance",
];

export function Benefits() {
  const isDark = useDarkMode();
  return (
    <section id="benefits" className="relative py-24 px-5 overflow-hidden">
      {/* prop2 — clipboard, top-right */}
      <div className="absolute top-10 right-5 hidden lg:block pointer-events-none opacity-50">
        <FadeIn delay={350} direction="none">
          <div style={{ animation: "floatBob 4.5s ease-in-out 0.6s infinite both" }}>
            <Image src={isDark ? "/landing/prop2-dark.png" : "/landing/prop2.png"} alt="" width={72} height={72} className="-rotate-6" style={{ imageRendering: "auto" }} />
          </div>
        </FadeIn>
      </div>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <FadeIn direction="right">
            <div>
              <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
                Why Prepmate
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-5">
                The smarter way to{" "}
                <span className="text-accent">prepare for interviews</span>
              </h2>
              <p className="text-secondary text-sm md:text-base leading-relaxed mb-8">
                Most people prepare by reading notes or watching YouTube videos.
                Prepmate gives you hands-on, realistic practice with instant
                AI feedback — so you walk into every interview feeling genuinely
                ready.
              </p>

              <ul className="flex flex-col gap-3">
                {benefits.map((b, i) => (
                  <FadeIn key={b} delay={i * 55} direction="up">
                    <li className="flex items-start gap-3 text-sm">
                      <CheckCircle
                        size={17}
                        className="text-success mt-0.5 shrink-0"
                      />
                      <span className="text-secondary">{b}</span>
                    </li>
                  </FadeIn>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* Right — placeholder screenshot */}
          <FadeIn direction="left" delay={100}>
            <div className="rounded-[22px] border border-border bg-foreground overflow-hidden shadow-lg">
              <div className="h-8 bg-background border-b border-border flex items-center px-4 gap-2">
                <div className="h-3 w-3 rounded-full bg-error/50" />
                <div className="h-3 w-3 rounded-full bg-warning/50" />
                <div className="h-3 w-3 rounded-full bg-success/50" />
              </div>
              <div className="aspect-[4/3] bg-background flex flex-col items-center justify-center gap-3 text-tertiary">
                <div className="h-14 w-14 rounded-[14px] bg-success/10 border border-success/20 flex items-center justify-center">
                  <BarChart3 size={26} className="text-success" />
                </div>
                <p className="text-sm font-medium text-secondary">
                  Results page screenshot
                </p>
                <p className="text-xs">Replace with your app screenshot</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
