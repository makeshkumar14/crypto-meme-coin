export function LaunchAdvisorPanel({ advisor }) {
  if (!advisor) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-slate-900/90 to-fuchsia-500/10 p-5 shadow-neon">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Launch Advisor</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">{advisor.headline}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-200">{advisor.body}</p>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Metric title="Best Window" value={advisor.bestWindow} />
        <Metric title="Confidence" value={`${advisor.confidence}%`} />
        <Metric title="Lead Meme" value={advisor.bestCoinName || 'Watching market'} />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Why</p>
        <p className="mt-2 text-sm leading-7 text-slate-200">{advisor.reason}</p>
      </div>

      {advisor.nameSuggestions?.length ? (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Name Ideas</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {advisor.nameSuggestions.map((suggestion) => (
              <span
                key={suggestion}
                className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100"
              >
                {suggestion}
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
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}
