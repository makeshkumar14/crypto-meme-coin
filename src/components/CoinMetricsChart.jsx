import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { formatCurrency, formatPercent } from '../lib/formatters';
import { TradingChart } from './TradingChart';

function normalize(value, max) {
  return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
}

const metricColors = {
  Price: '#22d3ee',
  '24h Change': '#fbbf24',
  'Market Cap': '#a78bfa',
  Hype: '#00f5d4',
  Liquidity: '#3b82f6',
  'Fake Hype': '#f43f5e',
};

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

const TABS = [
  { key: 'chart', label: '📈 Chart' },
  { key: 'radar', label: '🎯 Radar' },
];

export function CoinMetricsChart({ coin }) {
  const [activeTab, setActiveTab] = useState('chart');

  const radarData = useMemo(() => {
    if (!coin) return [];

    return [
      { metric: 'Price', value: normalize(coin.price, 1), fullMark: 100 },
      { metric: '24h Change', value: Math.min(100, Math.max(0, 50 + coin.priceChange24h * 2)), fullMark: 100 },
      { metric: 'Market Cap', value: normalize(coin.marketCap, 50_000_000_000), fullMark: 100 },
      { metric: 'Hype', value: coin.hypeScore, fullMark: 100 },
      { metric: 'Liquidity', value: coin.liquidityScore, fullMark: 100 },
      { metric: 'Fake Hype', value: coin.fakeHypeScore, fullMark: 100 },
    ];
  }, [coin]);

  const barMetrics = useMemo(() => {
    if (!coin) return [];
    return [
      { label: 'Price', value: formatCurrency(coin.price), raw: coin.price, color: metricColors.Price },
      { label: '24h', value: formatPercent(coin.priceChange24h), raw: coin.priceChange24h, color: metricColors['24h Change'], isPercent: true },
      { label: 'Market Cap', value: formatCurrency(coin.marketCap), raw: coin.marketCap, color: metricColors['Market Cap'] },
      { label: 'Hype', value: `${coin.hypeScore}/100`, raw: coin.hypeScore, color: metricColors.Hype, max: 100 },
      { label: 'Liquidity', value: `${coin.liquidityScore}/100`, raw: coin.liquidityScore, color: metricColors.Liquidity, max: 100 },
      { label: 'Fake Hype', value: `${coin.fakeHypeScore}/100`, raw: coin.fakeHypeScore, color: metricColors['Fake Hype'], max: 100 },
    ];
  }, [coin]);

  if (!coin) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-slate-900/80 p-5 backdrop-blur-sm">
      {/* Tab Selector */}
      <div className="mb-5 flex items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                : 'border border-white/10 text-slate-400 hover:border-cyan-300/30 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full border border-white/10" />
          <span className="text-sm font-semibold text-white">{coin.name}</span>
          <span className="text-xs text-slate-500">{coin.symbol}</span>
        </div>
      </div>

      {/* Chart Tab */}
      {activeTab === 'chart' && <TradingChart coin={coin} />}

      {/* Radar Tab */}
      {activeTab === 'radar' && (
        <motion.div
          className="grid gap-6 md:grid-cols-[1fr_1.2fr]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Radar Chart */}
          <motion.div
            className="relative flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-slate-500">Metric Radar</p>

            {/* Pulsing glow ring behind the radar */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[42%]">
              <div className="h-[260px] w-[260px] animate-[pulse_1.8s_ease-in-out_infinite] rounded-full bg-cyan-400/[0.12] blur-3xl" />
              <div className="absolute inset-4 animate-[pulse_2.4s_ease-in-out_infinite_0.6s] rounded-full bg-fuchsia-500/[0.08] blur-2xl" />
            </div>

            <div className="relative h-[280px] w-full max-w-[340px]">
              <ResponsiveContainer>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '13px',
                    }}
                    formatter={(value, name) => [`${Math.round(value)}`, name]}
                  />
                  <Radar
                    name={coin.name}
                    dataKey="value"
                    stroke="#22d3ee"
                    fill="url(#radarGradient)"
                    fillOpacity={0.45}
                    strokeWidth={2}
                    isAnimationActive={true}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                  <defs>
                    <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#d946ef" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Live indicator dot */}
            <div className="mt-2 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-90" />
                <span className="absolute inline-flex h-full w-full animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-cyan-300 opacity-50" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              </span>
              <motion.span
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >Live result</motion.span>
            </div>
          </motion.div>

          {/* Metric Bars */}
          <motion.div
            className="flex flex-col justify-center gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="mb-1 text-xs uppercase tracking-[0.25em] text-slate-500">Metric Breakdown</p>
            {barMetrics.map((m, i) => {
              const barWidth = m.max ? (m.raw / m.max) * 100 : (m.isPercent ? Math.min(100, Math.max(0, 50 + m.raw * 2)) : 50);
              return (
                <motion.div key={m.label} variants={itemVariants}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">{m.label}</span>
                    <motion.span
                      className="text-xs font-bold"
                      style={{ color: m.color, textShadow: `0 0 8px ${m.color}66` }}
                      animate={{ opacity: [1, 0.25, 1], scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.6, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {m.value}
                    </motion.span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(3, Math.min(100, barWidth))}%` }}
                      transition={{ duration: 0.9, delay: 0.15 + i * 0.1, ease: 'easeOut' }}
                      style={{
                        background: `linear-gradient(90deg, ${m.color}, ${m.color}88)`,
                        boxShadow: `0 0 16px ${m.color}66`,
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
