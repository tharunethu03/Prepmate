"use client";
import OnboardingOverlay from "@/app/(auth)/onboarding/page";
import { Interview } from "@/app/types/interview";
import InterviewModal from "@/components/ui/interview-modal";
import { LoaderOne } from "@/components/ui/loader";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";


const DashboardPage = () => {
  const { data: session, status } = useSession();
  const [dismissed, setDismissed] = useState(false);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await fetch(
          "/api/interviews?visibility=public&trending=true&page=1&limit=10",
        );
        const data = await res.json();

        console.log("Fetched interviews:", data);

        setInterviews(data.interviews ?? []);
      } catch (error) {
        console.log("Failed to fetch interviews", error);
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  return (
    <div className="py-5">
      <h2>Top Interviews This Month</h2>
      <div>
        {loading && (
          <div className="flex items-center justify-center h-full">
            <LoaderOne />
          </div>
        )}
      </div>
      <div className="flex flex-row md:flex-wrap gap-x-3 gap-y-5 overflow-x-auto mt-5 scrollbar-hide">
        {interviews.map((interview) => (
          <InterviewModal
            key={interview.id}
            interview={interview}
            onDelete={(id) =>
              setInterviews((prev) => prev.filter((i) => i.id !== id))
            }
          />
        ))}
      </div>

      {showOnboarding && <OnboardingOverlay onFinish={handleClose} />}
    </div>
  );
};

export default DashboardPage;
