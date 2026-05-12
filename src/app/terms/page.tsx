"use client";

import { Navbar } from "@/app/landing/components/Navbar";
import { Footer } from "@/app/landing/components/Footer";
import { FadeIn } from "@/app/landing/components/FadeIn";

const sections = [
  {
    title: "Acceptance of Terms",
    content: [
      "By creating an account or using Prepmate, you agree to these Terms of Service.",
      "If you do not agree, please do not use the platform.",
      "We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.",
    ],
  },
  {
    title: "Eligibility",
    content: [
      "You must be at least 13 years of age to use Prepmate.",
      "By using the platform, you confirm that the information you provide is accurate and complete.",
      "You are responsible for maintaining the confidentiality of your account credentials.",
    ],
  },
  {
    title: "Acceptable Use",
    content: [
      "You agree to use Prepmate only for lawful interview preparation purposes.",
      "You must not attempt to reverse-engineer, scrape, or exploit the platform or its AI systems.",
      "You must not upload or submit content that is offensive, illegal, or infringes the rights of others.",
      "You must not create multiple accounts to circumvent rate limits or other restrictions.",
      "Automated access to the platform without prior written consent is prohibited.",
    ],
  },
  {
    title: "User Content",
    content: [
      "When you create and publish interviews on Prepmate, you grant us a non-exclusive licence to display that content to other users.",
      "You retain ownership of any content you create.",
      "We reserve the right to remove content that violates these terms or our community standards.",
    ],
  },
  {
    title: "AI-Generated Content",
    content: [
      "Interview questions and feedback on Prepmate are generated using AI (Google Gemini and Groq). Results may not always be accurate.",
      "AI-generated content is provided for practice purposes only and should not be treated as professional career advice.",
      "We do not guarantee that AI scores or feedback reflect the standards of any specific employer.",
    ],
  },
  {
    title: "Intellectual Property",
    content: [
      "The Prepmate name, logo, design, and platform code are the intellectual property of Prepmate.",
      "You may not copy, reproduce, or redistribute any part of the platform without written permission.",
      "Community-created interviews remain the intellectual property of their respective creators.",
    ],
  },
  {
    title: "Limitation of Liability",
    content: [
      "Prepmate is provided on an 'as is' basis without warranties of any kind.",
      "We are not liable for any direct, indirect, or consequential damages arising from your use of the platform.",
      "We do not guarantee that using Prepmate will result in employment or interview success.",
    ],
  },
  {
    title: "Termination",
    content: [
      "We reserve the right to suspend or terminate accounts that violate these terms.",
      "You may delete your account at any time via your profile settings.",
      "Upon termination, your access to the platform will cease and your data will be handled in accordance with our Privacy Policy.",
    ],
  },
  {
    title: "Contact",
    content: [
      "For questions about these Terms of Service, contact us at hello@prepmate.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-primary">
      <Navbar />
      <main className="max-w-3xl mx-auto px-5 py-24 flex flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-accent uppercase tracking-widest">
              Legal
            </p>
            <h1 className="text-4xl font-bold text-primary">Terms of Service</h1>
            <p className="text-secondary text-sm">
              Last updated: May 2025 &nbsp;·&nbsp; Effective immediately
            </p>
            <p className="text-secondary leading-relaxed mt-2">
              Please read these Terms of Service carefully before using
              Prepmate. These terms govern your access to and use of the
              platform.
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
