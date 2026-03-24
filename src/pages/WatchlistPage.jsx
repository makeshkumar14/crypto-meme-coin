import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../lib/formatters';

export function WatchlistPage() {
  const { watchlistCoins, watchlist, toggleWatchlist, reminders, user } = useAppContext();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Watchlist</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Your saved meme coins</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Save coins you want to revisit. Signed-in users also get backend-generated reminders when those coins start pumping, looking suspicious, or entering a cleaner launch window.
        </p>
      </section>

      {user && reminders.length ? (
        <section className="glass-panel rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Latest Watchlist Reminders</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {reminders.slice(0, 4).map((reminder) => (
              <div key={reminder.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-medium text-white">{reminder.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{reminder.message}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!watchlist.length ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center">
          <p className="text-lg text-slate-300">Your watchlist is empty.</p>
          <Link to="/markets" className="mt-5 inline-flex rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950">
            Browse markets
          </Link>
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {watchlistCoins.map((coin) => (
            <article key={coin.id} className="glass-panel rounded-3xl p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={coin.image} alt={coin.name} className="h-10 w-10 rounded-full border border-white/10" />
                  <div>
                    <h2 className="text-xl font-semibold text-white">{coin.name}</h2>
                    <p className="text-sm text-slate-400">{coin.symbol} • {coin.chain}</p>
                  </div>
                </div>
                <button onClick={() => toggleWatchlist(coin.id)} className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300">Remove</button>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric title="Price" value={formatCurrency(coin.price)} />
                <Metric title="Prediction" value={`${coin.prediction.icon} ${coin.prediction.label}`} />
                <Metric title="Hype" value={`${coin.hypeScore}/100`} />
                <Metric title="Fake Hype" value={`${coin.fakeHypeScore}/100`} />
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Launch Readiness</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{coin.launchSignal.detail}</p>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}
