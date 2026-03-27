"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function VerifiedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get("token");

    if (!token) {
      router.replace("/login?error=invalid-token");
      return;
    }

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
