"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2, Star, UserPlus, UserCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Creator = {
  id: string;
  name: string | null;
  avatar: string | null;
  field: string | null;
  roleTitle: string | null;
  isFollowing: boolean;
  _count: { followers: number; interviews: number };
};

export default function DiscoverCreators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/creators")
      .then((r) => r.json())
      .then((d) => setCreators((d.creators ?? []).slice(0, 4)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleFollow = async (creatorId: string) => {
    setActionLoading(creatorId);
    try {
      const res = await fetch("/api/creators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId }),
      });
      const data = await res.json();
      setCreators((prev) =>
        prev.map((c) =>
          c.id === creatorId ? { ...c, isFollowing: data.following } : c,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (!loading && creators.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Star size={16} className="text-warning" /> Discover Creators
        </h3>
        <Link href="/explore-interviews?creators=true">
          <Button variant="outline" className="h-7 text-secondary text-xs px-3">
            See all <ChevronRight size={12} />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {creators.map((c) => (
          <div
            key={c.id}
            className="bg-foreground border border-border rounded-[22px] p-4 flex flex-col items-center gap-3 text-center shadow-lg"
          >
            <Image
              src={c.avatar ?? "/profile-setup/avatar1.png"}
              width={56}
              height={56}
              alt="avatar"
              className="rounded-full"
            />
            <div>
              <p className="font-semibold text-sm">{c.name ?? "Creator"}</p>
              <p className="text-xs text-secondary">
                {c.field ?? c.roleTitle ?? ""}
              </p>
            </div>
            <div className="flex gap-3 text-xs text-tertiary">
              <span>{c._count.followers} followers</span>
              <span>{c._count.interviews} interviews</span>
            </div>
            <Button
              className="w-full h-8 text-xs"
              variant={c.isFollowing ? "outline" : "default"}
              onClick={() => toggleFollow(c.id)}
              disabled={actionLoading === c.id}
            >
              {actionLoading === c.id ? (
                <Loader2 size={12} className="animate-spin" />
              ) : c.isFollowing ? (
                <>
                  <UserCheck size={12} /> Following
                </>
              ) : (
                <>
                  <UserPlus size={12} /> Follow
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
