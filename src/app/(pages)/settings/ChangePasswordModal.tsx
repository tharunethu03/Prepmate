"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

type Props = {
  onClose: () => void;
};

export default function ChangePasswordModal({ onClose }: Props) {
  const [step, setStep] = useState<"confirm" | "sent">("confirm");
  const [loading, setLoading] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Tick down the resend countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendEmail = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password-request", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to send reset email");
        return;
      }
      setMaskedEmail(data.maskedEmail);
      setStep("sent");
      setCountdown(60);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password-request", {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to resend email");
        return;
      }
      toast.success("Reset link resent!");
      setCountdown(60);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 px-4">
      <div className="bg-foreground border-2 border-accent rounded-[22px] w-full max-w-sm relative p-8">
        <button className="absolute top-4 right-4" onClick={onClose}>
          <X className="text-tertiary hover:text-secondary cursor-pointer" />
        </button>

        {step === "confirm" ? (
          <>
            <div className="text-3xl mb-4">🔐</div>
            <h2 className="text-lg font-semibold mb-1">Change password</h2>
            <p className="text-secondary text-sm mb-6">
              We&apos;ll send a password reset link to your registered email address.
              Are you sure you want to continue?
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={sendEmail}
                disabled={loading}
              >
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-3xl mb-4">📬</div>
            <h2 className="text-lg font-semibold mb-1">Check your inbox</h2>
            <p className="text-secondary text-sm mb-1">
              A password reset link has been sent to
            </p>
            <p className="font-medium text-sm mb-6">{maskedEmail}</p>

            <div className="flex flex-col gap-3">
              <Button className="w-full" onClick={onClose}>
                Done
              </Button>
              <button
                onClick={handleResend}
                disabled={countdown > 0 || loading}
                className="text-xs text-tertiary hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {countdown > 0
                  ? `Can't find it? Resend in ${countdown}s`
                  : "Can't find it? Send again"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
