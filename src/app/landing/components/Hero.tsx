"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { useDarkMode } from "./useDarkMode";

export function Hero() {
  const isDark = useDarkMode();

  return (
    <section className="relative overflow-hidden pt-20 pb-24 px-5">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-accent/8 rounded-full blur-3xl" />
      </div>

      {/* prop3 — top-left */}
      <div className="absolute top-10 left-[3%] hidden lg:block pointer-events-none">
        <FadeIn delay={500} direction="none">
          <div style={{ animation: "floatUpL 3.8s ease-in-out 1.2s infinite both" }}>
            <Image
              src={isDark ? "/landing/prop3-dark.png" : "/landing/prop3.png"}
              alt=""
              width={95}
              height={95}
              className="opacity-90 -rotate-12"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </FadeIn>
      </div>

      {/* prop1 — top-right */}
      <div className="absolute top-8 right-[3%] hidden lg:block pointer-events-none">
        <FadeIn delay={600} direction="none">
          <div style={{ animation: "floatUp 3.2s ease-in-out 1.3s infinite both" }}>
            <Image
              src={isDark ? "/landing/prop1-dark.png" : "/landing/prop1.png"}
              alt=""
              width={115}
              height={115}
              className="opacity-90 rotate-12"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </FadeIn>
      </div>

      {/* prop5 — mid-left */}
      <div className="absolute top-[42%] left-[1.5%] hidden xl:block pointer-events-none">
        <FadeIn delay={700} direction="none">
          <div style={{ animation: "floatWiggle 2.9s ease-in-out 1.4s infinite both" }}>
            <Image
              src={isDark ? "/landing/prop5-dark.png" : "/landing/prop5.png"}
              alt=""
              width={85}
              height={85}
              className="opacity-85 rotate-6"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </FadeIn>
      </div>

      {/* prop2 — bottom-left */}
      <div className="absolute bottom-36 left-[4%] hidden md:block pointer-events-none">
        <FadeIn delay={650} direction="none">
          <div style={{ animation: "floatBob 4.3s ease-in-out 1.3s infinite both" }}>
            <Image
              src={isDark ? "/landing/prop2-dark.png" : "/landing/prop2.png"}
              alt=""
              width={105}
              height={105}
              className="opacity-90 -rotate-6"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </FadeIn>
      </div>

      {/* prop4 — bottom-right */}
      <div className="absolute bottom-28 right-[2%] hidden md:block pointer-events-none">
        <FadeIn delay={750} direction="none">
          <div style={{ animation: "floatSway 5s ease-in-out 1.5s infinite both" }}>
            <Image
              src={isDark ? "/landing/prop4-dark.png" : "/landing/prop4.png"}
              alt=""
              width={160}
              height={100}
              className="opacity-90"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </FadeIn>
      </div>

      <div className="relative max-w-6xl mx-auto text-center z-10">
        {/* Badge */}
        <FadeIn delay={0}>
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Sparkles size={12} />
            AI-Powered Interview Practice
          </div>
        </FadeIn>

        {/* Headline */}
        <FadeIn delay={80}>
          <h1 className="text-4xl md:text-6xl font-bold text-primary leading-tight mb-6">
            Ace your next interview
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, #3c4ffb 0%, #33a3fa 100%)",
              }}
            >
              with AI coaching
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={160}>
          <p className="text-base md:text-lg text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Practice real interview questions with a lifelike AI interviewer,
            get instant feedback on every answer, and track your progress —
            all in one place. Works across 26+ industries.
          </p>
        </FadeIn>

        {/* CTAs */}
        <FadeIn delay={240}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button className="px-8 h-12 text-base gap-2">
                Start practicing free <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="px-8 h-12 text-base">
                Log in
              </Button>
            </Link>
          </div>
          <p className="text-xs text-tertiary mt-4">
            No credit card required · Free to get started
          </p>
        </FadeIn>

        {/* Hero screenshot */}
        <FadeIn delay={360}>
          <div className="mt-16 mx-auto max-w-5xl rounded-[22px] border-2 border-border overflow-hidden shadow-2xl">
            {/* Browser chrome */}
            <div className="h-8 bg-foreground border-b border-border flex items-center px-4 gap-2 shrink-0">
              <div className="h-3 w-3 rounded-full bg-error/50" />
              <div className="h-3 w-3 rounded-full bg-warning/50" />
              <div className="h-3 w-3 rounded-full bg-success/50" />
              <div className="flex-1 mx-4 h-5 bg-border rounded-full" />
            </div>
            <Image
              src={isDark ? "/landing/screenshots/dashboard-dark.png" : "/landing/screenshots/dashboard.png"}
              alt="Prepmate Dashboard"
              width={1280}
              height={720}
              className="w-full h-auto"
              priority
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
