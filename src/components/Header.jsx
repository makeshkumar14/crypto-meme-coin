import { formatRelativeTime } from '../lib/formatters';

export function Header({ brand, lastUpdated, onRefresh, usingMockSocialData }) {
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-neon backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Predictive Meme Coin Intelligence</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{brand}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-cyan-200">
          Live data refresh: {formatRelativeTime(lastUpdated)}
        </span>
        <span
          className={`rounded-full px-3 py-2 ${
            usingMockSocialData
              ? 'border border-amber-400/20 bg-amber-400/10 text-amber-200'
              : 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
          }`}
        >
          {usingMockSocialData ? 'Fallback social blend active' : 'LunarCrush live social data active'}
        </span>
        <button
          onClick={onRefresh}
          className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 font-medium text-fuchsia-100 transition hover:bg-fuchsia-500/20"
        >
          Refresh Signals
        </button>
      </div>
    </header>
  );
}
