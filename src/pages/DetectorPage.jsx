import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

export function DetectorPage() {
  const { coins, loading, error } = useAppContext();
  const suspiciousCoins = useMemo(() => [...coins].sort((a, b) => b.fakeHypeScore - a.fakeHypeScore), [coins]);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Fake Hype / Bot Detector</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Spot suspicious activity before it traps new users</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Yes, this is possible as a heuristic. We do not detect bots with certainty, but we can flag bot-like patterns such as sharp mention spikes,
          weak engagement quality, thin liquidity, and hype that looks disconnected from real market depth.
        </p>
      </section>

      {error ? <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-5 text-rose-100">{error}</div> : null}

      <section className="grid gap-4 xl:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-64 rounded-3xl bg-white/5" />)
          : suspiciousCoins.map((coin) => (
              <article key={coin.id} className="glass-panel rounded-3xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{coin.chain}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{coin.name}</h2>
                    <p className="mt-1 text-sm text-slate-400">{coin.symbol} • {coin.prediction.icon} {coin.prediction.label}</p>
                  </div>
                  <span className={`rounded-full px-3 py-2 text-sm ${coin.fakeHypeSignal.tone}`}>
                    {coin.fakeHypeSignal.label}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <RiskMetric label="Fake hype score" value={`${coin.fakeHypeScore}/100`} />
                  <RiskMetric label="Mentions trend" value={`${coin.mentionsDelta >= 0 ? '+' : ''}${(coin.mentionsDelta * 100).toFixed(0)}%`} />
                  <RiskMetric label="Liquidity score" value={`${coin.liquidityScore}/100`} />
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Detector explanation</p>
                  <p className="mt-2 text-sm leading-7 text-slate-200">{coin.fakeHypeSignal.explanation}</p>
                </div>
              </article>
            ))}
      </section>
    </div>
  );
}

function RiskMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
