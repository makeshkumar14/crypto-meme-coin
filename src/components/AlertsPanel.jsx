export function AlertsPanel({ alerts, error }) {
  return (
    <section className="glass-panel rounded-3xl p-5">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300/80">Alerts System</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Real-time style market alerts</h3>

      <div className="mt-4 space-y-3">
        {error ? (
          <AlertItem level="danger" message={`Data source warning: ${error}`} />
        ) : null}
        {alerts.map((alert) => (
          <AlertItem key={alert.message} level={alert.level} message={alert.message} />
        ))}
      </div>
    </section>
  );
}

function AlertItem({ level, message }) {
  const tones = {
    success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
    warning: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
    danger: 'border-rose-400/20 bg-rose-400/10 text-rose-100',
    info: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100',
  };

  return <div className={`rounded-2xl border p-4 text-sm leading-6 ${tones[level]}`}>{message}</div>;
}
