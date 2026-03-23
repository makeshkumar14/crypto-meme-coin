import { formatNumber } from '../lib/formatters';

export function OverviewStats({ coins, marketPulse }) {
  const aggregateMentions = coins.reduce((sum, coin) => sum + coin.social.mentions, 0);
  const aggregateEngagement = coins.reduce((sum, coin) => sum + coin.social.engagement, 0);
  const riskCount = coins.filter((coin) => coin.riskFlag).length;

  const items = [
    { label: 'Tracked Coins', value: coins.length, note: 'Live meme coin radar' },
    { label: 'Total Mentions', value: formatNumber(aggregateMentions), note: 'Cross-platform social velocity' },
    { label: 'Engagement', value: formatNumber(aggregateEngagement), note: 'Comments, replies, and interactions' },
    { label: 'Risk Alerts', value: riskCount, note: `${marketPulse.trendStrength} coins in breakout mode` },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="glass-panel rounded-3xl p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{item.label}</p>
          <p className="mt-3 text-3xl font-bold text-white">{item.value}</p>
          <p className="mt-2 text-sm text-slate-400">{item.note}</p>
        </div>
      ))}
    </section>
  );
}
