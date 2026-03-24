import { formatCurrency, formatNumber } from '../lib/formatters';

export function CoinDetailPanel({ coin }) {
  if (!coin) {
    return null;
  }

  const mentionTrend = `${coin.mentionsDelta >= 0 ? '+' : ''}${(coin.mentionsDelta * 100).toFixed(0)}%`;

  return (
    <section className="glass-panel rounded-3xl p-5">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400/80">Selected Coin Deep Dive</p>
      <div className="mt-3 flex items-center gap-3">
        <img src={coin.image} alt={coin.name} className="h-12 w-12 rounded-full border border-white/10" />
        <div>
          <h3 className="text-xl font-semibold text-white">{coin.name}</h3>
          <p className="text-sm text-slate-400">{coin.symbol} • {coin.socialSource}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Metric label="Prediction" value={`${coin.prediction.icon} ${coin.prediction.label}`} />
        <Metric label="Launch Signal" value={coin.launchSignal.label} valueClass={coin.launchSignal.tone} />
        <Metric label="Lifecycle" value={coin.lifecycleStage.label} valueClass={coin.lifecycleStage.tone} />
        <Metric label="Early Signal" value={`${coin.earlySignal.label} (${coin.earlySignal.confidence}%)`} />
        <Metric label="Mentions Trend" value={mentionTrend} valueClass={coin.mentionsDelta >= 0 ? 'text-emerald-300' : 'text-rose-300'} />
        <Metric label="Sentiment" value={`${Math.round(coin.sentimentScore * 100)} / 100`} />
        <Metric label="Liquidity Pool" value={formatCurrency(coin.dex.liquidityUsd)} />
        <Metric label="24h Dex Volume" value={formatCurrency(coin.dex.volume24h)} />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400/90">Trade Readiness</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">{coin.launchSignal.detail}</p>
        <p className="mt-3 text-sm leading-6 text-slate-300">{coin.earlySignal.detail}</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Metric label="Mentions" value={formatNumber(coin.social.mentions)} />
        <Metric label="Engagement" value={formatNumber(coin.social.engagement)} />
        <Metric label="Influencers" value={formatNumber(coin.social.influencers)} />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Score Breakdown</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <ScoreList title="Hype" items={coin.scoreBreakdown.hype} />
          <ScoreList title="Liquidity" items={coin.scoreBreakdown.liquidity} />
          <ScoreList title="Risk" items={coin.scoreBreakdown.risk} />
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, valueClass = 'text-white' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.05]">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-400/80">{label}</p>
      <p className={`mt-2 font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}

function ScoreList({ title, items }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={`${title}-${item.label}`} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-300">{item.label}</span>
            <span className="font-medium text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
