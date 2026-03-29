import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";
import LandingPage from "./landing/LandingPage";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === "ADMIN") redirect("/admin");
    else if (session.user.onboardingCompleted) redirect("/dashboard");
    else redirect("/profile-setup");
  }

  return <LandingPage />;
}
