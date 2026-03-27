"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Mic,
  Brain,
  Trophy,
  Users,
  BarChart3,
  Zap,
  CheckCircle,
  Star,
  Menu,
  X,
  Sparkles,
  Target,
  MessageSquare,
  Shield,
} from "lucide-react";

// ── Scroll animation primitive ─────────────────────────────────
type Direction = "up" | "down" | "left" | "right" | "none";

function FadeIn({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hiddenTransforms: Record<Direction, string> = {
    up: "translateY(28px)",
    down: "translateY(-28px)",
    left: "translateX(-28px)",
    right: "translateX(28px)",
    none: "none",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : hiddenTransforms[direction],
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Benefits", href: "#benefits" },
    { label: "Screenshots", href: "#screenshots" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-foreground/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Prepmate"
            width={130}
            height={32}
            className="object-contain"
            style={{ imageRendering: "pixelated" }}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" className="px-5">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="px-5">Get started free</Button>
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden text-secondary hover:text-primary"
          onClick={() => setOpen((p) => !p)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-foreground px-5 py-4 flex flex-col gap-3">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm text-secondary hover:text-primary py-1"
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 mt-2">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="w-full">Get started free</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-24 px-5">
      {/* Float keyframes */}
      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-16px) rotate(2deg); }
        }
        @keyframes floatUpL {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-12px) rotate(-3deg); }
        }
        @keyframes floatBob {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          40%       { transform: translateY(-10px) rotate(1.5deg); }
          75%       { transform: translateY(-5px) rotate(-1deg); }
        }
        @keyframes floatSway {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-18px) rotate(-4deg); }
        }
        @keyframes floatWiggle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-8px) rotate(3deg); }
          66%       { transform: translateY(-14px) rotate(-2deg); }
        }
      `}</style>

      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-accent/8 rounded-full blur-3xl" />
      </div>

      {/* ── Scattered props ── */}

      {/* prop3 — puzzle, top-left */}
      <div className="absolute top-10 left-[3%] hidden lg:block pointer-events-none">
        <FadeIn delay={500} direction="none">
          <div style={{ animation: "floatUpL 3.8s ease-in-out 1.2s infinite both" }}>
            <Image
              src="/landing/prop3.png"
              alt=""
              width={95}
              height={95}
              className="opacity-90 -rotate-12"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </FadeIn>
      </div>

      {/* prop1 — rocket, top-right */}
      <div className="absolute top-8 right-[3%] hidden lg:block pointer-events-none">
        <FadeIn delay={600} direction="none">
          <div style={{ animation: "floatUp 3.2s ease-in-out 1.3s infinite both" }}>
            <Image
              src="/landing/prop1.png"
              alt=""
              width={115}
              height={115}
              className="opacity-90 rotate-12"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </FadeIn>
      </div>

      {/* prop5 — slingshot, mid-left */}
      <div className="absolute top-[42%] left-[1.5%] hidden xl:block pointer-events-none">
        <FadeIn delay={700} direction="none">
          <div style={{ animation: "floatWiggle 2.9s ease-in-out 1.4s infinite both" }}>
            <Image
              src="/landing/prop5.png"
              alt=""
              width={85}
              height={85}
              className="opacity-85 rotate-6"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </FadeIn>
      </div>

      {/* prop2 — clipboard, bottom-left */}
      <div className="absolute bottom-36 left-[4%] hidden md:block pointer-events-none">
        <FadeIn delay={650} direction="none">
          <div style={{ animation: "floatBob 4.3s ease-in-out 1.3s infinite both" }}>
            <Image
              src="/landing/prop2.png"
              alt=""
              width={105}
              height={105}
              className="opacity-90 -rotate-6"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </FadeIn>
      </div>

      {/* prop4 — paper plane + target, bottom-right */}
      <div className="absolute bottom-28 right-[2%] hidden md:block pointer-events-none">
        <FadeIn delay={750} direction="none">
          <div style={{ animation: "floatSway 5s ease-in-out 1.5s infinite both" }}>
            <Image
              src="/landing/prop4.png"
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

        {/* Hero screenshot placeholder */}
        <FadeIn delay={360}>
          <div className="mt-16 mx-auto max-w-5xl rounded-[22px] border-2 border-border overflow-hidden shadow-2xl bg-foreground">
            <div className="h-8 bg-background border-b border-border flex items-center px-4 gap-2">
              <div className="h-3 w-3 rounded-full bg-error/50" />
              <div className="h-3 w-3 rounded-full bg-warning/50" />
              <div className="h-3 w-3 rounded-full bg-success/50" />
              <div className="flex-1 mx-4 h-5 bg-border rounded-full" />
            </div>
            {/* Replace with actual screenshot */}
            <div className="aspect-[16/9] bg-background flex flex-col items-center justify-center gap-3 text-tertiary">
              <div className="h-16 w-16 rounded-[16px] bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Zap size={28} className="text-accent" />
              </div>
              <p className="text-sm font-medium text-secondary">
                Dashboard screenshot
              </p>
              <p className="text-xs">Replace with your app screenshot</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { value: "26+", label: "Industries covered" },
    { value: "100+", label: "Job roles" },
    { value: "3", label: "Interview types" },
    { value: "AI", label: "Powered feedback" },
  ];

  return (
    <section className="border-y border-border bg-foreground">
      <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <FadeIn key={s.label} delay={i * 90} direction="up">
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">{s.value}</p>
              <p className="text-sm text-secondary mt-1">{s.label}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────
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

function Features() {
  return (
    <section id="features" className="py-24 px-5">
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
              detailed feedback — Prepmate covers the full interview prep journey.
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
                <p className="text-sm text-secondary leading-relaxed">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────
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
    desc: "Speak or type your answers to Alex, your AI interviewer. He reacts naturally, gives hints when you're stuck, and asks follow-ups.",
  },
  {
    num: "04",
    icon: BarChart3,
    title: "Review your results",
    desc: "Get a full breakdown of every answer — what you nailed, what was missing, your score per question, and XP earned.",
  },
];

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 px-5 bg-foreground border-y border-border"
    >
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

// ── Benefits ──────────────────────────────────────────────────
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

function Benefits() {
  return (
    <section id="benefits" className="py-24 px-5">
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

// ── Screenshots ───────────────────────────────────────────────
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

function Screenshots() {
  return (
    <section
      id="screenshots"
      className="py-24 px-5 bg-foreground border-y border-border"
    >
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

// ── Testimonials ──────────────────────────────────────────────
const testimonials = [
  {
    name: "Sarah K.",
    role: "Frontend Engineer",
    text: "I used Prepmate for two weeks before my Google interview. The AI feedback was incredibly specific — it told me exactly what concepts I was missing.",
    stars: 5,
  },
  {
    name: "James O.",
    role: "Data Scientist",
    text: "The voice interview mode is a game changer. Being able to practice speaking out loud and get real-time reactions made me way more confident.",
    stars: 5,
  },
  {
    name: "Priya M.",
    role: "Product Manager",
    text: "I love that it works for behavioral interviews too. The gamification keeps me coming back every day — already level 8!",
    stars: 5,
  },
];

function Testimonials() {
  return (
    <section className="py-24 px-5">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Loved by candidates <span className="text-accent">worldwide</span>
            </h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 120} direction="up">
              <div className="bg-foreground border border-border rounded-[20px] p-6 flex flex-col gap-4 h-full">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className="text-warning fill-warning"
                    />
                  ))}
                </div>
                <p className="text-sm text-secondary leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-auto">
                  <p className="text-sm font-semibold text-primary">{t.name}</p>
                  <p className="text-xs text-tertiary">{t.role}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-24 px-5 bg-foreground border-y border-border">
      <div className="max-w-2xl mx-auto text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <MessageSquare size={12} />
            Start your first interview in 60 seconds
          </div>
        </FadeIn>
        <FadeIn delay={80}>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-5">
            Ready to land your{" "}
            <span className="text-accent">dream job?</span>
          </h2>
        </FadeIn>
        <FadeIn delay={160}>
          <p className="text-secondary text-sm md:text-base mb-8 leading-relaxed">
            Join thousands of candidates using Prepmate to prepare smarter.
            Create your free account and start your first AI interview today.
          </p>
        </FadeIn>
        <FadeIn delay={240}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button className="px-10 h-12 text-base gap-2">
                Create free account <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="px-10 h-12 text-base">
                Log in
              </Button>
            </Link>
          </div>
          <p className="text-xs text-tertiary mt-4">
            Free to use · No credit card needed
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-12 px-5 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3">
              <Image
                src="/logo.png"
                alt="Prepmate"
                width={110}
                height={28}
                className="object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <p className="text-xs text-tertiary leading-relaxed">
              AI-powered interview practice for every industry and role.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Product
            </p>
            <ul className="flex flex-col gap-2">
              {["Features", "How it works", "Screenshots", "Pricing"].map(
                (l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-xs text-tertiary hover:text-primary transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Company
            </p>
            <ul className="flex flex-col gap-2">
              {["About", "Blog", "Careers", "Contact"].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-xs text-tertiary hover:text-primary transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Legal
            </p>
            <ul className="flex flex-col gap-2">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-xs text-tertiary hover:text-primary transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-tertiary">
            © {new Date().getFullYear()} Prepmate. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-tertiary">
            <Shield size={12} />
            <span>Your data is private and secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-primary">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Benefits />
        <Screenshots />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
