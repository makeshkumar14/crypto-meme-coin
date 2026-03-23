import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { summarizeSignals } from '../lib/analytics';
import { LaunchWindowCard } from '../components/LaunchWindowCard';

export function AlertsPage() {
  const { coins, loading, error, alertPreferences, updateAlertPreference } = useAppContext();
  const insights = useMemo(() => summarizeSignals(coins), [coins]);
  const preferenceItems = [
    { key: 'newTrends', label: 'New trend alerts', description: 'Highlight fresh momentum and early breakout setups.' },
    { key: 'fakeHype', label: 'Fake hype warnings', description: 'Warn when bot-like or inorganic activity is suspected.' },
    { key: 'dumps', label: 'Dump risk alerts', description: 'Flag weakening trends and sentiment breakdowns.' },
    { key: 'launchWindows', label: 'Launch window alerts', description: 'Show when timing conditions look favorable.' },
  ];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Alerts</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Alerts, launch windows, and beginner guidance</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          This page turns fast-moving market noise into short, readable decisions: what looks strong, what looks risky, and where you should wait.
        </p>
      </section>

      {error ? <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-5 text-rose-100">{error}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Live Alerts Feed</p>
          <div className="mt-4 space-y-3">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 rounded-2xl bg-white/5" />)
              : insights.alerts.map((alert) => (
                  <div key={alert.message} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-base text-white">{alert.message}</p>
                    <p className="mt-2 text-sm text-slate-400">Readable alert designed for new users, not just traders.</p>
                  </div>
                ))}
          </div>
        </div>

        <div className="space-y-6">
          <LaunchWindowCard launchWindow={insights.launchWindow} />
          <div className="glass-panel rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Alert Preferences</p>
            <div className="mt-4 space-y-3">
              {preferenceItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => updateAlertPreference(item.key)}
                  className="flex w-full items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]"
                >
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{item.description}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${
                      alertPreferences[item.key] ? 'bg-cyan-400 text-slate-950' : 'border border-white/10 text-slate-400'
                    }`}
                  >
                    {alertPreferences[item.key] ? 'On' : 'Off'}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Quick Start Guide</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <p>1. Start on Dashboard to compare hype and liquidity together.</p>
              <p>2. Open Analytics if a token looks interesting and check whether growth is consistent.</p>
              <p>3. Open Fake Hype Detector before trusting a sudden breakout with low liquidity.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
