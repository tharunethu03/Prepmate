"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`).finally(
      () => setDone(true),
    );
  }, [token]);

  if (!done) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full border-4 border-accent/30 border-t-accent animate-spin" />
          <p className="text-secondary text-sm">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-lg px-6">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full border-[3px] border-accent flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-10 h-10 text-accent"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-primary mb-3">
          Verification Successful
        </h1>
        <p className="text-secondary text-sm leading-relaxed">
          Congratulations! Your email address has been successfully verified.
          You can close this tab and return to Prepmate.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <header className="px-8 py-5">
        <Image
          src="/logo.png"
          alt="Prepmate"
          width={130}
          height={36}
          style={{ objectFit: "contain" }}
        />
      </header>
      {/* Suspense is required here because useSearchParams() needs it —
          Next.js throws without a boundary when the hook is used in a page */}
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="mx-auto w-20 h-20 rounded-full border-4 border-accent/30 border-t-accent animate-spin" />
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
