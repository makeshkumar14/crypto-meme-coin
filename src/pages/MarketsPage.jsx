import { useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, formatPercent } from '../lib/formatters';
import { CoinMetricsChart } from '../components/CoinMetricsChart';

const CHAINS = ['All', 'Ethereum', 'Solana', 'Bitcoin'];
const PAGE_SIZE = 8;

export function MarketsPage() {
  const { coins, loading, error, watchlist, toggleWatchlist } = useAppContext();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('hype');
  const [chainFilter, setChainFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCoinId, setExpandedCoinId] = useState(null);

  const filteredCoins = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    const result = coins.filter((coin) => {
      const matchesSearch = `${coin.name} ${coin.symbol} ${coin.chain}`.toLowerCase().includes(normalized);
      const matchesChain = chainFilter === 'All' || coin.chain === chainFilter;
      return matchesSearch && matchesChain;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'hype') return b.hypeScore - a.hypeScore;
      if (sortBy === 'liquidity') return b.liquidityScore - a.liquidityScore;
      if (sortBy === 'fakeHype') return b.fakeHypeScore - a.fakeHypeScore;
      if (sortBy === 'volume') return b.volume - a.volume;
      return b.marketCap - a.marketCap;
    });
  }, [coins, query, sortBy, chainFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCoins.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedCoins = filteredCoins.slice((currentPageSafe - 1) * PAGE_SIZE, currentPageSafe * PAGE_SIZE);

  function handleToggleExpand(coinId) {
    setExpandedCoinId((prev) => (prev === coinId ? null : coinId));
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Markets</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Explore more tokens like a market data site</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            This page expands the product beyond the curated dashboard so you can browse a broader token universe with cleaner explanations.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search token, symbol, or chain"
            className="w-72 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-cyan-300/40"
          />

        </div>
      </section>

      {error ? <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-5 text-rose-100">{error}</div> : null}

      <section className="glass-panel rounded-3xl p-4">
        <div className="flex flex-wrap gap-2">
          {CHAINS.map((chain) => (
            <button
              key={chain}
              onClick={() => {
                setChainFilter(chain);
                setCurrentPage(1);
              }}
              className={`rounded-full px-4 py-2 text-sm transition ${
                chainFilter === chain
                  ? 'bg-cyan-400 text-slate-950'
                  : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10'
              }`}
            >
              {chain}
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]">
        <div className="hidden grid-cols-[0.5fr_1.6fr_repeat(6,1fr)_0.8fr_0.6fr] gap-3 border-b border-white/10 bg-white/[0.04] px-5 py-4 text-xs uppercase tracking-[0.25em] text-slate-500 xl:grid">
          <span>#</span>
          <span>Name</span>
          <span>Price</span>
          <span>24h</span>
          <span>Market Cap</span>
          <span>Hype</span>
          <span>Liquidity</span>
          <span>Fake Hype</span>
          <span>Save</span>
          <span>View</span>
        </div>

        <div className="divide-y divide-white/10">
          {(loading ? [] : paginatedCoins).map((coin, index) => (
            <div key={coin.id}>
              <div className="grid gap-3 px-5 py-4 xl:grid-cols-[0.5fr_1.6fr_repeat(6,1fr)_0.8fr_0.6fr] xl:items-center">
                <span className="text-sm text-slate-500">{(currentPageSafe - 1) * PAGE_SIZE + index + 1}</span>
                <div className="flex items-center gap-3">
                  <img src={coin.image} alt={coin.name} className="h-10 w-10 rounded-full border border-white/10" />
                  <div>
                    <p className="font-semibold text-white">{coin.name}</p>
                    <p className="text-sm text-slate-400">{coin.symbol} • {coin.chain}</p>
                  </div>
                </div>
                <span className="text-sm text-white">{formatCurrency(coin.price)}</span>
                <span className={`text-sm ${coin.priceChange24h >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{formatPercent(coin.priceChange24h)}</span>
                <span className="text-sm text-white">{formatCurrency(coin.marketCap)}</span>
                <span className="text-sm text-white">{coin.hypeScore}/100</span>
                <span className="text-sm text-white">{coin.liquidityScore}/100</span>
                <span className="text-sm text-white">{coin.fakeHypeScore}/100</span>
                <button
                  onClick={() => toggleWatchlist(coin.id)}
                  className={`rounded-full px-3 py-2 text-sm ${watchlist.includes(coin.id) ? 'bg-cyan-400 text-slate-950' : 'border border-white/10 text-slate-300'}`}
                >
                  {watchlist.includes(coin.id) ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => handleToggleExpand(coin.id)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                    expandedCoinId === coin.id
                      ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-300'
                      : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-cyan-300/30 hover:text-cyan-200'
                  }`}
                  title={expandedCoinId === coin.id ? 'Hide chart' : 'View chart'}
                >
                  {expandedCoinId === coin.id ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {expandedCoinId === coin.id && (
                <div className="border-t border-white/[0.06] bg-white/[0.01] px-5 py-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <CoinMetricsChart coin={coin} />
                </div>
              )}
            </div>
          ))}

          {loading ? <div className="p-10 text-slate-400">Loading market table...</div> : null}
          {!loading && !filteredCoins.length ? <div className="p-10 text-slate-400">No tokens matched your search.</div> : null}
        </div>
      </section>

      {!loading && filteredCoins.length ? (
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            Showing {(currentPageSafe - 1) * PAGE_SIZE + 1}-{Math.min(currentPageSafe * PAGE_SIZE, filteredCoins.length)} of {filteredCoins.length} tokens
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPageSafe === 1}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white">
              Page {currentPageSafe} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPageSafe === totalPages}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
