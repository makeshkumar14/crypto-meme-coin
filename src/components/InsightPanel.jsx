export function InsightPanel({ insights, usingFallbackSocialData }) {
  return (
    <section className="glass-panel rounded-3xl p-5">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300/80">AI Insight / Explanation Box</p>
      <h3 className="mt-2 text-xl font-semibold text-white">{insights.headline}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{insights.body}</p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm leading-6 text-slate-300">
        {usingFallbackSocialData
          ? 'Social intelligence is blending live market inputs with transparent fallback social estimates whenever upstream providers are rate-limited.'
          : 'Predictions are currently backed by live market and social inputs, with the rule engine explaining each trend state clearly.'}
      </div>
    </section>
  );
}
