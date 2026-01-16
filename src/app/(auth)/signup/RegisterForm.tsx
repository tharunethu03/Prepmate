"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

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
    setError(null);

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        // 🔥 AUTO LOGIN
        await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        router.push("/profile-setup");
      } else {
        const data = await res.json();
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.log("Registration error:", error);
    }
  };

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
        {/* Delete this later */}
        <Button className="mt-8 w-full" type="submit">
          Register
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
