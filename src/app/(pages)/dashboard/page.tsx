"use client";
import OnboardingOverlay from "@/app/(auth)/onboarding/page";
import { Interview } from "@/app/types/interview";
import InterviewPreviewModal from "@/components/ui/interview-preview-modal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import WelcomeCard from "./components/WelcomeCard";
import PendingChallenges from "./components/PendingChallenges";
import FollowingFeed from "./components/FollowingFeed";
import TrendingInterviews from "./components/TrendingInterviews";
import MostLoved from "./components/MostLoved";
import DiscoverCreators from "./components/DiscoverCreators";

const DashboardPage = () => {
  const { data: session, status, update } = useSession();
  const [dismissed, setDismissed] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null,
  );
  const router = useRouter();

  const showOnboarding =
    status === "authenticated" &&
    session?.user?.onboardingCompleted === false &&
    !dismissed;

  const handleClose = async () => {
    await fetch("/api/onboarding/complete", { method: "POST" });
    await update({ onboardingCompleted: true });
    setDismissed(true);
    router.refresh();
  };

  const sections = [
    <WelcomeCard key="welcome" />,
    <PendingChallenges key="challenges" />,
    <FollowingFeed key="following" onPreview={setSelectedInterview} />,
    <TrendingInterviews key="trending" onPreview={setSelectedInterview} />,
    <MostLoved key="loved" onPreview={setSelectedInterview} />,
    <DiscoverCreators key="creators" />,
  ];

  return (
    <div className="py-5 flex flex-col gap-8">
      {sections.map((section, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          {section}
        </motion.div>
      ))}

      {showOnboarding && <OnboardingOverlay onFinish={handleClose} />}
      {selectedInterview && (
        <InterviewPreviewModal
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
