"use client";

import Image from "next/image";
import { CheckCircle } from "lucide-react";
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

          {/* Right — results screenshot */}
          <FadeIn direction="left" delay={100}>
            <div className="rounded-[22px] border border-border overflow-hidden shadow-lg">
              <div className="h-8 bg-foreground border-b border-border flex items-center px-4 gap-2">
                <div className="h-3 w-3 rounded-full bg-error/50" />
                <div className="h-3 w-3 rounded-full bg-warning/50" />
                <div className="h-3 w-3 rounded-full bg-success/50" />
              </div>
              <div className="relative">
                <Image
                  src={isDark ? "/landing/screenshots/result-feedback-dark.png" : "/landing/screenshots/result-feedback.png"}
                  alt="Results & Feedback"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                <div className="absolute bottom-1.5 left-1.5">
                  <Image
                    src={isDark ? "/logo-dark.png" : "/logo.png"}
                    alt="Prepmate"
                    width={72}
                    height={18}
                    className="object-contain opacity-80"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
