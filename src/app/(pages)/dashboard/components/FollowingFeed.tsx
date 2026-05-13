"use client";
import { useEffect, useState } from "react";
import { Interview } from "@/app/types/interview";
import InterviewModal from "@/components/ui/interview-modal";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { SkeletonSection } from "./SkeletonCard";

export default function FollowingFeed({
  onPreview,
}: {
  onPreview: (i: Interview) => void;
}) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/interviews?following=true&limit=6")
      .then((r) => r.json())
      .then((d) => setInterviews(d.interviews ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonSection count={3} />;
  if (interviews.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Users size={16} className="text-accent" /> From Creators You Follow
        </h3>
        <Link href="/explore-interviews?following=true">
          <Button variant="outline" className="h-7 text-secondary text-xs px-3">
            See all <ChevronRight size={12} />
          </Button>
        </Link>
      </div>
      <div className="flex flex-row flex-wrap gap-x-3 gap-y-5">
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
