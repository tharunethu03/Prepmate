"use client";

import Image from "next/image";
import { Mic, Sparkles, BarChart3, Trophy } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { useDarkMode } from "./useDarkMode";

const screenshots = [
  {
    label: "Interview session",
    desc: "Live voice interview with Alex",
    icon: Mic,
    color: "text-accent",
    bg: "bg-accent/10 border-accent/20",
  },
  {
    label: "Create an interview",
    desc: "AI generates questions instantly",
    icon: Sparkles,
    color: "text-warning",
    bg: "bg-warning/10 border-warning/20",
  },
  {
    label: "Results & feedback",
    desc: "Per-question score breakdown",
    icon: BarChart3,
    color: "text-success",
    bg: "bg-success/10 border-success/20",
  },
  {
    label: "Leaderboard",
    desc: "Compete with friends",
    icon: Trophy,
    color: "text-error",
    bg: "bg-error/10 border-error/20",
  },
];

export function Screenshots() {
  const isDark = useDarkMode();
  return (
    <section
      id="screenshots"
      className="relative py-24 px-5 bg-foreground border-y border-border overflow-hidden"
    >
      {/* prop1 — rocket, top-left */}
      <div className="absolute top-8 left-5 hidden md:block pointer-events-none opacity-45">
        <FadeIn delay={250} direction="none">
          <div style={{ animation: "floatUp 3.8s ease-in-out 1s infinite both" }}>
            <Image src={isDark ? "/landing/prop1-dark.png" : "/landing/prop1.png"} alt="" width={68} height={68} className="-rotate-6" style={{ imageRendering: "auto" }} />
          </div>
        </FadeIn>
      </div>
      {/* prop5 — slingshot, bottom-right */}
      <div className="absolute bottom-8 right-5 hidden md:block pointer-events-none opacity-45">
        <FadeIn delay={400} direction="none">
          <div style={{ animation: "floatWiggle 3s ease-in-out 0.8s infinite both" }}>
            <Image src={isDark ? "/landing/prop5-dark.png" : "/landing/prop5.png"} alt="" width={60} height={60} className="rotate-12" style={{ imageRendering: "auto" }} />
          </div>
        </FadeIn>
      </div>
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
              Screenshots
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              See Prepmate <span className="text-accent">in action</span>
            </h2>
            <p className="text-secondary text-sm max-w-lg mx-auto">
              A clean, focused interface designed to keep you in the zone during
              practice.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-5">
          {screenshots.map((s, i) => (
            <FadeIn key={s.label} delay={i * 90} direction="up">
              <div className="rounded-[20px] border border-border bg-background overflow-hidden">
                <div className="aspect-[16/9] flex flex-col items-center justify-center gap-3">
                  <div
                    className={`h-14 w-14 rounded-[14px] border flex items-center justify-center ${s.bg}`}
                  >
                    <s.icon size={26} className={s.color} />
                  </div>
                  <p className={`text-sm font-semibold ${s.color}`}>{s.label}</p>
                  <p className="text-xs text-tertiary">{s.desc}</p>
                  <p className="text-[11px] text-muted border border-border rounded-full px-3 py-1 mt-1">
                    Replace with screenshot
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
