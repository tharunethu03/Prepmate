"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function VerifiedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // called.current prevents this running twice in React Strict Mode (which
  // mounts effects twice in dev) — would otherwise try to consume the token twice
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get("token");

    if (!token) {
      router.replace("/login?error=invalid-token");
      return;
    }

    // Use the one-time autoLoginToken to sign in without a password
    signIn("credentials", { autoLoginToken: token, redirect: false }).then(
      (result) => {
        if (result?.ok) {
          router.replace("/profile-setup");
        } else {
          router.replace("/login?error=session-expired");
        }
      },
    );
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">✉️</div>
        <p className="text-lg font-medium">Verifying your email…</p>
        <p className="text-secondary text-sm mt-2">
          You&apos;ll be redirected shortly.
        </p>
      </div>
    </div>
  );
}

export default function VerifiedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">✉️</div>
            <p className="text-lg font-medium">Verifying your email…</p>
            <p className="text-secondary text-sm mt-2">
              You&apos;ll be redirected shortly.
            </p>
          </div>
        </div>
      }
    >
      <VerifiedContent />
    </Suspense>
  );
}
