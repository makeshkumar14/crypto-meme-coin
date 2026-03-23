import { formatCurrency, formatNumber, formatPercent } from '../lib/formatters';
import { useAppContext } from '../context/AppContext';

export function CoinCard({ coin, isSelected, onSelect }) {
  const positiveMove = coin.priceChange24h >= 0;
  const { watchlist, toggleWatchlist } = useAppContext();
  const saved = watchlist.includes(coin.id);

  return (
    <article
      className={`group relative overflow-hidden rounded-[1.75rem] border bg-slate-950/60 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-neon ${
        isSelected ? 'border-cyan-300/50 shadow-neon' : 'border-white/10 hover:border-cyan-300/30'
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-4">
        <button type="button" onClick={onSelect} className="flex items-center gap-3 text-left">
          <img src={coin.image} alt={coin.name} className="h-11 w-11 rounded-full border border-white/10 bg-white/10" />
          <div>
            <h3 className="text-lg font-semibold text-white">{coin.name}</h3>
            <p className="text-sm text-slate-400">
              {coin.symbol} • {coin.chain}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-200">
            {coin.prediction.icon} {coin.prediction.label}
          </span>
          <button
            type="button"
            onClick={() => toggleWatchlist(coin.id)}
            className={`rounded-full px-3 py-1 text-sm ${saved ? 'bg-cyan-400 text-slate-950' : 'border border-white/10 text-slate-300'}`}
          >
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <button type="button" onClick={onSelect} className="mt-5 block w-full text-left">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Price" value={formatCurrency(coin.price)} />
          <Stat
            label="24h Change"
            value={formatPercent(coin.priceChange24h)}
            valueClass={positiveMove ? 'text-emerald-300' : 'text-rose-300'}
          />
          <Stat label="Market Cap" value={formatCurrency(coin.marketCap)} />
          <Stat label="Volume" value={formatCurrency(coin.volume)} />
        </div>

        <div className="mt-5 space-y-3">
          <ScoreBar label="Hype Score" value={coin.hypeScore} color="from-fuchsia-400 to-cyan-300" />
          <ScoreBar label="Liquidity Score" value={coin.liquidityScore} color="from-emerald-400 to-cyan-300" />
          <ScoreBar label="Sentiment" value={Math.round(coin.sentimentScore * 100)} color="from-amber-400 to-fuchsia-400" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
          <MiniStat label="Mentions" value={formatNumber(coin.social.mentions)} />
          <MiniStat label="Engagement" value={formatNumber(coin.social.engagement)} />
          <MiniStat label="Source" value={coin.socialSource} />
          <MiniStat label="Pair" value={coin.dex.pairLabel} />
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">AI Insight</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{coin.explanation}</p>
        </div>
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className={`rounded-full border border-white/10 px-3 py-1 ${coin.liquidityClass.color}`}>
          {coin.liquidityClass.icon} {coin.liquidityClass.label}
        </span>
        <span className={`rounded-full px-3 py-1 ${coin.fakeHypeSignal.tone}`}>
          🤖 {coin.fakeHypeSignal.label}
        </span>
      </div>
    </article>
  );
}

function Stat({ label, value, valueClass = 'text-white' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className={`mt-2 font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-white">{value}</p>
    </div>
  );
}

function ScoreBar({ label, value, color }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-[0.2em]">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-200">{value}/100</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/5">
        <div className={`h-2.5 rounded-full bg-gradient-to-r ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
