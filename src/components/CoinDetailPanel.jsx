import { formatCurrency, formatNumber, formatPercent } from '../lib/formatters';

export function CoinDetailPanel({ coin }) {
  if (!coin) {
    return null;
  }

  const mentionTrend = `${coin.mentionsDelta >= 0 ? '+' : ''}${(coin.mentionsDelta * 100).toFixed(0)}%`;

  return (
    <section className="glass-panel rounded-3xl p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Selected Coin Deep Dive</p>
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
        <Metric label="Mentions Trend" value={mentionTrend} valueClass={coin.mentionsDelta >= 0 ? 'text-emerald-300' : 'text-rose-300'} />
        <Metric label="Sentiment" value={`${Math.round(coin.sentimentScore * 100)} / 100`} />
        <Metric label="Liquidity Pool" value={formatCurrency(coin.dex.liquidityUsd)} />
        <Metric label="24h Dex Volume" value={formatCurrency(coin.dex.volume24h)} />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Trade Readiness</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">{coin.launchSignal.detail}</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Metric label="Mentions" value={formatNumber(coin.social.mentions)} />
        <Metric label="Engagement" value={formatNumber(coin.social.engagement)} />
        <Metric label="Influencers" value={formatNumber(coin.social.influencers)} />
      </div>
    </section>
  );
}

function Metric({ label, value, valueClass = 'text-white' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className={`mt-2 font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}
