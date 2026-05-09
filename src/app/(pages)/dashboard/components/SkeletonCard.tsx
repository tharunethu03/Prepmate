export function SkeletonInterviewCard() {
  return (
    <div className="flex flex-col gap-3 w-full sm:w-fit card-shadow min-w-[200px] max-w-[300px] md:max-w-100 min-h-65 bg-foreground border-2 border-border px-4 sm:px-8 py-4 sm:py-5 rounded-[22px] animate-pulse">
      <div className="h-5 bg-border rounded-full w-3/4" />
      <div className="flex gap-2">
        <div className="h-7 bg-border rounded-[12px] w-24" />
        <div className="h-7 bg-border rounded-[12px] w-20" />
      </div>
      <div className="h-4 bg-border rounded-full w-1/2" />
      <div className="mt-auto flex justify-between items-center">
        <div className="flex gap-1">
          <div className="w-7 h-7 bg-border rounded-full" />
          <div className="w-7 h-7 bg-border rounded-full -ml-2" />
        </div>
        <div className="flex gap-3">
          <div className="w-6 h-6 bg-border rounded-full" />
          <div className="w-6 h-6 bg-border rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonSection({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-border rounded-full w-40 animate-pulse" />
        <div className="h-7 bg-border rounded-[11px] w-20 animate-pulse" />
      </div>
      <div className="flex flex-row gap-3 overflow-x-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonInterviewCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonWelcomeCard() {
  return (
    <div className="bg-foreground border border-border rounded-[22px] card-shadow px-8 py-6 flex items-center gap-5 animate-pulse">
      <div className="w-[72px] h-[72px] bg-border rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 bg-border rounded-full w-24" />
        <div className="h-6 bg-border rounded-full w-40" />
        <div className="h-3 bg-border rounded-full w-32" />
      </div>
      <div className="flex flex-col gap-2 min-w-[200px]">
        <div className="h-3 bg-border rounded-full w-full" />
        <div className="h-2 bg-border rounded-full w-full" />
        <div className="h-3 bg-border rounded-full w-1/2 ml-auto" />
      </div>
    </div>
  );
}
