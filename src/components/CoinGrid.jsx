import { CoinCard } from './CoinCard';

export function CoinGrid({ coins, onSelect, selectedCoinId }) {
  if (!coins.length) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center text-slate-400">
        No coins matched the current blockchain filter.
      </div>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {coins.map((coin) => (
        <CoinCard
          key={coin.id}
          coin={coin}
          isSelected={coin.id === selectedCoinId}
          onSelect={() => onSelect(coin.id)}
        />
      ))}
    </section>
  );
}
