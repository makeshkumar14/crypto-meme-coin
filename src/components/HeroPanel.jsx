import { formatCurrency, formatPercent } from '../lib/formatters';

export function HeroPanel({ topCoin, marketPulse }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-900/90 to-fuchsia-500/10 p-6 shadow-neon sm:p-8">
      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
        <div className="animate-slideUp space-y-4">
          <p className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-cyan-200">
            HypeChain Forecast Engine
          </p>
          <h2 className="max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl">
            Predict meme coin momentum from hype, liquidity, and crowd emotion.
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Track early pumps, fake hype, and dump risk using a rule-based signal engine powered by CoinGecko, DexScreener,
            and social fallback analytics.
          </p>

          {topCoin ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Top Signal" value={`${topCoin.prediction.icon} ${topCoin.name}`} detail={topCoin.explanation} />
              <MetricCard label="Price" value={formatCurrency(topCoin.price)} detail={formatPercent(topCoin.priceChange24h)} />
              <MetricCard label="Market Pulse" value={`${marketPulse.avgHype}/100`} detail={`${marketPulse.trendStrength} active breakout signals`} />
            </div>
          ) : null}
        </div>

        <div className="glass-panel animate-float rounded-[1.75rem] p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Signal Snapshot</p>
          <div className="mt-6 space-y-5">
            <SignalBar label="Average Hype" value={marketPulse.avgHype} color="from-cyan-400 to-teal-300" />
            <SignalBar label="Average Liquidity" value={marketPulse.avgLiquidity} color="from-emerald-400 to-cyan-300" />
            <SignalBar label="Sentiment" value={Math.round(Number(marketPulse.avgSentiment) * 100)} color="from-fuchsia-400 to-violet-400" />
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">AI Insight</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              The current market shows {marketPulse.trendStrength} coins with expansion signals. Liquidity remains the key
              filter between healthy breakouts and unstable hype bursts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>
    </div>
  );
}

function SignalBar({ label, value, color }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-medium text-white">{value}%</span>
      </div>
      <div className="h-3 rounded-full bg-white/5">
        <div className={`h-3 rounded-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
