"use client";

import { useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Stats } from "./components/Stats";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";
import { Benefits } from "./components/Benefits";
import { Screenshots } from "./components/Screenshots";
import { Testimonials } from "./components/Testimonials";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";

const FLOAT_KEYFRAMES = `
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
`;

export default function LandingPage() {
  // When navigated here via /#section (e.g. from /about), scroll to the section
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    // Small delay to let sections render first
    const t = setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    }, 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-primary">
      <style dangerouslySetInnerHTML={{ __html: FLOAT_KEYFRAMES }} />
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
