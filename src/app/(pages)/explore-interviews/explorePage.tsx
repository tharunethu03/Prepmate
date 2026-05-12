"use client";
import { Interview } from "@/app/types/interview";
import InterviewModal from "@/components/ui/interview-modal";
import InterviewPreviewModal from "@/components/ui/interview-preview-modal";
import { LoaderOne } from "@/components/ui/loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Loader2, UserCheck, UserPlus } from "lucide-react";
import Image from "next/image";

type Filters = {
  search: string;
  difficulty: string;
  topic: string;
  sort: string;
};

type Creator = {
  id: string;
  name: string | null;
  avatar: string | null;
  field: string | null;
  roleTitle: string | null;
  isFollowing: boolean;
  _count: { followers: number; interviews: number };
};

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Trending", value: "trending" },
  { label: "Most Loved", value: "popular" },
  { label: "Following", value: "following" },
  { label: "Creators", value: "creators" },
];

const ExplorePage = () => {
  const searchParams = useSearchParams();

  // Dashboard quick-links pass query params like ?trending=true to pre-set the sort filter
  const initialSort =
    searchParams.get("trending") === "true"
      ? "trending"
      : searchParams.get("popular") === "true"
        ? "popular"
        : searchParams.get("following") === "true"
          ? "following"
          : searchParams.get("creators") === "true"
            ? "creators"
            : "latest";

  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get("search") ?? "",
    difficulty: searchParams.get("difficulty") ?? "",
    topic: searchParams.get("topic") ?? "",
    sort: initialSort,
  });

  const [searchValue, setSearchValue] = useState(filters.search);
  const [topicValue, setTopicValue] = useState(filters.topic);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null,
  );
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Separate debounce effects for search and topic so they don't interfere —
  // each updates its own filter key without resetting the other
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchValue }));
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, topic: topicValue }));
    }, 400);
    return () => clearTimeout(timeout);
  }, [topicValue]);

  // buildUrl centralises all filter-to-query-string logic so the main fetch
  // and the load-more call both go through the same place
  const buildUrl = (f: Filters, p: number) => {
    const params = new URLSearchParams();
    params.set("visibility", "public");
    params.set("page", String(p));
    params.set("limit", "9");
    if (f.search) params.set("search", f.search);
    if (f.difficulty) params.set("difficulty", f.difficulty);
    if (f.topic) params.set("topic", f.topic);
    if (f.sort === "trending") params.set("trending", "true");
    if (f.sort === "popular") params.set("popular", "true");
    if (f.sort === "following") params.set("following", "true");
    return `/api/interviews?${params.toString()}`;
  };

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

  const fetchInterviews = useCallback(
    async (f: Filters, p: number, append = false) => {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const res = await fetch(buildUrl(f, p));
        const data = await res.json();
        const fetched: Interview[] = data.interviews ?? [];
        setInterviews((prev) => (append ? [...prev, ...fetched] : fetched));
        setHasMore(fetched.length === 9);
      } catch {
        if (!append) setInterviews([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (filters.sort !== "creators") return;
    setLoadingCreators(true);
    fetch("/api/creators")
      .then((r) => r.json())
      .then((d) => setCreators(d.creators ?? []))
      .catch(console.error)
      .finally(() => setLoadingCreators(false));
  }, [filters.sort]);

  useEffect(() => {
    setPage(1);
    fetchInterviews(filters, 1);
  }, [filters, fetchInterviews]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchInterviews(filters, nextPage, true);
  };

  const clearFilters = () => {
    setSearchValue("");
    setTopicValue("");
    setFilters({ search: "", difficulty: "", topic: "", sort: "latest" });
  };

  const hasActiveFilters =
    filters.search ||
    filters.difficulty ||
    filters.topic ||
    filters.sort !== "latest";

  return (
    <div className="py-5 flex flex-col gap-5">
      {/* Search + filter bar */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
          />
          <Input
            placeholder="Search interviews..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <Button
          variant="outline"
          className={`h-10 px-4 flex items-center gap-2 ${showFilters ? "border-accent text-accent" : ""}`}
          onClick={() => setShowFilters((prev) => !prev)}
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasActiveFilters && (
            <span className="bg-accent text-background text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              !
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            className="h-10 px-3 text-secondary"
            onClick={clearFilters}
          >
            <X size={16} />
          </Button>
        )}
      </div>

      {/* Sort tabs */}
      <div className="flex gap-2 flex-wrap">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilters((prev) => ({ ...prev, sort: opt.value }))}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.sort === opt.value
                ? "bg-accent text-background"
                : "border border-border text-secondary hover:text-accent hover:border-accent"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 border border-border rounded-[16px] p-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-secondary font-medium">Difficulty</p>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      difficulty: prev.difficulty === d ? "" : d,
                    }))
                  }
                  className={`px-3 py-1 rounded-full text-xs capitalize transition-colors ${
                    filters.difficulty === d
                      ? "bg-accent text-background"
                      : "border border-border text-secondary hover:border-accent"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs text-secondary font-medium">Topic</p>
            <Input
              placeholder="e.g. React, Node.js"
              value={topicValue}
              onChange={(e) => setTopicValue(e.target.value)}
              className="h-8 text-xs w-48"
            />
          </div>

          {hasActiveFilters && (
            <div className="w-full flex justify-end border-t border-border pt-3 mt-1">
              <Button
                variant="ghost"
                className="h-8 text-xs text-secondary hover:text-error flex items-center gap-1"
                onClick={clearFilters}
              >
                <X size={12} /> Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {filters.sort === "creators" ? (
        loadingCreators ? (
          <div className="flex items-center justify-center py-20">
            <LoaderOne />
          </div>
        ) : creators.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-secondary">
            <p className="text-sm">No creators found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {creators.map((c) => (
              <div
                key={c.id}
                className="bg-foreground border border-border rounded-[22px] p-5 flex flex-col items-center gap-3 text-center shadow-lg"
              >
                <Image
                  src={c.avatar ?? "/profile-setup/avatar1.png"}
                  width={64}
                  height={64}
                  alt="avatar"
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold">{c.name ?? "Creator"}</p>
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
        )
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <LoaderOne />
        </div>
      ) : interviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-secondary">
          <Search size={40} className="text-border" />
          <p className="text-sm">No interviews found</p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="text-xs h-8"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-x-3 gap-y-5">
            {interviews.map((interview) => (
              <InterviewModal
                key={interview.id}
                interview={interview}
                onPreview={() => setSelectedInterview(interview)}
              />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}

      {selectedInterview && (
        <InterviewPreviewModal
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
        />
      )}
    </div>
  );
};

export default ExplorePage;
