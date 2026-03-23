export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 rounded-3xl bg-white/5" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="h-24 rounded-3xl bg-white/5" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-80 rounded-3xl bg-white/5" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-48 rounded-3xl bg-white/5" />
          <div className="h-56 rounded-3xl bg-white/5" />
          <div className="h-40 rounded-3xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}
