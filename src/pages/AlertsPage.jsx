import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { summarizeSignals } from '../lib/analytics';
import { LaunchAdvisorPanel } from '../components/LaunchAdvisorPanel';
import { LaunchWindowCard } from '../components/LaunchWindowCard';
import { useState } from 'react';

export function AlertsPage() {
  const {
    coins,
    loading,
    error,
    alertPreferences,
    updateAlertPreference,
    reminderSettings,
    updateReminderPreference,
    reminders,
    launchAdvisor,
    user,
    sendingReminderEmail,
    triggerReminderEmail,
  } = useAppContext();
  const [emailStatus, setEmailStatus] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const insights = useMemo(() => summarizeSignals(coins), [coins]);
  const preferenceItems = [
    { key: 'newTrends', label: 'New trend alerts', description: 'Highlight fresh momentum and early breakout setups.' },
    { key: 'fakeHype', label: 'Fake hype warnings', description: 'Warn when bot-like or inorganic activity is suspected.' },
    { key: 'dumps', label: 'Dump risk alerts', description: 'Flag weakening trends and sentiment breakdowns.' },
    { key: 'launchWindows', label: 'Launch window alerts', description: 'Show when timing conditions look favorable.' },
  ];
  const reminderItems = [
    { key: 'enabled', label: 'Realtime reminders', description: 'Turn backend-generated reminder cards on or off.' },
    { key: 'emailDigest', label: 'Email digest', description: 'Send scheduled reminder emails when new watchlist signals appear.' },
    { key: 'wishlistAlerts', label: 'Wishlist reminders', description: 'Focus reminders on the meme coins saved to your watchlist.' },
    { key: 'riskAlerts', label: 'Risk alerts', description: 'Keep high fake-hype and dump warnings in your reminder queue.' },
  ];

  async function handleSendTestEmail() {
    setEmailStatus('');

    try {
      const result = await triggerReminderEmail(testEmail.trim());
      setEmailStatus(
        result.sent
          ? 'Reminder email sent successfully.'
          : 'No email was sent because there are no active reminders yet.',
      );
    } catch (sendError) {
      setEmailStatus(sendError.message || 'Unable to send reminder email right now.');
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Alerts</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Alerts, launch timing, and personal reminders</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          This page turns market noise into readable actions: what looks strong, what looks risky, and which watchlist coins deserve your attention now.
        </p>
      </section>

      {error ? <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-5 text-rose-100">{error}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Reminder Feed</p>
            <div className="mt-4 space-y-3">
              {loading
                ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 rounded-2xl bg-white/5" />)
                : reminders.length
                  ? reminders.map((reminder) => (
                      <div key={reminder.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-base font-medium text-white">{reminder.title}</p>
                        <p className="mt-2 text-sm leading-7 text-slate-300">{reminder.message}</p>
                      </div>
                    ))
                  : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-300">
                      {user
                        ? 'No urgent watchlist reminders right now. Your saved coins are still being monitored by the backend.'
                        : 'Sign in to turn this into a personal reminder feed for your saved meme coins.'}
                    </div>
                  )}
            </div>
          </div>

          <LaunchAdvisorPanel advisor={launchAdvisor || insights.launchAdvisor} />
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
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Reminder Settings</p>
            <div className="mt-4 grid gap-3">
              <input
                value={testEmail}
                onChange={(event) => setTestEmail(event.target.value)}
                placeholder={user?.email || 'Test recipient email'}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
              />
              <p className="text-xs text-slate-400">
                Leave this blank to send to the signed-in account email, or enter a real inbox for testing.
              </p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={handleSendTestEmail}
                disabled={!user || sendingReminderEmail}
                className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingReminderEmail ? 'Sending...' : 'Send test email'}
              </button>
              <p className="text-xs text-slate-400">
                Requires backend email config and at least one active watchlist reminder.
              </p>
            </div>
            {emailStatus ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200">
                {emailStatus}
              </div>
            ) : null}
            <div className="mt-4 space-y-3">
              {reminderItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => updateReminderPreference(item.key)}
                  className="flex w-full items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]"
                >
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{item.description}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${
                      reminderSettings[item.key] ? 'bg-fuchsia-400 text-slate-950' : 'border border-white/10 text-slate-400'
                    }`}
                  >
                    {reminderSettings[item.key] ? 'On' : 'Off'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Quick Start Guide</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <p>1. Save meme coins to your watchlist so the reminder engine can prioritize them.</p>
              <p>2. Use the launch advisor to see whether the current meme cycle is ready for a new token concept.</p>
              <p>3. Ask the chat assistant why a coin looks strong, weak, or suspicious before making decisions.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
