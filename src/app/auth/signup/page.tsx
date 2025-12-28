"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRouter } from "next/navigation";

import React from "react";

const page = () => {
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Navigate after successful submit
    router.push("/auth/profile-setup");
  };
  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-20">
        <div className="flex-col justify-center">
          <div className="flex-col items-start">
            <h1 className="text-4xl font-bold">Create Your Account</h1>
            <p className="text-sm text-secondary">
              Please create your account to continue
            </p>
          </div>
          <form action="" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" className="mt-6 mb-2">
                Email
              </Label>
              <Input type="email" placeholder="Enter your email" />
            </div>
            <div>
              <Label htmlFor="password" className="mt-6 mb-2">
                Password
              </Label>
              <Input
                type="password"
                passwordToggle
                placeholder="Enter your password"
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
                <a href="/auth/login" className="text-accent hover:underline">
                  Login
                </a>
                
              </p>
            </div>
          </form>
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
        <Image
          src="/signup/signup-img.png"
          alt="Signup illustration"
          width={600}
          height={500}
          className="object-contain hidden md:block"
          priority
          unoptimized
        />
      </div>
    </div>
  );
};

export default page;
