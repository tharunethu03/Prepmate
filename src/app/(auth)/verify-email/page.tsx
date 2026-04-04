"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    // Fire and forget — result doesn't change the message shown
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`).finally(
      () => setDone(true),
    );
  }, [token]);

  if (!done) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-4 animate-pulse">📧</div>
        <p className="text-secondary text-sm">Verifying your email...</p>
      </div>
    );
  }

  return (
    <div className="text-center py-4 max-w-sm">
      <div className="text-5xl mb-5">✅</div>
      <h2 className="text-xl font-bold text-primary mb-3">
        Email verified successfully
      </h2>
      <p className="text-secondary text-sm">You can close this tab.</p>
    </div>
  );
}
