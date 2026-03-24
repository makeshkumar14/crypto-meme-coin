import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchCoinChart } from '../lib/api';
import { formatCurrency } from '../lib/formatters';

const PERIOD_OPTIONS = [
  { label: '1D', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
];

function formatTime(timestamp, days) {
  const date = new Date(timestamp);
  if (days <= 1) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function sampleData(arr, maxPoints = 80) {
  if (!arr || arr.length <= maxPoints) return arr || [];
  const step = Math.ceil(arr.length / maxPoints);
  return arr.filter((_, i) => i % step === 0 || i === arr.length - 1);
}

export function TradingChart({ coin }) {
  const [days, setDays] = useState(7);
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!coin?.id) return;
    let cancelled = false;

    setLoading(true);
    setError('');

    fetchCoinChart(coin.id, days)
      .then((result) => {
        if (!cancelled) {
          setRawData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load chart data');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [coin?.id, days]);

  const { priceData, volumeData, isUp, priceChange, minPrice, maxPrice } = useMemo(() => {
    if (!rawData?.prices?.length) {
      return { priceData: [], volumeData: [], isUp: true, priceChange: 0, minPrice: 0, maxPrice: 0 };
    }

    const sampled = sampleData(rawData.prices);
    const sampledVol = sampleData(rawData.volumes);
    const first = sampled[0]?.v || 0;
    const last = sampled[sampled.length - 1]?.v || 0;
    const change = first > 0 ? ((last - first) / first) * 100 : 0;
    const prices = sampled.map((p) => p.v);

    return {
      priceData: sampled.map((p) => ({
        time: p.t,
        label: formatTime(p.t, days),
        price: p.v,
      })),
      volumeData: sampledVol.map((v) => ({
        time: v.t,
        label: formatTime(v.t, days),
        volume: v.v,
      })),
      isUp: change >= 0,
      priceChange: change,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [rawData, days]);

  const lineColor = isUp ? '#10b981' : '#f43f5e';
  const gradientId = `tradingGrad-${coin?.id || 'x'}`;

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => setDays(opt.days)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                days === opt.days
                  ? 'bg-cyan-400 text-slate-950'
                  : 'border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex h-[280px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <span className="text-sm text-slate-400">Loading chart data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !priceData.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-slate-400">
        {error || 'No chart data available for this coin.'}
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header: period selector and price change */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => setDays(opt.days)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                days === opt.days
                  ? 'bg-cyan-400 text-slate-950'
                  : 'border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white">{formatCurrency(priceData[priceData.length - 1]?.price)}</span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              isUp ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'
            }`}
          >
            {isUp ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
          </span>
          {/* Live pulse */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: lineColor }} />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lineColor }} />
          </span>
        </div>
      </div>

      {/* Price Area Chart */}
      <div className="h-[220px] w-full rounded-2xl border border-white/[0.06] bg-white/[0.015] p-2">
        <ResponsiveContainer>
          <AreaChart data={priceData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.35} />
                <stop offset="85%" stopColor={lineColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              domain={[minPrice * 0.995, maxPrice * 1.005]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={(v) => formatCurrency(v)}
              width={72}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(value) => [formatCurrency(value), 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Bar Chart */}
      <div className="h-[70px] w-full rounded-xl border border-white/[0.04] bg-white/[0.01] px-2">
        <ResponsiveContainer>
          <BarChart data={volumeData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <XAxis dataKey="label" hide />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                fontSize: '11px',
              }}
              formatter={(value) => [formatCurrency(value), 'Volume']}
            />
            <Bar
              dataKey="volume"
              fill="rgba(34,211,238,0.25)"
              radius={[2, 2, 0, 0]}
              isAnimationActive={true}
              animationDuration={1200}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
