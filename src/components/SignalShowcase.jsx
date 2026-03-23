import { formatCurrency, formatPercent } from '../lib/formatters';

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
    <section className="grid gap-4 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.title} className={`overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br ${item.accent} p-5`}>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{item.title}</p>
          <div className="mt-4 flex items-center gap-3">
            <img src={item.coin.image} alt={item.coin.name} className="h-11 w-11 rounded-full border border-white/10" />
            <div>
              <h3 className="text-2xl font-semibold text-white">{item.coin.name}</h3>
              <p className={`text-sm ${item.tone}`}>{item.coin.prediction.icon} {item.coin.prediction.label}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-200">
            <span>{formatCurrency(item.coin.price)}</span>
            <span className={item.coin.priceChange24h >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{formatPercent(item.coin.priceChange24h)}</span>
            <span>Hype {item.coin.hypeScore}/100</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-200">{item.note}</p>
        </article>
      ))}
    </section>
  );
}
