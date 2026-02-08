"use client";
import OnboardingOverlay from "@/app/(auth)/onboarding/page";
import { useSession } from "next-auth/react";
import { useState } from "react";

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const [dismissed, setDismissed] = useState(false);

  const showOnboarding =
    status === "authenticated" &&
    session?.user?.onboardingCompleted === false &&
    !dismissed;

  const handleClose = async () => {
    setDismissed(true);
    await fetch("/api/onboarding/complete", {
      method: "POST",
    });
  };

  return (
    <div>{showOnboarding && <OnboardingOverlay onFinish={handleClose} />}</div>
  );
};

export default DashboardPage;
