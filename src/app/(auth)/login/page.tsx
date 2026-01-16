"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import React from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-20">
      <Image
        src="/login/login-img.png"
        alt="Login illustration"
        width={600}
        height={500}
        className="object-contain hidden md:block"
        priority
        unoptimized
      />
      <div className="flex-col justify-center">
        <div className="flex-col items-start">
          <h1 className="text-4xl font-bold">Welcome Back 👋</h1>
          <p className="text-sm text-secondary">
            Please login to your account to continue
          </p>
        </div>
        <LoginForm />
        <div className="flex items-center gap-3 my-11">
          <hr className="flex-1 border-muted" />
          <p className="text-sm text-tertiary">or</p>
          <hr className="flex-1 border-muted" />
        </div>

        <div className="flex flex-col justify-center">
          <Button variant="outline" className="w-full mb-4">
            <Image
              src="/login/google-icon.png"
              alt="Google logo"
              width={18}
              height={18}
              className="mr-2"
              priority
              unoptimized
            />
            Continue with Google
          </Button>
          <Button variant="outline" className="w-full mb-4">
            <Image
              src="/login/apple-icon.png"
              alt="Apple logo"
              width={18}
              height={18}
              className="mr-2"
              priority
              unoptimized
            />
            Continue with Apple
          </Button>
        </div>
      </div>
    </div>
  );
}
