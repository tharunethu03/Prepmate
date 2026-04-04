"use client";
import React, { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const RegisterForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const savedPassword = useRef("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start polling once the user has submitted
  useEffect(() => {
    if (!submitted) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/auth/check-verification?email=${encodeURIComponent(email)}`,
        );
        const data = await res.json();
        if (data.verified) {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setSigningIn(true);
          const result = await signIn("credentials", {
            email,
            password: savedPassword.current,
            redirect: false,
          });
          if (result?.ok) {
            router.push("/profile-setup");
          } else {
            // Verified but auto-login failed — send to login page
            router.push("/login?verified=true");
          }
        }
      } catch {
        // Network hiccup — keep polling
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  const validatePassword = () => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validatePassword();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        savedPassword.current = password;
        setSubmitted(true);
      } else {
        const data = await res.json();
        toast.error(data.message || "Registration failed");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (signingIn) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-lg font-semibold mb-2">Email verified!</h3>
        <p className="text-secondary text-sm">Setting up your account...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-4">📧</div>
        <h3 className="text-lg font-semibold mb-2">Check your email</h3>
        <p className="text-secondary text-sm">
          We sent a verification link to{" "}
          <span className="text-accent font-medium">{email}</span>. Click the
          link to complete your registration — this page will continue
          automatically once you verify.
        </p>
        <p className="text-secondary text-xs mt-3">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <button
            className="text-accent hover:underline"
            onClick={() => {
              if (pollRef.current) clearInterval(pollRef.current);
              setSubmitted(false);
            }}
          >
            try again
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="email" className="mt-6 mb-2">
            Email
          </Label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
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
            required
          />
        </div>
        <div>
          <Label htmlFor="confirm-password" className="mt-6 mb-2">
            Confirm Password
          </Label>
          <Input
            type="password"
            passwordToggle
            placeholder="Re-Enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-row justify-center mt-4 gap-1">
          <p className="text-sm text-secondary">
            By signing up, you agree to our{" "}
            <a href="/" className="text-accent hover:underline">
              Terms & Conditions
            </a>
          </p>
        </div>

        <Button className="mt-8 w-full" type="submit" disabled={loading}>
          {loading ? "Sending verification email..." : "Register"}
        </Button>
        <div className="flex flex-row justify-center mt-4 gap-1">
          <p className="text-sm text-secondary">
            Already have an account?{" "}
            <a href="/login" className="text-accent hover:underline">
              Login
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
