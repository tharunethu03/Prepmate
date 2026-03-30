"use client";

import { Bot, ChessPawn, HeartHandshake, Mail } from "lucide-react";
import { Navbar } from "@/app/landing/components/Navbar";
import { Footer } from "@/app/landing/components/Footer";
import { FadeIn } from "@/app/landing/components/FadeIn";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-primary">
      <Navbar />

      <main className="max-w-4xl mx-auto px-5 py-20 flex flex-col gap-16">

        {/* Intro */}
        <FadeIn direction="up">
          <div className="text-center flex flex-col items-center gap-5">
            <p className="text-xs font-semibold text-accent uppercase tracking-widest">
              About us
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
              Built for <span className="text-accent">real preparation</span>
            </h1>
            <p className="text-base text-secondary max-w-2xl leading-relaxed">
              <span className="text-accent font-semibold">PREPMATE</span> is a
              collaborative and gamified AI interview platform designed to help
              learners and professionals sharpen their communication, technical,
              and problem-solving skills through realistic mock interviews. Our
              intelligent interview system provides instant feedback, detailed
              performance breakdowns, and personalised improvement tips — helping
              you gain confidence and master real-world interviews with ease.
            </p>
          </div>
        </FadeIn>

        {/* Mission */}
        <FadeIn direction="up" delay={80}>
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-4">
              Our Mission
            </p>
            <div className="bg-foreground border border-border rounded-[22px] p-8 shadow-sm">
              <p className="text-secondary leading-relaxed">
                To make interview preparation engaging, data-driven, and
                accessible for everyone. Bridge the gap between practice and
                performance using AI-powered insights, gamified challenges, and
                peer collaboration.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* What Makes Prepmate Different */}
        <FadeIn direction="up" delay={120}>
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-6">
              What makes Prepmate different
            </p>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: Bot,
                  title: "AI-Powered Insights",
                  desc: "Instant analysis of communication, confidence, and technical knowledge.",
                },
                {
                  icon: ChessPawn,
                  title: "Gamified Learning",
                  desc: "Earn badges, track levels, and climb leaderboards as you improve.",
                },
                {
                  icon: HeartHandshake,
                  title: "Collaborative Growth",
                  desc: "Connect, share, and learn from others through challenges and feedback.",
                },
              ].map((card, i) => (
                <FadeIn key={card.title} delay={i * 80} direction="up">
                  <div className="bg-foreground border border-border rounded-[22px] p-7 flex flex-col items-center text-center gap-4 hover:border-accent/40 transition-colors h-full">
                    <div className="h-12 w-12 rounded-[14px] bg-accent/10 flex items-center justify-center">
                      <card.icon size={24} className="text-accent" />
                    </div>
                    <h3 className="font-semibold text-primary">{card.title}</h3>
                    <p className="text-sm text-secondary leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Our Story */}
        <FadeIn direction="up" delay={160}>
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-4">
              Our Story
            </p>
            <div className="bg-foreground border border-border rounded-[22px] p-8 shadow-sm">
              <p className="text-secondary leading-relaxed">
                PREPMATE started as a Final Year Project — a vision to transform
                how people prepare for interviews. Our team wanted to build
                something beyond traditional question lists: a platform that
                feels alive, interactive, and truly helpful. What began as a
                student idea quickly evolved into a collaborative, gamified AI
                interview system designed to make preparation engaging and
                measurable. With every feature — from AI feedback to
                leaderboards — we focused on helping users grow through
                experience, not just memorisation. PREPMATE is built by
                learners, for learners, to help everyone face real interviews
                with confidence.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Contact */}
        <FadeIn direction="up" delay={200}>
          <div className="bg-foreground border border-border rounded-[22px] p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-2">
                Get in touch
              </p>
              <p className="text-secondary text-sm leading-relaxed max-w-sm">
                Have suggestions or feedback? We&apos;d love to hear from you!
              </p>
            </div>
            <a
              href="mailto:hello@prepmate.com"
              className="flex items-center gap-2.5 bg-accent/10 border border-accent/20 text-accent text-sm font-medium px-5 py-3 rounded-[12px] hover:bg-accent/20 transition-colors shrink-0"
            >
              <Mail size={15} />
              hello@prepmate.com
            </a>
          </div>
        </FadeIn>

      </main>

      <Footer />
    </div>
  );
}
