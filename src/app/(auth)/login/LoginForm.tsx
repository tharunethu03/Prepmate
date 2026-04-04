import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const verified = searchParams.get("verified");
  const error = searchParams.get("error");

  // Forgot password state
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<"idle" | "loading" | "sent">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Login failed, Invalid credentials");
        return;
      }

      // Fetch the session after successful sign-in
      const session = await getSession();

      if (!session?.user) {
        toast.error("Session not found");
        return;
      }

      if (session.user.role === "ADMIN") {
        router.push("/admin");
      } else if (!session.user.profileCompleted) {
        router.push("/profile-setup");
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus("loading");
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotStatus("sent");
    } catch {
      toast.error("Something went wrong");
      setForgotStatus("idle");
    }
  };

  // ── Forgot password view ──────────────────────────────────────────
  if (mode === "forgot") {
    return (
      <div>
        {forgotStatus === "sent" ? (
          <div className="mt-6 text-center flex flex-col gap-4">
            <p className="text-4xl">📬</p>
            <p className="text-sm text-secondary">
              If <span className="text-primary font-medium">{forgotEmail}</span> is
              registered, a password reset link has been sent. Check your inbox.
            </p>
            <button
              onClick={() => {
                setMode("login");
                setForgotEmail("");
                setForgotStatus("idle");
              }}
              className="text-xs text-accent hover:underline"
            >
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <p className="text-sm text-secondary mt-2 mb-6">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
            <div>
              <Label className="mb-2">Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="mt-6 w-full"
              disabled={forgotStatus === "loading"}
            >
              {forgotStatus === "loading" ? "Sending…" : "Send reset link"}
            </Button>
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-xs text-tertiary hover:text-accent"
              >
                Back to login
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // ── Login view ────────────────────────────────────────────────────
  return (
    <div>
      <form action="" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="email" className="mt-6 mb-2">
            Email
          </Label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {verified === "true" && (
          <p className="text-sm text-success bg-success/10 border border-success/30 rounded-[12px] px-4 py-2">
            ✅ Email verified! You can now log in.
          </p>
        )}
        {(error === "invalid-token" || error === "token-expired") && (
          <p className="text-sm text-secondary bg-muted/50 border border-border rounded-[12px] px-4 py-3">
            This verification link has already been used or has expired. If your email is verified, just log in below.
          </p>
        )}
        <div>
          <Label htmlFor="password" className="mt-6 mb-2">
            Password
          </Label>
          <Input
            type="password"
            passwordToggle
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="text-xs text-tertiary hover:text-accent"
            >
              Forgot Password?
            </button>
          </div>
        </div>
        <Button className="mt-8 w-full" type="submit">
          Login
        </Button>
        <div className="flex flex-row justify-center mt-4 gap-1">
          <p className="text-sm text-secondary">
            {"Don't have an account? "}
            <a href="/signup" className="text-accent hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
