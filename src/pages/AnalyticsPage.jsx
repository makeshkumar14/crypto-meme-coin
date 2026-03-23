import { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { HypeCycleChart } from '../components/HypeCycleChart';
import { MarketLeaderboard } from '../components/MarketLeaderboard';
import { formatCurrency, formatPercent } from '../lib/formatters';

export function AnalyticsPage() {
  const { coins, loading, error } = useAppContext();
  const [selectedCoinId, setSelectedCoinId] = useState(null);
  const selectedCoin = useMemo(() => coins.find((coin) => coin.id === selectedCoinId) || coins[0], [coins, selectedCoinId]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Analytics</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Hype analytics, but easier to understand</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
            Pick a token and watch how mentions, engagement, price, liquidity, and fake-hype risk move together over time.
          </p>
        </div>
      </section>

      {error ? <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-5 text-rose-100">{error}</div> : null}

      <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {coins.map((coin) => (
            <button
              key={coin.id}
              onClick={() => setSelectedCoinId(coin.id)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                selectedCoin?.id === coin.id
                  ? 'bg-cyan-400 text-slate-950'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {coin.symbol}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-6 h-80 rounded-3xl bg-white/5" />
        ) : selectedCoin ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Metric title="Selected Token" value={selectedCoin.name} detail={`${selectedCoin.prediction.icon} ${selectedCoin.prediction.label}`} />
              <Metric title="Price" value={formatCurrency(selectedCoin.price)} detail={formatPercent(selectedCoin.priceChange24h)} />
              <Metric title="Liquidity" value={`${selectedCoin.liquidityScore}/100`} detail={selectedCoin.liquidityClass.label} />
              <Metric title="Fake Hype Risk" value={`${selectedCoin.fakeHypeScore}/100`} detail={selectedCoin.fakeHypeSignal.label} />
            </div>
            <HypeCycleChart coin={selectedCoin} />
          </div>
        ) : null}
      </section>

      {!loading ? <MarketLeaderboard coins={coins} /> : null}
    </div>
  );
}

function Metric({ title, value, detail }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </div>
  );
}
