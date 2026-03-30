"use client";

import Image from "next/image";
import { FadeIn } from "./FadeIn";

const stats = [
  { value: "26+", label: "Industries covered" },
  { value: "100+", label: "Job roles" },
  { value: "3", label: "Interview types" },
  { value: "AI", label: "Powered feedback" },
];

export function Stats() {
  return (
    <section className="relative border-y border-border bg-foreground overflow-hidden">
      

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
