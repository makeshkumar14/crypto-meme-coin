import { formatCurrency } from '../lib/formatters';
import { TrendingUp, TrendingDown, Flame } from 'lucide-react';

function scoreBreakoutSetup(coin) {
  let score =
    coin.hypeScore * 0.9 +
    coin.liquidityScore * 1.05 +
    coin.earlySignal.confidence * 0.6 +
    coin.sentimentScore * 30 +
    Math.max(coin.priceChange24h, 0) * 1.7 +
    Math.max(coin.mentionsDelta, 0) * 120 -
    coin.fakeHypeScore * 0.8;

  if (coin.prediction.label === 'Early Trend') score += 18;
  if (coin.prediction.label === 'Pump') score += 10;
  if (coin.lifecycleStage.label === 'Early') score += 20;
  if (coin.lifecycleStage.label === 'Growth') score += 14;
  if (coin.lifecycleStage.label === 'Peak') score -= 18;
  if (coin.lifecycleStage.label === 'Distorted') score -= 30;
  if (coin.launchSignal.label === 'Launch Window Open') score += 16;

  return score;
}

function scoreFakeHypeRisk(coin) {
  let score =
    coin.fakeHypeScore * 1.35 +
    Math.max(coin.hypeScore - 45, 0) * 0.45 +
    Math.max(coin.mentionsDelta, 0) * 140 +
    Math.max(coin.social.mentions / 1000, 0) * 0.2 -
    coin.liquidityScore * 0.25;

  if (coin.prediction.label === 'Fake Hype') score += 24;
  if (coin.lifecycleStage.label === 'Distorted') score += 16;
  if (coin.priceChange24h > 0) score += Math.min(coin.priceChange24h, 12) * 0.8;

  return score;
}

function scoreWeakMomentum(coin) {
  let score =
    Math.max(-coin.priceChange24h, 0) * 4 +
    Math.max(-coin.mentionsDelta, 0) * 220 +
    Math.max(0, 0.55 - coin.sentimentScore) * 60 +
    Math.max(0, 55 - coin.hypeScore) * 0.6 +
    Math.max(0, 55 - coin.liquidityScore) * 0.4 +
    coin.fakeHypeScore * 0.15;

  if (coin.prediction.label === 'Dump') score += 30;
  if (coin.lifecycleStage.label === 'Decline') score += 20;
  if (coin.priceChange24h < -8) score += 12;

  return score;
}

function pickCoin(coins, scoreFn, filterFn = () => true, excludeIds = new Set()) {
  const filteredCoins = coins.filter((coin) => filterFn(coin) && !excludeIds.has(coin.id));
  const pool = filteredCoins.length ? filteredCoins : coins.filter((coin) => !excludeIds.has(coin.id));

  return [...pool].sort((left, right) => scoreFn(right) - scoreFn(left))[0] || coins[0];
}

export function SignalShowcase({ coins }) {
  if (!coins.length) {
    return null;
  }

  const usedIds = new Set();
  const breakout = pickCoin(
    coins,
    scoreBreakoutSetup,
    (coin) => coin.prediction.label !== 'Dump' && coin.fakeHypeScore < 75,
    usedIds,
  );
  usedIds.add(breakout.id);

  const fakeHype = pickCoin(
    coins,
    scoreFakeHypeRisk,
    (coin) => coin.fakeHypeScore >= 45 || coin.prediction.label === 'Fake Hype',
    usedIds,
  );
  usedIds.add(fakeHype.id);

  const weakestMomentum = pickCoin(
    coins,
    scoreWeakMomentum,
    (coin) => coin.prediction.label === 'Dump' || coin.lifecycleStage.label === 'Decline' || coin.priceChange24h < 0,
    usedIds,
  );

  const items = [
    {
      title: 'Best Breakout Setup',
      accent: 'from-emerald-500/20 to-cyan-500/10',
      tone: 'text-emerald-200',
      coin: breakout,
      note:
        breakout.launchSignal?.detail ||
        'Momentum, liquidity, and early traction are lining up well for a breakout setup.',
    },
    {
      title: 'Biggest Fake Hype Risk',
      accent: 'from-rose-500/20 to-amber-500/10',
      tone: 'text-rose-200',
      coin: fakeHype,
      note:
        fakeHype.fakeHypeSignal?.explanation ||
        'Suspicious social behavior is dominating the signal mix.',
    },
    {
      title: 'Weakest Momentum',
      accent: 'from-fuchsia-500/20 to-slate-500/10',
      tone: 'text-fuchsia-200',
      coin: weakestMomentum,
      note:
        weakestMomentum.lifecycleStage?.detail ||
        weakestMomentum.explanation,
    },
  ];

  return (
    <section className="grid gap-6 lg:grid-cols-3 xl:gap-8">
      {items.map((item) => (
        <article
          key={item.title}
          className={`flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br ${item.accent} p-6 xl:p-8`}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{item.title}</p>
            <div className="mt-5 flex items-center gap-4">
              <img src={item.coin.image} alt={item.coin.name} className="h-12 w-12 rounded-full border border-white/10" />
              <div>
                <h3 className="text-2xl font-semibold text-white xl:text-3xl">{item.coin.name}</h3>
                <p className={`mt-1 text-sm ${item.tone}`}>{item.coin.prediction.icon} {item.coin.prediction.label}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-[1rem] border border-white/10 bg-black/20 p-4 transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-200/80">24h Trend</p>
                {item.coin.priceChange24h >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-rose-400" />
                )}
              </div>
              <div className="mt-2 truncate text-lg font-semibold text-white">{formatCurrency(item.coin.price)}</div>
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
                    item.coin.hypeScore > 75
                      ? 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                      : item.coin.hypeScore > 40
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                        : 'bg-slate-500'
                  }`}
                  style={{ width: `${item.coin.hypeScore}%` }}
                />
              </div>
              <p className={`mt-3 text-right text-[10px] font-bold tracking-widest ${
                item.coin.hypeScore > 75
                  ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]'
                  : item.coin.hypeScore > 40
                    ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]'
                    : 'text-slate-500'
              }`}>
                {item.coin.hypeScore > 75 ? 'EXTREME' : item.coin.hypeScore > 40 ? 'RISING' : 'DORMANT'}
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-8 text-slate-300">{item.note}</p>
        </article>
      ))}
    </section>
  );
}
