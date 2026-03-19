import { RecentAttempt } from "../page";
import { Target, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

function difficultyColor(d: string) {
  if (d === "beginner") return "#22c55e";
  if (d === "intermediate") return "#facc15";
  return "#ef4444";
}

export default function RecentAttempts({
  attempts,
}: {
  attempts: RecentAttempt[];
}) {
  const router = useRouter();

  return (
    <div className="flex-1 bg-foreground border border-border rounded-[22px] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Attempts</h3>
        <Link href="/explore-interviews">
          <Button variant="outline" className="h-7 text-xs px-3">
            Find Interviews <ChevronRight size={12} />
          </Button>
        </Link>
      </div>
      {attempts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-secondary">
          <Target size={32} className="text-border" />
          <p className="text-sm">No attempts yet</p>
          <p className="text-xs text-tertiary">
            Start an interview to see your results here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {attempts.map((attempt) => (
            <div
              key={attempt.id}
              onClick={() => router.push(`/interview/${attempt.interview.id}`)}
              className="flex items-center justify-between border border-border rounded-[12px] px-4 py-3 hover:border-accent cursor-pointer transition-colors"
            >
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold truncate max-w-[180px]">
                  {attempt.interview.title}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: difficultyColor(attempt.interview.difficulty),
                    }}
                  >
                    {attempt.interview.difficulty}
                  </span>
                  <span className="text-xs text-tertiary">
                    {attempt.submittedAt
                      ? new Date(attempt.submittedAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <p className="font-bold text-accent text-lg">
                  {Math.round(attempt.score ?? 0)}%
                </p>
                <p className="text-xs text-warning">+{attempt.xpEarned} XP</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
