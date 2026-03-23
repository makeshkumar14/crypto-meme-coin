import { formatCurrency, formatPercent } from '../lib/formatters';

export function MarketLeaderboard({ coins }) {
  const rankedCoins = [...coins].sort((a, b) => b.hypeScore - a.hypeScore).slice(0, 6);

  return (
    <section id="leaderboard" className="glass-panel rounded-[2rem] p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Leaderboard</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Highest-conviction meme coin setups</h3>
        </div>
        <p className="text-sm text-slate-400">Ranked by hype, liquidity support, and current trend posture</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
        <div className="hidden grid-cols-[1.6fr_repeat(5,1fr)] gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-500 md:grid">
          <span>Coin</span>
          <span>Prediction</span>
          <span>Price</span>
          <span>24h</span>
          <span>Hype</span>
          <span>Liquidity</span>
        </div>

        <div className="divide-y divide-white/10">
          {rankedCoins.map((coin, index) => (
            <div key={coin.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1.6fr_repeat(5,1fr)] md:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-sm font-semibold text-cyan-200">
                  {index + 1}
                </div>
                <img src={coin.image} alt={coin.name} className="h-10 w-10 rounded-full border border-white/10" />
                <div>
                  <p className="font-semibold text-white">{coin.name}</p>
                  <p className="text-sm text-slate-400">{coin.symbol} • {coin.chain}</p>
                </div>
              </div>
              <div className="text-sm text-slate-200">{coin.prediction.icon} {coin.prediction.label}</div>
              <div className="text-sm text-slate-200">{formatCurrency(coin.price)}</div>
              <div className={`text-sm ${coin.priceChange24h >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {formatPercent(coin.priceChange24h)}
              </div>
              <div className="text-sm text-slate-200">{coin.hypeScore}/100</div>
              <div className="text-sm text-slate-200">{coin.liquidityScore}/100</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
