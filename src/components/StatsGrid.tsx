import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  XCircle,
  Crown,
  Percent,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Activity,
  Flame,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { AppStats, WingoHistoryRecord } from '../types';
import { ThemeDef } from '../utils/theme';

interface StatsGridProps {
  stats: AppStats;
  history?: WingoHistoryRecord[];
  isDarkTheme?: boolean;
  theme?: ThemeDef;
}

export const StatsGrid: React.FC<StatsGridProps> = React.memo(({
  stats,
  history = [],
  isDarkTheme = false,
  theme,
}) => {
  const [showChart, setShowChart] = useState(true);
  const [chartInterval, setChartInterval] = useState<'10' | '25' | '50' | 'all'>('25');

  const total = stats.wins + stats.losses;
  const winRate = total > 0 ? ((stats.wins / total) * 100).toFixed(1) : '0.0';

  const statCards = [
    {
      label: 'TOTAL WINS',
      value: stats.wins,
      icon: Trophy,
      color: theme?.isDark ? 'text-emerald-300' : 'text-[#006b28]',
      customColor: theme ? (theme.isDark ? theme.accent : theme.primary) : undefined,
      bgGlow: 'bg-emerald-500/10 border-emerald-500/25',
      iconBg: 'bg-[#00b84a] text-white',
      customIconBg: theme ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : undefined,
    },
    {
      label: 'WIN ACCURACY',
      value: `${winRate}%`,
      icon: Percent,
      color: 'text-sky-700 dark:text-sky-300',
      bgGlow: 'bg-sky-500/10 border-sky-500/25',
      iconBg: 'bg-sky-500 text-white',
    },
    {
      label: 'JACKPOTS',
      value: stats.jacks,
      icon: Crown,
      color: 'text-amber-800 dark:text-amber-300',
      bgGlow: 'bg-amber-500/10 border-amber-500/25',
      iconBg: 'bg-amber-500 text-white',
    },
    {
      label: 'LOSSES',
      value: stats.losses,
      icon: XCircle,
      color: 'text-rose-800 dark:text-rose-300',
      bgGlow: 'bg-rose-500/10 border-rose-500/25',
      iconBg: 'bg-rose-500 text-white',
    },
  ];

  // Process history for Recharts Win/Loss Ratio Over Time
  const chartData = useMemo(() => {
    if (!history || history.length === 0) {
      return [];
    }

    // History is newest first, reverse for chronological timeline
    const chronological = [...history].reverse();
    const limit = chartInterval === 'all' ? chronological.length : parseInt(chartInterval, 10);
    const selected = chronological.slice(-limit);

    let cumulativeWins = 0;
    let cumulativeLosses = 0;

    return selected.map((record, index) => {
      const isWin = record.result === 'WIN' || record.result === 'JACKPOT';
      const isLoss = record.result === 'LOSS';
      const isSkip = record.result === 'SKIPPED' || record.isSkip;

      if (isWin) cumulativeWins++;
      if (isLoss) cumulativeLosses++;

      const currentTotal = cumulativeWins + cumulativeLosses;
      const currentRatio = currentTotal > 0 ? Math.round((cumulativeWins / currentTotal) * 100) : 50;

      const periodLabel = (record.period || '').slice(-3) || `#${index + 1}`;

      return {
        index: index + 1,
        period: periodLabel,
        fullPeriod: record.period,
        winRate: currentRatio,
        result: record.result || (isWin ? 'WIN' : isLoss ? 'LOSS' : 'SKIPPED'),
        predicted: record.focusTarget || record.predicted || 'BIG',
        actualNum: record.actualNum !== undefined ? record.actualNum : '?',
        isWin,
        isJackpot: record.result === 'JACKPOT',
        timestamp: record.timestamp || '',
      };
    });
  }, [history, chartInterval]);

  // Current session momentum
  const momentum = useMemo(() => {
    if (stats.streak >= 3) return { label: `${stats.streak}x WIN STREAK`, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
    if (stats.lossRun >= 2) return { label: `${stats.lossRun}x MARTINGALE RECOVERY ACTIVE`, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/15 border-amber-500/30' };
    if (Number(winRate) >= 75 && total >= 5) return { label: 'HIGH WIN EFFICIENCY', color: 'text-sky-600 dark:text-sky-400 bg-sky-500/15 border-sky-500/30' };
    return { label: 'DYNAMIC CALIBRATION', color: 'text-[#006b28] dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  }, [stats, winRate, total]);

  return (
    <div className="space-y-2.5 mb-3">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-2xl border p-3 flex flex-col justify-between ${
                isDarkTheme ? 'liquid-glass-dark' : 'liquid-glass'
              } ${card.bgGlow} shadow-sm transition-all duration-300`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#3d5c47] dark:text-slate-400 uppercase">
                  {card.label}
                </span>
                <div
                  className={`w-6 h-6 rounded-xl ${card.iconBg} flex items-center justify-center shadow-sm`}
                  style={{ background: card.customIconBg }}
                >
                  <Icon size={13} />
                </div>
              </div>
              <div
                className={`font-space font-black text-xl sm:text-2xl ${card.color}`}
                style={{ color: card.customColor }}
              >
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Integrated Win/Loss Ratio Over Time Recharts Card */}
      <div
        className={`rounded-2xl border p-3 sm:p-4 ${
          isDarkTheme ? 'liquid-glass-dark' : 'liquid-glass'
        } border-emerald-500/25 shadow-sm transition-all`}
        style={{ borderColor: theme ? `${theme.primary}35` : undefined }}
      >
        {/* Header with Interval Selectors & Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-emerald-500/15">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${theme?.primary || '#00e676'}, ${theme?.secondary || '#00b84a'})`,
                boxShadow: `0 4px 12px ${theme?.glowColor || 'rgba(0, 230, 118, 0.3)'}`,
              }}
            >
              <TrendingUp size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-space font-black text-xs text-[#111b15] dark:text-white">
                  WIN / LOSS RATIO OVER TIME
                </span>
                <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border ${momentum.color}`}>
                  {momentum.label}
                </span>
              </div>
              <p className="text-[10.5px] text-[#3d5c47] dark:text-slate-400 font-medium">
                Live predictor effectiveness &amp; cumulative win percentage curve
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {/* Interval Filters */}
            <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-300 dark:border-slate-700">
              {(['10', '25', '50', 'all'] as const).map((int) => {
                const isSelected = chartInterval === int;
                return (
                  <button
                    key={int}
                    onClick={() => setChartInterval(int)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-black transition-all ${
                      isSelected
                        ? 'text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    style={{
                      background: isSelected
                        ? (theme?.primary || '#00b84a')
                        : undefined,
                      boxShadow: isSelected && theme ? `0 2px 8px ${theme.glowColor}` : undefined,
                    }}
                  >
                    {int === 'all' ? 'ALL' : `${int}R`}
                  </button>
                );
              })}
            </div>

            {/* Expand / Collapse Button */}
            <button
              onClick={() => setShowChart(!showChart)}
              className="p-1.5 rounded-xl liquid-pill text-slate-700 dark:text-slate-200 transition-all hover:scale-105"
              style={{ borderColor: theme ? `${theme.primary}30` : undefined }}
              title={showChart ? 'Collapse Chart' : 'Expand Chart'}
            >
              {showChart ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
        </div>

        {/* Chart Body */}
        <AnimatePresence>
          {showChart && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="pt-3 space-y-2.5 overflow-hidden"
            >
              {chartData.length >= 2 ? (
                <>
                  <div className="h-48 w-full p-2 rounded-2xl bg-black/5 dark:bg-black/40 border border-emerald-500/15 shadow-inner relative overflow-hidden"
                    style={{ borderColor: theme ? `${theme.primary}25` : undefined }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 12, right: 12, left: -22, bottom: 4 }}
                      >
                        <defs>
                          <linearGradient id="winRateGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={theme?.primary || '#00e676'} stopOpacity={0.5} />
                            <stop offset="50%" stopColor={theme?.secondary || '#00b84a'} stopOpacity={0.15} />
                            <stop offset="100%" stopColor={theme?.primary || '#00e676'} stopOpacity={0.0} />
                          </linearGradient>
                          <filter id="statsLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={theme?.primary || '#00e676'} floodOpacity="0.6" />
                          </filter>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={isDarkTheme ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="period"
                          stroke={isDarkTheme ? '#64748b' : '#94a3b8'}
                          fontSize={9}
                          tickLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          domain={[0, 100]}
                          stroke={isDarkTheme ? '#64748b' : '#94a3b8'}
                          fontSize={9}
                          tickLine={false}
                          ticks={[0, 25, 50, 75, 100]}
                          unit="%"
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const isWin = data.isWin;
                              const isJackpot = data.isJackpot;
                              return (
                                <div
                                  className="p-3 rounded-2xl bg-slate-950/95 text-white border shadow-2xl backdrop-blur-xl text-xs font-mono space-y-1.5"
                                  style={{ borderColor: theme?.primary || '#00e676' }}
                                >
                                  <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 border-b border-white/10 pb-1">
                                    <span>Period #{data.fullPeriod || data.period}</span>
                                    <span>{data.timestamp || 'Live Draw'}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-3 pt-0.5">
                                    <span className="font-bold text-slate-300">Win Rate:</span>
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="font-space font-black text-sm"
                                        style={{ color: theme?.primary || '#00e676' }}
                                      >
                                        {data.winRate}%
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between gap-3 text-[11px]">
                                    <span className="text-slate-400">Result:</span>
                                    <span
                                      className={`font-black px-1.5 py-0.5 rounded text-[10px] ${
                                        isJackpot
                                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                          : isWin
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                      }`}
                                    >
                                      {data.result} (Ball #{data.actualNum})
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 pt-0.5 border-t border-white/10">
                                    <span>Engine Pick:</span>
                                    <span className="font-bold text-white">[{data.predicted}]</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {/* 80% Benchmark Reference Line */}
                        <ReferenceLine
                          y={80}
                          stroke={theme?.accent || '#38bdf8'}
                          strokeDasharray="4 3"
                          strokeOpacity={0.8}
                          label={{
                            value: '80% PRO TARGET',
                            fill: theme?.accent || '#38bdf8',
                            fontSize: 8.5,
                            position: 'insideTopRight',
                          }}
                        />
                        {/* 50% Equilibrium Baseline */}
                        <ReferenceLine
                          y={50}
                          stroke={isDarkTheme ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}
                          strokeDasharray="2 2"
                        />
                        <Area
                          type="monotone"
                          dataKey="winRate"
                          stroke={theme?.primary || '#00e676'}
                          strokeWidth={2.75}
                          fillOpacity={1}
                          fill="url(#winRateGradient)"
                          filter="url(#statsLineGlow)"
                          dot={(props: any) => {
                            const { cx, cy, payload, index } = props;
                            const isWin = payload.isWin;
                            const isJack = payload.isJackpot;
                            const isLatest = index === chartData.length - 1;
                            return (
                              <g key={`dot-g-${payload.index}`}>
                                {isLatest && (
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={8}
                                    fill="none"
                                    stroke={theme?.primary || '#00e676'}
                                    strokeWidth={1.5}
                                    className="animate-ping opacity-75"
                                  />
                                )}
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={isLatest ? 5 : isJack ? 4 : 2.75}
                                  fill={isJack ? '#fbbf24' : isWin ? (theme?.primary || '#00e676') : '#e11d48'}
                                  stroke="#ffffff"
                                  strokeWidth={1.5}
                                />
                              </g>
                            );
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Micro Telemetry HUD Bar */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                    <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-emerald-500/10">
                      <span className="text-[9.5px] font-mono text-slate-500 dark:text-slate-400 block uppercase">Peak Accuracy</span>
                      <span className="text-xs font-black font-space" style={{ color: theme?.primary || '#00b84a' }}>
                        {Math.max(...chartData.map(d => d.winRate), 0)}%
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-emerald-500/10">
                      <span className="text-[9.5px] font-mono text-slate-500 dark:text-slate-400 block uppercase">Current Ratio</span>
                      <span className="text-xs font-black font-space" style={{ color: theme?.isDark ? theme.accent : theme?.primary }}>
                        {chartData[chartData.length - 1]?.winRate || 0}%
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-emerald-500/10">
                      <span className="text-[9.5px] font-mono text-slate-500 dark:text-slate-400 block uppercase">Sampled Rounds</span>
                      <span className="text-xs font-black font-space text-slate-800 dark:text-slate-200">
                        {chartData.length} Trailing
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center text-xs font-mono text-[#3d5c47] dark:text-slate-400 space-y-1">
                  <Activity size={20} className="mx-auto text-emerald-500/50 animate-pulse" />
                  <p className="font-bold">Collecting Live Game Rounds for Ratio Chart...</p>
                  <p className="text-[10.5px] opacity-75">
                    Real-time win/loss curve will render automatically as rounds resolve.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
