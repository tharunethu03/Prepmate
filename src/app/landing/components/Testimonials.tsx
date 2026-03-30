"use client";

import { Star } from "lucide-react";
import { FadeIn } from "./FadeIn";

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

export function Testimonials() {
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
