import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";
import LandingPage from "./landing/LandingPage";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If already logged in, skip the landing page entirely —
  // admins go straight to /admin, everyone else goes to dashboard
  // (or profile-setup if they haven't finished onboarding yet)
  if (session) {
    if (session.user.role === "ADMIN") redirect("/admin");
    else if (session.user.onboardingCompleted) redirect("/dashboard");
    else redirect("/profile-setup");
  }

  return <LandingPage />;
}
