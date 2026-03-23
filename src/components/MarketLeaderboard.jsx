import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercent } from '../lib/formatters';

export function MarketLeaderboard({ coins }) {
  const rankedCoins = [...coins].sort((a, b) => b.hypeScore - a.hypeScore).slice(0, 6);

  const getPredictionBadge = (label, icon) => {
    let colorClass = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    if (label === 'Pump') colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]';
    if (label === 'Fake Hype') colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]';
    if (label === 'Dump') colorClass = 'bg-red-500/10 text-red-500 border-red-500/20';
    if (label === 'Early Trend') colorClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]';
    
    return (
      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${colorClass}`}>
        <span>{icon}</span> {label}
      </span>
    );
  };

  return (
    <section id="leaderboard" className="glass-panel rounded-[2rem] p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Leaderboard</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Highest-conviction meme coin setups</h3>
        </div>
        <p className="text-sm text-slate-400">Ranked by hype, liquidity support, and current trend posture</p>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">
        <div className="hidden grid-cols-[1.6fr_repeat(5,1fr)] gap-3 border-b border-white/10 bg-white/[0.04] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 md:grid">
          <span>Coin</span>
          <span>Prediction</span>
          <span>Price</span>
          <span>24h Trend</span>
          <span>Hype Index</span>
          <span>Liquidity Depth</span>
        </div>

        <div className="divide-y divide-white/5">
          {rankedCoins.map((coin, index) => (
            <div key={coin.id} className="grid gap-4 px-5 py-5 transition-colors hover:bg-white/[0.02] md:grid-cols-[1.6fr_repeat(5,1fr)] md:items-center">
              
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-cyan-300 shadow-[inset_0_0_10px_rgba(34,211,238,0.2)]">
                  {index + 1}
                </div>
                <img src={coin.image} alt={coin.name} className="h-10 w-10 shrink-0 rounded-full border border-white/10 shadow-lg" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white text-base">{coin.name}</p>
                  <p className="truncate text-xs text-slate-400">{coin.symbol} • {coin.chain}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                {getPredictionBadge(coin.prediction.label, coin.prediction.icon)}
              </div>
              
              <div className="text-sm font-medium text-slate-200">
                {formatCurrency(coin.price)}
              </div>
              
              <div className="flex items-center gap-1.5">
                <div className={`flex items-center gap-1 text-sm font-bold ${coin.priceChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {coin.priceChange24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {formatPercent(coin.priceChange24h)}
                </div>
              </div>
              
              <div className="flex flex-col justify-center gap-2 pr-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-400">Score</span>
                  <span className="font-bold text-white">{coin.hypeScore}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-[1.5s] ease-out ${
                      coin.hypeScore > 75 ? 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 
                      'bg-gradient-to-r from-cyan-500 to-blue-400'
                    }`}
                    style={{ width: `${coin.hypeScore}%` }} 
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2 pr-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-400">Depth</span>
                  <span className="font-bold text-white">{coin.liquidityScore}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-[1.5s] ease-out shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                    style={{ width: `${coin.liquidityScore}%` }} 
                  />
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
