import { formatCurrency, formatPercent } from '../lib/formatters';
import { TrendingUp, TrendingDown, Flame, Activity } from 'lucide-react';

export function SignalShowcase({ coins }) {
  if (!coins.length) {
    return null;
  }

  const pump = [...coins].sort((a, b) => (b.hypeScore + b.priceChange24h) - (a.hypeScore + a.priceChange24h)).find((coin) => coin.prediction.label === 'Pump' || coin.prediction.label === 'Early Trend') || coins[0];
  const fake = [...coins].sort((a, b) => b.fakeHypeScore - a.fakeHypeScore)[0];
  const dump = [...coins].sort((a, b) => a.priceChange24h - b.priceChange24h).find((coin) => coin.prediction.label === 'Dump') || [...coins].sort((a, b) => a.priceChange24h - b.priceChange24h)[0];

  const items = [
    {
      title: 'Best Breakout Setup',
      accent: 'from-emerald-500/20 to-cyan-500/10',
      tone: 'text-emerald-200',
      coin: pump,
      note: pump.launchSignal?.detail || 'Momentum and liquidity look supportive right now.',
    },
    {
      title: 'Biggest Fake Hype Risk',
      accent: 'from-rose-500/20 to-amber-500/10',
      tone: 'text-rose-200',
      coin: fake,
      note: fake.fakeHypeSignal?.explanation || 'Suspicious social behavior is dominating the signal mix.',
    },
    {
      title: 'Weakest Momentum',
      accent: 'from-fuchsia-500/20 to-slate-500/10',
      tone: 'text-fuchsia-200',
      coin: dump,
      note: dump.explanation,
    },
  ];

  return (
    <section className="grid gap-6 xl:gap-8 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.title} className={`overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br ${item.accent} p-6 xl:p-8 flex flex-col justify-between`}>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{item.title}</p>
            <div className="mt-5 flex items-center gap-4">
              <img src={item.coin.image} alt={item.coin.name} className="h-12 w-12 rounded-full border border-white/10" />
              <div>
                <h3 className="text-2xl xl:text-3xl font-semibold text-white">{item.coin.name}</h3>
                <p className={`mt-1 text-sm ${item.tone}`}>{item.coin.prediction.icon} {item.coin.prediction.label}</p>
              </div>
            </div>
          </div>
          
          {/* Pictorial Representation */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            {/* Price Sparkline Graph */}
            <div className="rounded-[1rem] border border-white/10 bg-black/20 p-4 transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-200/80">24h Trend</p>
                {item.coin.priceChange24h >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : <TrendingDown className="h-4 w-4 text-rose-400" />}
              </div>
              <div className="mt-2 text-lg font-semibold text-white truncate">{formatCurrency(item.coin.price)}</div>
              <div className={`text-xs font-medium ${item.coin.priceChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {item.coin.priceChange24h >= 0 ? '+' : ''}{item.coin.priceChange24h.toFixed(2)}%
              </div>
              
              <div className="mt-3 h-8 w-full">
                <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
                  {item.coin.priceChange24h >= 0 ? (
                    <path d="M0,25 C15,25 30,10 50,20 C70,30 85,5 100,5" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  ) : (
                    <path d="M0,5 C15,5 30,20 50,10 C70,5 85,25 100,25" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]" />
                  )}
                </svg>
              </div>
            </div>

            {/* Hype Gauge */}
            <div className="rounded-[1rem] border border-white/10 bg-black/20 p-4 transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-200/80">Hype Gauge</p>
                <Flame className={`h-4 w-4 ${item.coin.hypeScore > 75 ? 'text-amber-400' : item.coin.hypeScore > 40 ? 'text-cyan-400' : 'text-slate-500'}`} />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-xl font-semibold text-white">{item.coin.hypeScore}</span>
                <span className="text-xs text-slate-500">/100</span>
              </div>
              
              <div className="mt-5 h-[6px] w-full overflow-hidden rounded-full bg-white/10">
                <div 
                  className={`h-full rounded-full transition-all duration-[1.5s] ease-out ${
                    item.coin.hypeScore > 75 ? 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 
                    item.coin.hypeScore > 40 ? 'bg-gradient-to-r from-cyan-500 to-blue-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]' : 
                    'bg-slate-500'
                  }`}
                  style={{ width: `${item.coin.hypeScore}%` }}
                />
              </div>
              <p className={`mt-3 text-[10px] font-bold text-right tracking-widest ${item.coin.hypeScore > 75 ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]' : item.coin.hypeScore > 40 ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'text-slate-500'}`}>{item.coin.hypeScore > 75 ? 'EXTREME' : item.coin.hypeScore > 40 ? 'RISING' : 'DORMANT'}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-8 text-slate-300">{item.note}</p>
        </article>
      ))}
    </section>
  );
}
