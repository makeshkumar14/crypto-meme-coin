export function LaunchWindowCard({ launchWindow }) {
  if (!launchWindow) {
    return null;
  }

  const headline = launchWindow.headline || launchWindow.label;
  const body = launchWindow.body || launchWindow.detail;
  const supportingCoins = launchWindow.supportingCoins || [];
  const nameIdeas = (launchWindow.nameSuggestions || []).slice(0, 3);

  return (
    <section className="overflow-hidden rounded-3xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/15 via-slate-900/90 to-cyan-500/10 p-5 shadow-pulse">
      <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-200/70">Best Time To Launch</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">{headline}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-200">{body}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric title="Window" value={launchWindow.bestWindow || 'Monitoring'} />
        <Metric title="Theme" value={launchWindow.leadingTheme || 'Mixed'} />
        <Metric title="Confidence" value={launchWindow.confidence ? `${launchWindow.confidence}%` : 'Low'} />
      </div>

      {launchWindow.reason ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Why This Call</p>
          <p className="mt-2 text-sm leading-7 text-slate-200">{launchWindow.reason}</p>
        </div>
      ) : null}

      {supportingCoins.length ? (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Tracked Leaders</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {supportingCoins.map((coinName) => (
              <span
                key={coinName}
                className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-2 text-sm text-fuchsia-100"
              >
                {coinName}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {nameIdeas.length ? (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Name Ideas</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {nameIdeas.map((idea) => (
              <span
                key={idea}
                className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100"
              >
                {idea}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Metric({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{title}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
