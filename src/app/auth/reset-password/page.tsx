"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  // Same Strict Mode guard as verified/page.tsx — prevents double redirect
  const validated = useRef(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  useEffect(() => {
    if (validated.current) return;
    validated.current = true;
    if (!token) {
      router.replace("/login?error=invalid-token");
    }
  }, [router, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        setStatus("idle");
        return;
      }

      setStatus("success");
      toast.success("Password updated! Signing you out…");

      // Sign out so the new password takes effect — the old JWT still has
      // the old credentials baked in, sign-out forces a fresh login
      setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 1500);
    } catch {
      toast.error("Something went wrong");
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-lg font-medium">Password updated!</p>
          <p className="text-secondary text-sm mt-2">Signing you out…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm border border-border rounded-[16px] p-8">
        <h2 className="text-xl font-semibold mb-1">Set new password</h2>
        <p className="text-secondary text-sm mb-6">
          Enter a new password for your Prepmate account.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label className="mb-2">New password</Label>
            <Input
              type="password"
              passwordToggle
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="mb-2">Confirm password</Label>
            <Input
              type="password"
              passwordToggle
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full mt-2"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Saving…" : "Save new password"}
          </Button>
        </form>
      </div>
    </div>
  );
}

const fallback = (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <div className="text-4xl mb-4">🔐</div>
      <p className="text-lg font-medium">Loading…</p>
    </div>
  </div>
);

export default function ResetPasswordPage() {
  return <Suspense fallback={fallback}><ResetPasswordContent /></Suspense>;
}
