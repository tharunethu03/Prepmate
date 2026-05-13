"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Interview } from "@/app/types/interview";
import InterviewModal from "@/components/ui/interview-modal";
import { Button } from "@/components/ui/button";
import { ChevronRight, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function TrendingInterviews({
  onPreview,
}: {
  onPreview: (i: Interview) => void;
}) {
  const { data: session } = useSession();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pass the user's field so the API can surface matching interviews first
    const field = session?.user?.field;
    const url = `/api/interviews?visibility=public&trending=true&limit=6${field ? `&field=${encodeURIComponent(field)}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => setInterviews(d.interviews ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session?.user?.field]);

  if (!loading && interviews.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <TrendingUp size={16} className="text-accent" /> Trending This Month
        </h3>
        <Link href="/explore-interviews?trending=true">
          <Button variant="outline" className="h-7 text-secondary text-xs px-3">
            See all <ChevronRight size={12} />
          </Button>
        </Link>
      </div>
      <div className="flex flex-row gap-3 overflow-x-auto scrollbar-hide md:flex-wrap py-5 px-3">
        {interviews.map((i) => (
          <InterviewModal
            key={i.id}
            interview={i}
            onPreview={() => onPreview(i)}
          />
        ))}
      </div>
    </div>
  );
}
