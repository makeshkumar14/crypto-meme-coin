export function FiltersBar({ chains, activeChain, onChange }) {
  return (
    <section className="glass-panel rounded-3xl p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Trending Coins Dashboard</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Filter by blockchain ecosystem</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {chains.map((chain) => {
            const active = chain === activeChain;
            return (
              <button
                key={chain}
                onClick={() => onChange(chain)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? 'bg-cyan-400 text-slate-950 shadow-neon'
                    : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                {chain}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
