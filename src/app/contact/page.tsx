"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Send, Loader2, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/app/landing/components/Navbar";
import { Footer } from "@/app/landing/components/Footer";
import { FadeIn } from "@/app/landing/components/FadeIn";

const faqs = [
  {
    id: 1,
    question: "How does PREPMATE evaluate my interview performance?",
    answer:
      "PREPMATE uses AI-powered natural language processing to analyze your answers. It evaluates communication clarity, technical accuracy, confidence level, and response structure. After each interview, you receive a detailed score breakdown and improvement suggestions.",
  },
  {
    id: 2,
    question: "Is the AI interviewer the same as a real human interviewer?",
    answer:
      "The AI is designed to simulate real-world interview scenarios. While it's not a human recruiter, it mimics professional questioning patterns and provides realistic follow-up questions based on your answers.",
  },
  {
    id: 3,
    question: "Are my interview recordings saved?",
    answer:
      "Your responses are securely stored as transcripts. PREPMATE follows strict data privacy practices and does not share your data with third parties.",
  },
  {
    id: 4,
    question: "Can I practice different job roles?",
    answer:
      "Yes. You can select from 100+ roles across 26+ industries such as Software Engineer, UI/UX Designer, Data Analyst, and many more.",
  },
  {
    id: 5,
    question: "Can I retake an interview?",
    answer:
      "Absolutely. You can retake any interview to track your improvement over time.",
  },
  {
    id: 6,
    question: "How is my score calculated?",
    answer:
      "Scores are calculated using AI models that assess answer relevance, communication clarity, confidence, and technical accuracy. A composite score combines keyword matching (40%) and AI semantic scoring (60%).",
  },
  {
    id: 7,
    question: "What happens if I exit an interview midway?",
    answer:
      "If you exit early, the interview is marked incomplete. You can restart it anytime from your dashboard.",
  },
  {
    id: 8,
    question: "Is PREPMATE suitable for beginners?",
    answer:
      "Yes. PREPMATE supports beginner to advanced levels and adapts the difficulty of questions accordingly.",
  },
  {
    id: 9,
    question: "How do I reset my password?",
    answer:
      "Click 'Forgot Password' on the login page and follow the instructions sent to your email.",
  },
  {
    id: 10,
    question: "How can I delete my account?",
    answer:
      "Go to Settings and click 'Delete Account', then confirm the action.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex flex-col">
      {faqs.map((faq, index) => (
        <div key={faq.id}>
          <button
            onClick={() => setOpen(open === faq.id ? null : faq.id)}
            className={`w-full flex items-center justify-between border border-border px-5 py-3.5 text-left cursor-pointer text-secondary hover:text-accent transition-colors
              ${index === 0 ? "rounded-t-[12px]" : "border-t-0"}
              ${index === faqs.length - 1 && open !== faq.id ? "rounded-b-[12px]" : ""}
            `}
          >
            <p className="text-sm pr-4">{faq.question}</p>
            {open === faq.id ? (
              <ChevronUp size={16} className="shrink-0" />
            ) : (
              <ChevronDown size={16} className="shrink-0" />
            )}
          </button>

          {open === faq.id && (
            <div
              className={`border border-border border-t-0 px-5 py-3.5
                ${index === faqs.length - 1 ? "rounded-b-[12px]" : ""}
              `}
            >
              <p className="text-sm text-secondary leading-relaxed">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const disabled = sending || !form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 overflow-hidden">
      <div className="flex flex-col md:flex-row gap-5 items-center">
        <div className="flex flex-col items-start w-full">
          <Label>Name <span className="text-error">*</span></Label>
          <Input
            className="mt-2 md:w-full"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>
        <div className="flex flex-col items-start w-full">
          <Label>Email <span className="text-error">*</span></Label>
          <Input
            className="mt-2 md:w-full"
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Subject <span className="text-error">*</span></Label>
        <Input
          className="mt-2 md:w-full"
          placeholder="What can we help you with?"
          value={form.subject}
          onChange={(e) => set("subject", e.target.value)}
        />
      </div>

      <div>
        <Label>Message <span className="text-error">*</span></Label>
        <Textarea
          className="mt-2 min-h-36 resize-none w-full"
          placeholder="Describe your question or feedback in detail..."
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
        />
      </div>

      <Button type="submit" disabled={disabled} className="flex items-center gap-2">
        {sending ? (
          <><Loader2 size={16} className="animate-spin" /> Sending...</>
        ) : (
          <><Send size={16} /> Send Message</>
        )}
      </Button>
    </form>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-primary">
      <Navbar />

      <main className="max-w-4xl mx-auto px-5 py-20 flex flex-col gap-16">

        {/* Header */}
        <FadeIn direction="up">
          <div className="text-center flex flex-col items-center gap-5">
            <p className="text-xs font-semibold text-accent uppercase tracking-widest">
              Contact
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
              We&apos;d love to <span className="text-accent">hear from you</span>
            </h1>
            <p className="text-base text-secondary max-w-xl leading-relaxed">
              Have a question, suggestion, or just want to say hi? Fill in the
              form below or reach us directly at{" "}
              <a
                href="mailto:hello@prepmate.com"
                className="text-accent hover:underline"
              >
                hello@prepmate.com
              </a>
            </p>
          </div>
        </FadeIn>

        {/* Quick contact chips */}
        <FadeIn direction="up" delay={60}>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:hello@prepmate.com"
              className="flex items-center gap-2.5 border border-border rounded-[12px] px-5 py-3 text-sm text-secondary hover:border-accent hover:text-accent transition-colors"
            >
              <Mail size={15} />
              hello@prepmate.com
            </a>
            <div className="flex items-center gap-2.5 border border-border rounded-[12px] px-5 py-3 text-sm text-secondary">
              <MessageSquare size={15} />
              Typically replies within 24 hours
            </div>
          </div>
        </FadeIn>

        {/* Contact form */}
        <FadeIn direction="up" delay={100}>
          <div className="bg-foreground border border-border rounded-[22px] p-8">
            <h2 className="text-lg font-semibold text-primary mb-6">Send us a message</h2>
            <ContactForm />
          </div>
        </FadeIn>

        {/* FAQ */}
        <FadeIn direction="up" delay={140}>
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-6">
              Frequently asked questions
            </p>
            <FAQ />
          </div>
        </FadeIn>

      </main>

      <Footer />
    </div>
  );
}
