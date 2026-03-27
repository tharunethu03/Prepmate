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

      if (!session.user.profileCompleted) {
        router.push("/profile-setup"); // Redirect new users to complete profile setup
      } else {
        router.push(callbackUrl); // Otherwise go to callbackUrl (dashboard)
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
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
        {verified === "true" && (
          <p className="text-sm text-success bg-success/10 border border-success/30 rounded-[12px] px-4 py-2">
            ✅ Email verified! You can now log in.
          </p>
        )}
        {error === "invalid-token" && (
          <p className="text-sm text-error bg-error/10 border border-error/30 rounded-[12px] px-4 py-2">
            Invalid or expired verification link. Please request a new one.
          </p>
        )}
        {error === "token-expired" && (
          <p className="text-sm text-error bg-error/10 border border-error/30 rounded-[12px] px-4 py-2">
            Your verification link has expired. Please request a new one.
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
            <a href="" className="text-xs text-tertiary hover:text-accent">
              Forgot Password?
            </a>
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
