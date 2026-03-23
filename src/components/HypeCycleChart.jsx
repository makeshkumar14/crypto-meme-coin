import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency, formatNumber } from '../lib/formatters';

export function HypeCycleChart({ coin }) {
  if (!coin) {
    return null;
  }

  return (
    <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Hype Cycle Visualization</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{coin.name} signal trajectory</h3>
        </div>
        <p className="text-sm text-slate-400">Mentions, engagement, and price over the last 7 intervals</p>
      </div>

      <div className="mt-6 h-[360px] w-full">
        <ResponsiveContainer>
          <LineChart data={coin.timeSeries}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke="#94a3b8" />
            <YAxis yAxisId="left" stroke="#94a3b8" />
            <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
              }}
              formatter={(value, name) => {
                if (name === 'price') {
                  return [formatCurrency(value), 'Price'];
                }
                return [formatNumber(value), name === 'mentions' ? 'Mentions' : 'Engagement'];
              }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="mentions" stroke="#00f5d4" strokeWidth={3} dot={false} />
            <Line yAxisId="left" type="monotone" dataKey="engagement" stroke="#ff4fd8" strokeWidth={3} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="price" stroke="#fbbf24" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
