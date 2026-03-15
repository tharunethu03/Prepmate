import { Suspense } from "react";
import Image from "next/image";
import LoginForm from "./LoginForm";
import OauthButtons from "@/components/ui/oauth-buttons";

export default function LoginPage() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-20">
      <Image
        src="/login/login-img.png"
        alt="Login illustration"
        width={600}
        height={600}
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
        <Suspense fallback={<div className="h-40" />}>
          <LoginForm />
        </Suspense>
        <div className="flex items-center gap-3 my-11">
          <hr className="flex-1 border-muted" />
          <p className="text-sm text-tertiary">or</p>
          <hr className="flex-1 border-muted" />
        </div>
        <OauthButtons />
      </div>
    </div>
  );
}
