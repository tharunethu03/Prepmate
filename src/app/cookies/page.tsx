"use client";

import { Navbar } from "@/app/landing/components/Navbar";
import { Footer } from "@/app/landing/components/Footer";
import { FadeIn } from "@/app/landing/components/FadeIn";

const sections = [
  {
    title: "What Are Cookies",
    content: [
      "Cookies are small text files stored on your device when you visit a website.",
      "They help websites remember your preferences, keep you logged in, and understand how you use the site.",
      "Prepmate uses both first-party cookies (set by us) and third-party cookies (set by our service providers).",
    ],
  },
  {
    title: "Cookies We Use",
    content: [
      "Session cookie (next-auth.session-token): Keeps you logged in for up to 30 days. This is essential for the platform to function.",
      "CSRF cookie (next-auth.csrf-token): Protects your account from cross-site request forgery attacks.",
      "Callback URL cookie (next-auth.callback-url): Remembers where to redirect you after sign-in.",
      "Theme preference: Stored in localStorage (not a cookie) to remember your light/dark mode preference.",
    ],
  },
  {
    title: "Third-Party Cookies",
    content: [
      "Google OAuth: If you sign in with Google, Google may set cookies as part of the authentication process.",
      "GitHub OAuth: If you sign in with GitHub, GitHub may set cookies as part of the authentication process.",
      "These third-party cookies are governed by the respective providers' privacy policies.",
    ],
  },
  {
    title: "What We Don't Use",
    content: [
      "We do not use advertising or tracking cookies.",
      "We do not use analytics cookies or third-party analytics services.",
      "We do not share cookie data with advertisers.",
    ],
  },
  {
    title: "Managing Cookies",
    content: [
      "You can control cookies through your browser settings. Most browsers allow you to block or delete cookies.",
      "Blocking essential cookies (such as the session cookie) will prevent you from staying logged in.",
      "To clear your Prepmate session, you can log out from the platform or clear your browser cookies for this site.",
    ],
  },
  {
    title: "Changes to This Policy",
    content: [
      "We may update this Cookie Policy from time to time.",
      "Any changes will be reflected on this page with an updated date.",
      "Continued use of Prepmate after changes constitutes acceptance of the updated policy.",
    ],
  },
  {
    title: "Contact",
    content: [
      "If you have questions about our use of cookies, contact us at hello@prepmate.com.",
    ],
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-primary">
      <Navbar />
      <main className="max-w-3xl mx-auto px-5 py-24 flex flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-accent uppercase tracking-widest">
              Legal
            </p>
            <h1 className="text-4xl font-bold text-primary">Cookie Policy</h1>
            <p className="text-secondary text-sm">
              Last updated: May 2025 &nbsp;·&nbsp; Effective immediately
            </p>
            <p className="text-secondary leading-relaxed mt-2">
              This Cookie Policy explains how Prepmate uses cookies and similar
              technologies when you use our platform.
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
