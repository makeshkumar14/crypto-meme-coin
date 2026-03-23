export function Footer() {
  return (
    <footer className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">MemeSense AI</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            A modern meme coin intelligence prototype for tracking hype, liquidity, and launch timing. Designed for clarity,
            fast iteration, and explainable speculative signals.
          </p>
        </div>
        <div className="grid gap-2 text-sm text-slate-400">
          <a href="#leaderboard" className="transition hover:text-cyan-200">Leaderboard</a>
          <a href="#opportunities" className="transition hover:text-cyan-200">Opportunities</a>
          <a href="#methodology" className="transition hover:text-cyan-200">Methodology</a>
        </div>
      </div>
    </footer>
  );
}
