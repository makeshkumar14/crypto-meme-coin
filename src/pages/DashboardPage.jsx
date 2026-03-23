import { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BLOCKCHAINS, getMarketPulse, summarizeSignals } from '../lib/analytics';
import { OverviewStats } from '../components/OverviewStats';
import { FiltersBar } from '../components/FiltersBar';
import { CoinGrid } from '../components/CoinGrid';
import { AlertsPanel } from '../components/AlertsPanel';
import { InsightPanel } from '../components/InsightPanel';
import { CoinDetailPanel } from '../components/CoinDetailPanel';
import { LaunchWindowCard } from '../components/LaunchWindowCard';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { SignalShowcase } from '../components/SignalShowcase';

export function DashboardPage() {
  const [chainFilter, setChainFilter] = useState('All');
  const [selectedCoinId, setSelectedCoinId] = useState(null);
  const { coins, loading, error, usingMockSocialData } = useAppContext();

  const filteredCoins = useMemo(() => {
    if (chainFilter === 'All') {
      return coins;
    }
    return coins.filter((coin) => coin.chain === chainFilter);
  }, [chainFilter, coins]);

  const selectedCoin = filteredCoins.find((coin) => coin.id === selectedCoinId) || filteredCoins[0];
  const marketPulse = getMarketPulse(filteredCoins);
  const insights = summarizeSignals(filteredCoins);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Track the market in one place</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
            Clean summaries for beginners, detailed coin cards for power users, and instant warnings when hype outruns liquidity.
          </p>
        </div>
      </section>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <OverviewStats coins={filteredCoins} marketPulse={marketPulse} />
          <SignalShowcase coins={filteredCoins} />
          <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="space-y-6">
              <FiltersBar chains={['All', ...BLOCKCHAINS]} activeChain={chainFilter} onChange={setChainFilter} />
              <CoinGrid coins={filteredCoins} selectedCoinId={selectedCoin?.id} onSelect={setSelectedCoinId} />
            </div>
            <div className="space-y-6">
              <AlertsPanel alerts={insights.alerts} error={error} />
              <InsightPanel insights={insights} usingMockSocialData={usingMockSocialData} />
              <CoinDetailPanel coin={selectedCoin} />
              <LaunchWindowCard launchWindow={selectedCoin?.launchSignal || insights.launchWindow} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
