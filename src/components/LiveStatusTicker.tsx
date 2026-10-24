import React from 'react';
import { motion } from 'motion/react';
import { Activity, Clock, Zap } from 'lucide-react';
import { ThemeDef } from '../utils/theme';

interface LiveStatusTickerProps {
  isConnected: boolean;
  activeMode: string;
  secondsLeft: number;
  istTime: string;
  totalLoaded: number;
  recoveryActive: boolean;
  isDarkTheme?: boolean;
  theme?: ThemeDef;
}

export const LiveStatusTicker: React.FC<LiveStatusTickerProps> = React.memo(({
  isConnected,
  activeMode,
  secondsLeft,
  istTime,
  totalLoaded,
  recoveryActive,
  isDarkTheme = false,
  theme,
}) => {
  const progressPct = ((60 - secondsLeft) / 60) * 100;
  const isUrgent = secondsLeft <= 10;

  return (
    <div
      className={`relative z-10 w-full mb-3 rounded-2xl ${isDarkTheme ? 'liquid-glass-dark' : 'liquid-glass'} p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-all duration-300 shadow-md overflow-hidden`}
    >
      {/* Dynamic Specular Top Rim */}
      <div
        className="absolute top-0 left-3 right-3 h-[1px] pointer-events-none opacity-60"
        style={{
          background: `linear-gradient(90deg, transparent, ${theme?.primary || '#34d399'}, transparent)`,
        }}
      />

      {/* Live Status indicator */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative flex items-center justify-center w-3.5 h-3.5">
          <span
            className={`absolute w-3.5 h-3.5 rounded-full opacity-75 animate-ping ${
              !isConnected ? 'bg-[#e53935]' : ''
            }`}
            style={{ backgroundColor: isConnected ? (theme?.primary || '#00e676') : undefined }}
          />
          <span
            className={`relative block w-2.5 h-2.5 rounded-full shadow-sm ${
              !isConnected ? 'bg-[#e53935]' : ''
            }`}
            style={{ backgroundColor: isConnected ? (theme?.primary || '#00b84a') : undefined }}
          />
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold flex items-center gap-1">
            {isConnected ? (
              <span style={{ color: theme?.primary || undefined }}>LIVE SYNC ACTIVE</span>
            ) : (
              <span className="text-red-500">CONNECTING...</span>
            )}
            {recoveryActive && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 border border-amber-400 shadow-sm">
                ANTI-LOSS
              </span>
            )}
          </span>
          <span className="text-[11px] font-bold text-[#23422d] dark:text-slate-300 truncate max-w-[140px] sm:max-w-[200px]">
            {totalLoaded > 0 ? `${totalLoaded} Draws Live` : activeMode}
          </span>
        </div>
      </div>

      {/* Mode Tag */}
      <div
        className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-mono font-bold"
        style={{
          backgroundColor: theme ? `${theme.primary}18` : undefined,
          border: theme ? `1px solid ${theme.primary}35` : undefined,
          color: theme?.primary || undefined,
        }}
      >
        <Zap size={11} style={{ color: theme?.primary || undefined }} />
        <span className="truncate max-w-[130px]">{activeMode}</span>
      </div>

      {/* Right: IST Clock & 60s Circular Countdown */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex flex-col items-end">
          <span className="text-[9.5px] font-mono font-bold text-[#5a7d67] dark:text-slate-400 flex items-center gap-1">
            <Clock size={10} /> IST TIME
          </span>
          <span className="text-xs font-mono font-black text-[#0b1e12] dark:text-slate-100">{istTime}</span>
        </div>

        {/* Circular Countdown Ring */}
        <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="14"
              className="text-emerald-500/15 stroke-current"
              strokeWidth="3"
              fill="transparent"
            />
            <circle
              cx="18"
              cy="18"
              r="14"
              className={`stroke-current transition-all duration-300 ${
                isUrgent ? 'text-rose-500' : ''
              }`}
              style={{ stroke: !isUrgent ? (theme?.primary || '#00b84a') : undefined }}
              strokeWidth="3"
              strokeDasharray={88}
              strokeDashoffset={88 - (88 * progressPct) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <span
            className={`absolute font-mono text-xs font-black ${
              isUrgent ? 'text-rose-600 animate-pulse' : ''
            }`}
            style={{ color: !isUrgent ? (theme?.primary || undefined) : undefined }}
          >
            {secondsLeft}
          </span>
        </div>
      </div>
    </div>
  );
});
