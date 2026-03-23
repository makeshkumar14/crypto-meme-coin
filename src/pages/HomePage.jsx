import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { OpportunitiesPanel } from '../components/OpportunitiesPanel';
import { MarketLeaderboard } from '../components/MarketLeaderboard';
import { MethodologySection } from '../components/MethodologySection';
import { SignalShowcase } from '../components/SignalShowcase';

const beginnerCards = [
  {
    title: 'Start With The Dashboard',
    body: 'See trending meme coins, liquidity, social heat, and the rule-based prediction for each token in one place.',
    to: '/dashboard',
  },
  {
    title: 'Explore The Analytics Lab',
    body: 'Switch between tokens and inspect mentions, engagement, price movement, and conviction signals in a cleaner chart-first view.',
    to: '/analytics',
  },
  {
    title: 'Check For Fake Hype',
    body: 'Spot suspicious bot-like activity, low-liquidity hype bursts, and signals that look manufactured instead of organic.',
    to: '/detector',
  },
];

export function HomePage() {
  const { coins, loading, error } = useAppContext();
  const topCoin = coins[0];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-fuchsia-500/10 p-8 sm:p-10">
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.95fr] lg:items-center">
          <div className="space-y-5">
            <p className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs tracking-[0.35em] text-cyan-200">
              New-user friendly meme coin analytics
            </p>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl tracking-[0.2em] text-cyan-50">
              Follow meme coin momentum without getting lost in crypto noise.
            </h1>
            <p className="max-w-2xl text-sm leading-7 tracking-[0.15em] text-cyan-200/70">
              MemeSense AI turns hype, sentiment, liquidity, and suspicious activity into clean explanations. Start on the main page,
              dive into charts when you want more depth, and use the fake-hype detector before trusting a breakout.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard" className="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-300">
                Open dashboard
              </Link>
              <Link to="/signup" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10">
                Create account
              </Link>
            </div>
          </div>

          <div className="glass-panel rounded-[1.75rem] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Live Snapshot</p>
            {loading ? (
              <div className="mt-4 space-y-3">
                <div className="h-16 rounded-2xl bg-white/5" />
                <div className="h-16 rounded-2xl bg-white/5" />
                <div className="h-16 rounded-2xl bg-white/5" />
              </div>
            ) : error ? (
              <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                Data is temporarily unavailable. The site layout still works, but the live dashboard needs the backend running.
              </div>
            ) : topCoin ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">Top trend right now</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{topCoin.prediction.icon} {topCoin.name}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{topCoin.explanation}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Hype Score</p>
                    <p className="mt-2 text-3xl font-bold text-cyan-200">{topCoin.hypeScore}/100</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Fake Hype Risk</p>
                    <p className="mt-2 text-3xl font-bold text-fuchsia-200">{topCoin.fakeHypeScore}/100</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {!loading && !error ? <SignalShowcase coins={coins} /> : null}

      <section className="grid gap-4 md:grid-cols-3">
        {beginnerCards.map((card) => (
          <article key={card.title} className="glass-panel rounded-3xl p-6">
            <h2 className="text-2xl font-semibold text-white">{card.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{card.body}</p>
            <Link to={card.to} className="mt-5 inline-flex text-sm font-medium text-cyan-200 transition hover:text-cyan-100">
              Explore section →
            </Link>
          </article>
        ))}
      </section>

      {!loading && !error ? <OpportunitiesPanel coins={coins} /> : null}
      {!loading && !error ? <MarketLeaderboard coins={coins} /> : null}
      <MethodologySection />
    </div>
  );
}
