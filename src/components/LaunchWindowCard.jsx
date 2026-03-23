export function LaunchWindowCard({ launchWindow }) {
  if (!launchWindow) {
    return null;
  }

  const headline = launchWindow.headline || launchWindow.label;
  const body = launchWindow.body || launchWindow.detail;

  return (
    <section className="overflow-hidden rounded-3xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/15 via-slate-900/90 to-cyan-500/10 p-5 shadow-pulse">
      <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-200/70">Best Time To Launch</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">{headline}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-200">{body}</p>
    </section>
  );
}
