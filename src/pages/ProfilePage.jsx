import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export function ProfilePage() {
  const { user, watchlist, coins } = useAppContext();

  if (!user) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center">
        <h1 className="text-4xl font-bold text-white">Create your profile</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">Sign in or sign up to personalize your watchlist and make the dashboard feel like your own workspace.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/signin" className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-white">Sign in</Link>
          <Link to="/signup" className="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950">Sign up</Link>
        </div>
      </div>
    );
  }

  const highRiskSaved = coins.filter((coin) => watchlist.includes(coin.id) && coin.fakeHypeScore >= 60).length;

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Profile</p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">{user.name}</h1>
            <p className="mt-2 text-sm text-slate-400">{user.email}</p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-2xl font-bold text-cyan-200">
            {user.initials}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric title="Saved tokens" value={watchlist.length} note="Coins in your watchlist" />
        <Metric title="High fake-hype risk" value={highRiskSaved} note="Saved tokens with suspicious activity" />
        <Metric title="Live token universe" value={coins.length} note="Tracked tokens currently available" />
      </section>
    </div>
  );
}

function Metric({ title, value, note }) {
  return (
    <div className="glass-panel rounded-3xl p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{note}</p>
    </div>
  );
}
