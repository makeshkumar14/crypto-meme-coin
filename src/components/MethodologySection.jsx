import { Activity, Droplets, BrainCircuit, Timer } from 'lucide-react';

const pillars = [
  {
    title: 'Social Hype Engine',
    body: 'Mentions, engagement, influencer activity, and fallback sentiment are blended into a normalized hype score.',
    icon: <Activity className="h-6 w-6 text-fuchsia-400" />,
    glow: 'shadow-[0_0_15px_rgba(232,121,249,0.15)]',
    bg: 'bg-fuchsia-500/10 border-fuchsia-500/20'
  },
  {
    title: 'Liquidity Stress Test',
    body: 'Dex liquidity, 24h volume, and price stability determine whether hype is structurally tradable or dangerously thin.',
    icon: <Droplets className="h-6 w-6 text-cyan-400" />,
    glow: 'shadow-[0_0_15px_rgba(34,211,238,0.15)]',
    bg: 'bg-cyan-500/10 border-cyan-500/20'
  },
  {
    title: 'Rule-Based Predictions',
    body: 'No heavy ML. The engine classifies Pump, Fake Hype, Early Trend, Stable, and Dump conditions using explicit signal thresholds.',
    icon: <BrainCircuit className="h-6 w-6 text-emerald-400" />,
    glow: 'shadow-[0_0_15px_rgba(52,211,153,0.15)]',
    bg: 'bg-emerald-500/10 border-emerald-500/20'
  },
  {
    title: 'Launch Window Logic',
    body: 'The dashboard estimates timing by combining trend direction, engagement quality, and whether competition looks overheated.',
    icon: <Timer className="h-6 w-6 text-amber-400" />,
    glow: 'shadow-[0_0_15px_rgba(251,191,36,0.15)]',
    bg: 'bg-amber-500/10 border-amber-500/20'
  },
];

export function MethodologySection() {
  return (
    <section id="methodology" className="glass-panel rounded-[2rem] p-5 sm:p-6 lg:p-8">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">How It Works</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Built to explain speculation, not hide behind black-box predictions</h3>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          MemeSense AI combines live market data with social signals and liquidity context to highlight hype that is strengthening,
          fading, or becoming risky. Every forecast is derived from readable rules so teams can trust the explanation layer.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {pillars.map((pillar) => (
          <div key={pillar.title} className="group rounded-[1.5rem] border border-white/10 bg-black/20 p-6 transition-all hover:bg-black/40 hover:-translate-y-1">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${pillar.bg} ${pillar.glow} mb-5 transition-transform group-hover:scale-110`}>
              {pillar.icon}
            </div>
            <h4 className="text-lg font-semibold text-white">{pillar.title}</h4>
            <p className="mt-3 text-sm leading-7 text-slate-400">{pillar.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
