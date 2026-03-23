export function OpportunitiesPanel({ coins }) {
  const topOpportunities = [...coins]
    .sort((a, b) => (b.hypeScore + b.liquidityScore) - (a.hypeScore + a.liquidityScore))
    .slice(0, 3);

  const cards = topOpportunities.map((coin) => ({
    title: coin.name,
    eyebrow: `${coin.prediction.icon} ${coin.prediction.label}`,
    detail: coin.riskFlag
      ? 'Crowd attention is outrunning market depth. Trade carefully.'
      : coin.launchSignal.detail,
    accent: coin.riskFlag ? 'from-rose-500/20 to-amber-500/10' : 'from-cyan-500/20 to-fuchsia-500/10',
  }));

  if (!cards.length) {
    return null;
  }

  return (
    <section id="opportunities" className="grid gap-4 lg:grid-cols-3">
      {cards.map((card) => (
        <article key={card.title} className={`overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br ${card.accent} p-5`}>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Opportunity Radar</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{card.title}</h3>
          <p className="mt-2 text-sm text-cyan-200">{card.eyebrow}</p>
          <p className="mt-4 text-sm leading-7 text-slate-200">{card.detail}</p>
        </article>
      ))}
    </section>
  );
}
