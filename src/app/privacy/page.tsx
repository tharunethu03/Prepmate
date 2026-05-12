"use client";

import { Navbar } from "@/app/landing/components/Navbar";
import { Footer } from "@/app/landing/components/Footer";
import { FadeIn } from "@/app/landing/components/FadeIn";

const sections = [
  {
    title: "Information We Collect",
    content: [
      "Account information you provide when signing up (name, email address, profile photo).",
      "Interview practice data including your responses, scores, and performance history.",
      "Usage data such as pages visited, features used, and time spent on the platform.",
      "OAuth data when you sign in with Google or GitHub (name, email, profile picture only).",
    ],
  },
  {
    title: "How We Use Your Information",
    content: [
      "To provide and personalise your interview practice experience.",
      "To calculate your XP, level, and badge progress.",
      "To generate AI-powered feedback and scores on your interview answers.",
      "To display your ranking on the leaderboard among friends.",
      "To send transactional emails such as email verification and password resets.",
    ],
  },
  {
    title: "Data Sharing",
    content: [
      "We do not sell your personal data to third parties.",
      "We use third-party services including Google (OAuth), GitHub (OAuth), Gemini AI (answer scoring), ElevenLabs (voice synthesis), and Resend (email delivery). Each operates under their own privacy policy.",
      "Your interview attempts and scores are private by default. Public interviews you create are visible to other users, but your personal results are not.",
    ],
  },
  {
    title: "Data Retention",
    content: [
      "Your account data is retained for as long as your account is active.",
      "You may request deletion of your account and associated data by contacting us.",
      "Anonymised, aggregated usage data may be retained for platform improvement purposes.",
    ],
  },
  {
    title: "Security",
    content: [
      "Passwords are hashed using bcrypt and never stored in plain text.",
      "Sessions are managed via signed JWT tokens with a 30-day expiry.",
      "All data is transmitted over HTTPS.",
      "We use MongoDB Atlas with encryption at rest for database storage.",
    ],
  },
  {
    title: "Your Rights",
    content: [
      "You may access, update, or delete your account information at any time via your profile settings.",
      "You may request a copy of the data we hold about you by contacting us.",
      "You may withdraw consent for optional data processing at any time.",
    ],
  },
  {
    title: "Contact",
    content: [
      "If you have any questions about this Privacy Policy, please contact us at hello@prepmate.com.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-primary">
      <Navbar />
      <main className="max-w-3xl mx-auto px-5 py-24 flex flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-accent uppercase tracking-widest">
              Legal
            </p>
            <h1 className="text-4xl font-bold text-primary">Privacy Policy</h1>
            <p className="text-secondary text-sm">
              Last updated: May 2025 &nbsp;·&nbsp; Effective immediately
            </p>
            <p className="text-secondary leading-relaxed mt-2">
              Prepmate (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is
              committed to protecting your privacy. This policy explains what
              data we collect, how we use it, and your rights regarding your
              information.
            </p>
          </div>
        </FadeIn>

        <div className="flex flex-col gap-6">
          {sections.map((s, i) => (
            <FadeIn key={s.title} delay={i * 50} direction="up">
              <div className="bg-foreground border border-border rounded-[20px] p-7 flex flex-col gap-4">
                <h2 className="text-base font-semibold text-primary">
                  {i + 1}. {s.title}
                </h2>
                <ul className="flex flex-col gap-2">
                  {s.content.map((line, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-secondary leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
