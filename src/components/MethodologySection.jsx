const pillars = [
  {
    title: 'Social Hype Engine',
    body: 'Mentions, engagement, influencer activity, and fallback sentiment are blended into a normalized hype score.',
  },
  {
    title: 'Liquidity Stress Test',
    body: 'Dex liquidity, 24h volume, and price stability determine whether hype is structurally tradable or dangerously thin.',
  },
  {
    title: 'Rule-Based Predictions',
    body: 'No heavy ML. The engine classifies Pump, Fake Hype, Early Trend, Stable, and Dump conditions using explicit signal thresholds.',
  },
  {
    title: 'Launch Window Logic',
    body: 'The dashboard estimates timing by combining trend direction, engagement quality, and whether competition looks overheated.',
  },
];

export function MethodologySection() {
  return (
    <section id="methodology" className="glass-panel rounded-[2rem] p-5 sm:p-6">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">How It Works</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Built to explain speculation, not hide behind black-box predictions</h3>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          MemeSense AI combines live market data with social signals and liquidity context to highlight hype that is strengthening,
          fading, or becoming risky. Every forecast is derived from readable rules so teams can trust the explanation layer.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {pillars.map((pillar) => (
          <div key={pillar.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h4 className="text-lg font-semibold text-white">{pillar.title}</h4>
            <p className="mt-3 text-sm leading-7 text-slate-300">{pillar.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
