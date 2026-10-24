import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Download, Trash2, Trophy, Crown, XCircle, Search } from 'lucide-react';
import { WingoHistoryRecord } from '../types';
import { sound, vibrate } from '../utils/audio';
import { NumberBall } from './NumberBall';

interface HistoryPanelProps {
  history: WingoHistoryRecord[];
  onClearHistory: () => void;
  isDarkTheme?: boolean;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = React.memo(({
  history,
  onClearHistory,
  isDarkTheme = false,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'JACKPOT' | 'SKIPPED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const safeHistory = Array.isArray(history) ? history : [];
  const filtered = safeHistory.filter(item => {
    if (!item) return false;
    if (filter === 'WIN' && item.result !== 'WIN' && item.result !== 'JACKPOT') return false;
    if (filter === 'LOSS' && item.result !== 'LOSS') return false;
    if (filter === 'JACKPOT' && item.result !== 'JACKPOT') return false;
    if (filter === 'SKIPPED' && item.result !== 'SKIPPED' && !item.isSkip) return false;
    if (searchTerm && !(item.period || '').includes(searchTerm)) return false;
    return true;
  });

  const exportTxt = () => {
    sound.playClick();
    vibrate(30);
    const lines = [
      'CYRUS ULTRA PRO PRO - 500-DATA SESSION LOG',
      `Exported at: ${new Date().toLocaleString()}`,
      '=========================================================================',
      'PERIOD       | TARGET      | SNIPER   | ACTUAL (NUM/SIZE/COL) | RESULT  | CONF | ENGINE',
      '-------------------------------------------------------------------------',
    ];
    safeHistory.forEach(h => {
      if (!h) return;
      const targetStr = h.isSkip ? 'SKIP/PASS' : h.focusTarget || h.predicted || 'BIG';
      const sniperStr = Array.isArray(h.suggestedNums) ? `[${h.suggestedNums.join(',')}]` : '[]';
      const act = h.actualNum !== undefined ? `${h.actualNum} (${h.actualSize || ''}${h.actualColor ? ' · ' + h.actualColor : ''})` : 'PENDING';
      lines.push(
        `${String(h.period || '').padEnd(12)} | ${String(targetStr).padEnd(11)} | ${sniperStr.padEnd(8)} | ${act.padEnd(21)} | ${(h.result || 'PENDING').padEnd(7)} | ${h.confidence || 0}% | ${h.engine || ''}`
      );
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NY_Fusion_500_History_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`w-full mb-3 rounded-3xl ${isDarkTheme ? 'liquid-glass-dark' : 'liquid-glass'} p-4 sm:p-5`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-emerald-500/10 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#00e676] to-[#006b28] flex items-center justify-center text-white shadow-md">
            <History size={18} />
          </div>
          <div>
            <h2 className="font-space font-black text-base text-[#111b15] dark:text-white flex items-center gap-2">
              <span>PREDICTION HISTORY</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#006b28] dark:text-emerald-300 border border-emerald-500/30">
                {history.length} LOGS
              </span>
            </h2>
            <p className="text-[11px] text-[#3d5c47] dark:text-slate-400 font-semibold">
              Live Verified Prediction Outcomes
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportTxt}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-xl liquid-pill text-xs font-bold text-[#006b28] dark:text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm border border-emerald-500/20 disabled:opacity-40"
          >
            <Download size={13} />
            <span>Export TXT</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              vibrate(30);
              onClearHistory();
            }}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-xl liquid-pill text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm border border-rose-500/20 disabled:opacity-40"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-1">
          {(['ALL', 'WIN', 'JACKPOT', 'SKIPPED', 'LOSS'] as const).map(f => (
            <button
              key={f}
              onClick={() => {
                sound.playClick();
                setFilter(f);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all shadow-sm ${
                filter === f
                  ? 'bg-gradient-to-r from-[#00e676] to-[#00b84a] text-white shadow-emerald-500/25'
                  : 'liquid-pill text-[#3d5c47] dark:text-slate-300 hover:text-[#006b28] border border-emerald-500/15'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a9e87]" />
          <input
            type="text"
            placeholder="Search period..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-44 pl-8 pr-3 py-1.5 rounded-xl liquid-pill text-xs font-mono font-semibold text-[#111b15] dark:text-white placeholder-[#7a9e87] border border-emerald-500/20 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* History Items List */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        <AnimatePresence>
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const isWin = item.result === 'WIN';
              const isJackpot = item.result === 'JACKPOT';
              const isLoss = item.result === 'LOSS';
              const isSkipped = item.result === 'SKIPPED' || item.isSkip;
              const isPending = !item.result || item.result === 'PENDING';

              return (
                <motion.div
                  key={`hist-${item.period || 'per'}-${item.timestamp || idx}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="p-3 rounded-2xl liquid-pill border border-emerald-500/15 flex items-center justify-between gap-2 hover:border-emerald-500/35 transition-all shadow-sm"
                >
                  {/* Left info */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-[#111b15] dark:text-white">
                        {item.period}
                      </span>
                      {item.wingoMode && (
                        <span className="text-[9.5px] font-mono font-black px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-[#006b28] dark:text-emerald-300 border border-emerald-500/30">
                          {item.wingoMode === '30s' ? '30S' : '1M'}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-[#7a9e87] dark:text-slate-400">
                        {item.timestamp}
                      </span>
                    </div>

                    <div className="text-xs text-[#3d5c47] dark:text-slate-300 font-semibold flex flex-wrap items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Target:</span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-black ${
                            isSkipped
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                              : (item.focusTarget || item.predicted) === 'BIG'
                              ? 'bg-amber-400/25 text-amber-800 dark:text-yellow-300 border border-amber-400/50'
                              : (item.focusTarget || item.predicted) === 'SMALL'
                              ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40'
                              : (item.focusTarget || item.predicted) === 'RED'
                              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-[#006b28] dark:text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isSkipped ? 'SKIP' : item.focusTarget || item.predicted}
                        </span>
                      </div>

                      {!isSkipped && Array.isArray(item.suggestedNums) && item.suggestedNums.length > 0 && (
                        <div className="flex items-center gap-1 pl-1 border-l border-emerald-500/20">
                          <span className="text-[10px] font-mono text-slate-400">Snipers:</span>
                          <div className="flex items-center gap-0.5">
                            {item.suggestedNums.map((n, i) => (
                              <NumberBall
                                key={`hist-snip-${n}-${i}`}
                                num={n}
                                size="xs"
                                animate={false}
                                isWinning={item.actualNum === n}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {item.actualNum !== undefined && (
                        <div className="flex items-center gap-1.5 pl-1.5 border-l border-emerald-500/20">
                          <span className="text-[10px] font-mono text-slate-400">Actual:</span>
                          <NumberBall
                            num={item.actualNum}
                            size="sm"
                            animate={false}
                            isWinning={isJackpot || isWin}
                          />
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            ({item.actualSize || ''})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Result Badge */}
                  <div className="flex-shrink-0">
                    {isSkipped && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-xs font-black font-space shadow-sm">
                        <span>SKIPPED</span>
                      </div>
                    )}
                    {isJackpot && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 text-xs font-black font-space shadow-sm animate-pulse">
                        <Crown size={14} className="text-amber-500" />
                        <span>JACKPOT!</span>
                      </div>
                    )}
                    {isWin && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/20 text-[#006b28] dark:text-emerald-300 border border-emerald-500/40 text-xs font-black font-space shadow-sm">
                        <Trophy size={14} className="text-[#00b84a]" />
                        <span>WIN</span>
                      </div>
                    )}
                    {isLoss && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30 text-xs font-black font-space shadow-sm">
                        <XCircle size={14} className="text-rose-500" />
                        <span>LOSS</span>
                      </div>
                    )}
                    {isPending && !isSkipped && (
                      <div className="px-3 py-1 rounded-xl bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/20 text-xs font-mono font-bold">
                        PENDING
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="py-12 text-center text-[#7a9e87] dark:text-slate-400 font-mono text-xs">
              No matching prediction history found.
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});
