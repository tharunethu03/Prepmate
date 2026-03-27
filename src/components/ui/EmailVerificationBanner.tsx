"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EmailVerificationBanner() {
  const { data: session } = useSession();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  // Only show for credentials users who haven't verified
  if (!session?.user || dismissed) return null;

  // OAuth users are auto-verified
  if (session.user.emailVerified) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Verification email sent! Check your inbox.");
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to send email");
      }
    } catch {
      toast.error("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-warning/10 border border-warning/30 rounded-[12px] px-4 py-3 flex items-center justify-between gap-3 m-4">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="text-warning shrink-0" />
        <p className="text-sm text-warning">
          Please verify your email address.{" "}
          <button
            onClick={handleResend}
            disabled={sending}
            className="underline font-semibold hover:opacity-80"
          >
            {sending ? (
              <span className="flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> Sending...
              </span>
            ) : (
              "Resend verification email"
            )}
          </button>
        </p>
      </div>
      <button onClick={() => setDismissed(true)}>
        <X size={16} className="text-warning hover:opacity-80" />
      </button>
    </div>
  );
}
