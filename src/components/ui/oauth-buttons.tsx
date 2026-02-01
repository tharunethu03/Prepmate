"use client";

import React, { useState } from "react";
import { Button } from "./button";
import Image from "next/image";
import { signIn } from "next-auth/react";
import StackIcon from "tech-stack-icons";
import { toast } from "sonner";

const OauthButtons = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      setLoading(provider);
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        toast.error(`${provider} sign-in failed: ${result.error}`);
      } else if (result?.ok) {
        // Redirect manually after successful auth
        window.location.href = result.url || "/";
      }
    } catch (error) {
      toast.error(`An error occurred with ${provider} sign-in`);
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col justify-center">
      <Button
        variant="outline"
        className="w-full mb-4"
        onClick={() => handleOAuthSignIn("google")}
        disabled={loading !== null}
      >
        <StackIcon name="google" className="w-8 h-8 rounded" />
        {loading === "google" ? "Signing in..." : "Continue with Google"}
      </Button>
      <Button
        variant="outline"
        className="w-full mb-4"
        onClick={() => handleOAuthSignIn("github")}
        disabled={loading !== null}
      >
        <StackIcon name="github" className="w-8 h-8 rounded" />
        {loading === "github" ? "Signing in..." : "Continue with Github"}
      </Button>
    </div>
  );
};

export default OauthButtons;
