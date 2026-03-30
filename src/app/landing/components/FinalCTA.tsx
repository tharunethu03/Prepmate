"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";
import { FadeIn } from "./FadeIn";

export function FinalCTA() {
  return (
    <section className="relative py-24 px-5 bg-foreground border-y border-border overflow-hidden">
      {/* prop3 — puzzle, left */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none opacity-45">
        <FadeIn delay={200} direction="none">
          <div style={{ animation: "floatUpL 4.2s ease-in-out 0.5s infinite both" }}>
            <Image src="/landing/prop3.png" alt="" width={65} height={65} className="rotate-12" style={{ imageRendering: "auto" }} />
          </div>
        </FadeIn>
      </div>
      {/* prop2 — clipboard, right */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none opacity-45">
        <FadeIn delay={300} direction="none">
          <div style={{ animation: "floatBob 3.6s ease-in-out 0.9s infinite both" }}>
            <Image src="/landing/prop2.png" alt="" width={65} height={65} className="-rotate-6" style={{ imageRendering: "auto" }} />
          </div>
        </FadeIn>
      </div>

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
