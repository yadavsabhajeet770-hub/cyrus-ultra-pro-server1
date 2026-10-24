import React, { useState } from 'react';
import { RotateCw, Copy, Check, ShieldAlert, Sparkles, Zap, PauseCircle, AlertTriangle, Crosshair } from 'lucide-react';
import { fireConfetti } from '../utils/confetti';
import { StrategyResult, AppStats } from '../types';
import { sound, vibrate } from '../utils/audio';
import { ThemeDef } from '../utils/theme';
import { NumberBall } from './NumberBall';

interface PredictionHeroProps {
  period: string;
  prediction: StrategyResult | null;
  isLoading: boolean;
  stats: AppStats;
  showNumbers: boolean;
  onRefresh: () => void;
  serverName: string;
  isDarkTheme?: boolean;
  theme?: ThemeDef;
}

export const PredictionHero: React.FC<PredictionHeroProps> = React.memo(({
  period,
  prediction,
  isLoading,
  stats,
  showNumbers,
  onRefresh,
  serverName,
  isDarkTheme = false,
  theme,
}) => {
  const [copied, setCopied] = useState(false);

  const isSkip = Boolean(prediction?.isSkip);
  const focusTarget = prediction?.focusTarget || prediction?.pred || 'BIG';
  const isRed = focusTarget === 'RED';
  const isGreen = focusTarget === 'GREEN';
  const isBig = focusTarget === 'BIG';
  const isSmall = focusTarget === 'SMALL';

  const safeNums = Array.isArray(prediction?.nums) ? prediction.nums : [];

  const handleCopy = () => {
    if (!prediction) return;
    sound.playClick();
    vibrate(40);

    const numsStr = isSkip
      ? '(PASS ROUND)'
      : showNumbers && safeNums.length > 0
      ? `[${safeNums.join(', ')}]`
      : '(disabled)';
    const totalPlays = stats.wins + stats.losses;
    const winRate = totalPlays > 0 ? ((stats.wins / totalPlays) * 100).toFixed(1) : '0.0';

    const text = `╔════════════════════════╗
  CYRUS ULTRA PRO V6.0
╚════════════════════════╝
  PERIOD     : ${period}
  TARGET     : ${isSkip ? 'SKIP / PASS ACTIVE' : focusTarget}
  NUMBERS    : ${numsStr}
  CONFIDENCE : ${prediction.confidence}%
  ENGINE     : ${prediction.mode || 'CYRUS AI Engine'}
${prediction.databasePatternDisplay ? `  PATTERN    : ${prediction.databasePatternDisplay} (${(prediction.databasePatternDisplay.includes('"1"') || prediction.databasePatternSignal === '1') ? 'BIG' : 'SMALL'})\n` : ''}${isSkip ? `  SKIP REASON: ${prediction.skipReason || 'Unstable Pattern'}\n` : ''}─────────────────────────
  WINS       : ${stats.wins}
  LOSSES     : ${stats.losses}
  JACKPOTS   : ${stats.jacks}
  WIN RATE   : ${winRate}%
  STREAK     : ${stats.streak}
─────────────────────────
  CYRUS FUSION V6.0 — ${serverName}
  Multi-Pattern Momentum`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      try {
        fireConfetti({
          particleCount: 45,
          spread: 70,
          origin: { y: 0.65 },
          colors: isSkip
            ? ['#f59e0b', '#fbbf24', '#d97706', '#fef3c7']
            : isBig
            ? ['#eab308', '#facc15', '#fef08a', '#ca8a04']
            : isSmall
            ? ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd']
            : isRed
            ? ['#e11d48', '#f43f5e', '#fb7185', '#be123c']
            : ['#00b84a', '#00e676', '#34d399', '#10b981'],
        });
      } catch {}
    });
  };

  // Color gradient styling for the primary target pill:
  // BIG -> Yellow, SMALL -> Blue, RED -> Red, GREEN -> Green, SKIP -> Amber
  const getPillStyles = () => {
    if (isSkip) {
      return isDarkTheme
        ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700 text-white border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
        : 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white border-2 border-amber-400 shadow-amber-500/25';
    }
    if (isBig) {
      // BIG: Vibrant Yellow with ultra-high contrast dark typography and golden glow
      return isDarkTheme
        ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 border-2 border-yellow-200 shadow-[0_0_30px_rgba(250,204,21,0.55)]'
        : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 border-2 border-yellow-400 shadow-yellow-500/35';
    }
    if (isSmall) {
      // SMALL: Vibrant Royal Blue with crisp white typography
      return isDarkTheme
        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white border-2 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)]'
        : 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white border-2 border-blue-400 shadow-blue-500/35';
    }
    if (isRed) {
      // RED: Vibrant Crimson Red with crisp white typography
      return isDarkTheme
        ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white border-2 border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.5)]'
        : 'bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white border-2 border-red-400 shadow-rose-500/35';
    }
    // GREEN: Vibrant Emerald Green
    return isDarkTheme
      ? 'bg-gradient-to-r from-emerald-600 via-[#00b84a] to-teal-700 text-white border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
      : 'bg-gradient-to-r from-[#00b84a] via-emerald-600 to-green-700 text-white border-2 border-emerald-400 shadow-emerald-500/35';
  };

  return (
    <div
      className={`relative z-10 w-full mb-3 rounded-3xl ${isDarkTheme ? 'liquid-glass-dark' : 'liquid-glass'} p-4 sm:p-6 overflow-hidden shadow-xl`}
    >
      {/* Dynamic Ambient Glow */}
      <div
        className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-25 pointer-events-none transition-colors duration-700 ${
          isSkip
            ? 'bg-amber-500'
            : isBig
            ? 'bg-yellow-400'
            : isSmall
            ? 'bg-blue-500'
            : isRed
            ? 'bg-rose-500'
            : 'bg-emerald-400'
        }`}
      />
      <div
        className={`absolute -bottom-24 -left-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
          isSkip
            ? 'bg-yellow-500'
            : isBig
            ? 'bg-amber-400'
            : isSmall
            ? 'bg-indigo-500'
            : isGreen
            ? 'bg-teal-400'
            : 'bg-rose-400'
        }`}
      />

      {/* Smart Skip Notification Banner inside card */}
      {isSkip && (
        <div
          className="mb-3.5 p-3 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 flex items-start gap-2.5 text-amber-950 dark:text-amber-200 text-xs font-bold shadow-sm"
        >
          <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400 font-mono font-black">
              <ShieldAlert size={12} className="text-amber-600 dark:text-amber-400" />
              <span>Smart Skip Protection Active</span>
            </div>
            <p className="mt-0.5 leading-snug font-medium text-amber-900 dark:text-amber-200 text-xs">
              {prediction?.skipReason || 'Unstable or conflicting pattern detected in 500 draws. Pass this round.'}
            </p>
          </div>
        </div>
      )}

      {/* Card Header: Next Period & Recalibrate Button */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-emerald-500/10 dark:border-white/10">
        <div>
          <div className="text-[10px] font-mono font-black tracking-widest text-[#7a9e87] dark:text-slate-400 uppercase flex items-center gap-1.5">
            <Sparkles size={11} style={{ color: theme?.primary || '#00b84a' }} />
            <span>Next Period</span>
          </div>
          <div
            className="font-space font-black text-2xl sm:text-3xl tracking-tight"
            style={{ color: theme?.isDark ? theme.accent : (theme?.primary || '#006b28') }}
          >
            <span>{period || '--------'}</span>
          </div>
        </div>

        {/* Recalibrate / Refresh Button */}
        <button
          onClick={() => {
            sound.playRefresh();
            vibrate(30);
            onRefresh();
          }}
          disabled={isLoading}
          className="w-11 h-11 rounded-2xl liquid-pill flex items-center justify-center text-[#111b15] dark:text-slate-200 active:scale-90 transition-all shadow-sm group"
          style={{ borderColor: theme ? `${theme.primary}35` : undefined }}
          title="Recalibrate Engine"
        >
          <RotateCw
            size={18}
            className={`transition-transform duration-500 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`}
            style={{ color: theme?.primary || '#00b84a' }}
          />
        </button>
      </div>

      {/* Center Prediction Output */}
      <div className="py-5 text-center flex flex-col items-center justify-center">
        {prediction ? (
          <div className="flex flex-col items-center w-full transition-all duration-300">
            {/* PRIMARY PREDICTION PILL (BIG / SMALL / RED / GREEN / SKIP) */}
            <div
              className={`relative inline-flex items-center justify-center gap-2 px-10 py-3.5 sm:py-4 rounded-2xl font-space font-black text-2xl sm:text-4xl tracking-wider uppercase transition-all duration-300 shadow-xl animate-liquid-sheen ${getPillStyles()}`}
            >
              {isSkip ? (
                <>
                  <PauseCircle size={28} className="stroke-[2.5] text-white flex-shrink-0 animate-pulse" />
                  <span className="text-white drop-shadow-md">SKIP ROUND</span>
                </>
              ) : (
                <span className={`drop-shadow-md ${isBig ? 'text-slate-950 font-black' : 'text-white'}`}>
                  {focusTarget}
                </span>
              )}
            </div>

            {/* Number Balls or Skip Notice */}
            {isSkip ? (
              <div className="mt-3.5 px-4 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold flex items-center gap-2">
                <PauseCircle size={14} className="text-amber-600 dark:text-amber-400" />
                <span>No trade advised · Pattern quality is poor / conflicting</span>
              </div>
            ) : (
              showNumbers &&
              safeNums.length > 0 && (
                <div className="mt-4 flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-black tracking-widest text-[#006b28] dark:text-emerald-400 uppercase mb-2">
                    <Crosshair size={14} className="text-[#00b84a]" />
                    <span>{safeNums.length === 1 ? 'SINGLE SNIPER NUMBER' : 'SURE NUMBERS'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-3.5 sm:gap-4 p-2.5 rounded-2xl bg-black/10 dark:bg-white/5 border border-emerald-500/20 backdrop-blur-sm shadow-inner">
                    {safeNums.map((num, i) => (
                      <NumberBall
                        key={`pred-ball-${num}-${i}`}
                        num={num}
                        size="xl"
                        delay={0.04 * i}
                        isSelected={true}
                      />
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Engine Tag & Trend Health */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 max-w-[95%]">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-pill border border-emerald-500/20 text-xs font-mono font-bold text-[#3d5c47] dark:text-slate-300 shadow-sm truncate">
                <Zap size={13} className="text-[#00b84a] flex-shrink-0" />
                <span className="truncate">
                  {(() => {
                    const raw = prediction.mode || '';
                    if (raw.includes('SERVER 1')) return 'SERVER 1 · CYRUS ULTRA™';
                    if (raw.includes('SERVER 2') || raw.includes('CYRUS PATTERNS') || raw.includes('SERVER 3')) return 'SERVER 2 · CYRUS PATTERNS™';
                    return raw.replace(/\s*\([^)]*\)/g, '').trim() || 'CYRUS AI Engine';
                  })()}
                </span>
              </div>
              {prediction.trendHealth !== undefined && (
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                    prediction.trendHealth >= 80
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300'
                      : prediction.trendHealth >= 65
                      ? 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300'
                      : 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-300'
                  }`}
                >
                  <span>Trend Quality: {prediction.trendHealth}%</span>
                </div>
              )}
            </div>

            {/* Real Analyzed Pattern Display (Directly below Trend Quality) */}
            {(prediction.databasePatternDisplay || prediction.detectedPatternName) && (
              <div className="mt-3 w-full flex flex-col items-center justify-center animate-fade-in px-2">
                <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 dark:bg-black/90 border border-amber-500/40 shadow-md text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    <span className="text-[10px] tracking-wider uppercase text-slate-300 font-sans font-black">
                      DETECTED PATTERN:
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-black/60 dark:bg-slate-950/80 px-2 py-0.5 rounded-lg border border-amber-500/30">
                    <span className="font-mono font-black text-amber-300 text-xs sm:text-sm tracking-wider">
                      {prediction.databasePatternDisplay || prediction.detectedPatternName}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border flex-shrink-0 uppercase ${
                      (prediction.databasePatternDisplay || '').includes('"1"') ||
                      (prediction.databasePatternDisplay || '').includes(':1') ||
                      prediction.databasePatternSignal === '1'
                        ? 'bg-orange-500/25 text-orange-300 border-orange-500/40'
                        : 'bg-blue-500/25 text-blue-300 border-blue-500/40'
                    }`}
                  >
                    {(prediction.databasePatternDisplay || '').includes('"1"') ||
                    (prediction.databasePatternDisplay || '').includes(':1') ||
                    prediction.databasePatternSignal === '1'
                      ? '1 ➔ BIG'
                      : '2 ➔ SMALL'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center gap-2 text-[#3d5c47] dark:text-slate-400 font-mono text-sm">
            <RotateCw size={24} className="animate-spin text-[#00b84a]" />
            <span>Analyzing 500 Draws...</span>
          </div>
        )}
      </div>

      {/* Copy Prediction Button with Sheen */}
      <button
        onClick={handleCopy}
        disabled={!prediction}
        className="w-full py-3.5 sm:py-4 rounded-2xl font-space font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all duration-200 animate-liquid-sheen text-white active:scale-[0.98]"
        style={{
          background: isSkip
            ? 'linear-gradient(90deg, #f59e0b, #d97706)'
            : `linear-gradient(135deg, ${theme?.primary || 'var(--theme-primary, #00b84a)'}, ${theme?.secondary || 'var(--theme-secondary, #006b28)'})`,
          boxShadow: isSkip
            ? '0 10px 25px -5px rgba(245, 158, 11, 0.35)'
            : `0 10px 25px -5px ${theme?.glowColor || 'var(--theme-glow, rgba(0, 184, 74, 0.35))'}`,
        }}
      >
        {copied ? (
          <>
            <Check size={18} className="stroke-[3]" />
            <span>Copied to Clipboard!</span>
          </>
        ) : (
          <>
            <Copy size={18} />
            <span>{isSkip ? 'Copy Skip Advisory' : 'Copy CYRUS Prediction'}</span>
          </>
        )}
      </button>
    </div>
  );
});
