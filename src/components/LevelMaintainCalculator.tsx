import React, { useState } from 'react';
import { sound, vibrate } from '../utils/audio';

interface LevelMaintainCalculatorProps {
  isDarkTheme?: boolean;
}

interface BetRow {
  level: number;
  bet: number;
  win: number;
  netProfit: number;
}

export const LevelMaintainCalculator: React.FC<LevelMaintainCalculatorProps> = ({
  isDarkTheme = true,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [levels, setLevels] = useState<string>('5');
  const [error, setError] = useState<string>('');
  const [data, setData] = useState<{
    bets: BetRow[];
    totalUsed: number;
    remaining: number;
  } | null>(null);

  const levelOptions = [3, 4, 5, 6];

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const total = parseFloat(amount);
    const lvls = parseInt(levels, 10);

    if (!total || isNaN(total) || total <= 0 || !lvls || isNaN(lvls) || lvls <= 0) {
      setError('Please enter a valid amount and select level!');
      vibrate(50);
      return;
    }

    sound.playClick();
    vibrate(25);

    // WinGo 1.96X Martingale Formula:
    // Payout multiplier is 1.96 (after 2% commission)
    // Progression ratio r ~ 1.96 / (1.96 - 1) = 2.04167
    const mult = 1.96;
    const ratio = mult / (mult - 1); // ~2.0417

    // Geometric series sum factor: (r^L - 1) / (r - 1)
    const factor = (Math.pow(ratio, lvls) - 1) / (ratio - 1);
    const base = Math.max(1, Math.floor(total / factor));

    const bets: BetRow[] = [];
    let sum = 0;

    for (let i = 0; i < lvls; i++) {
      let bet = 0;
      if (i === 0) {
        bet = base;
      } else {
        // Must recover past sum and give positive profit on 1.96x:
        // bet * 1.96 - (sum + bet) > 0  ==>  bet * 0.96 > sum
        const minNeeded = Math.ceil((sum + Math.max(1, Math.floor(base * 0.5))) / (mult - 1));
        const geoBet = Math.floor(base * Math.pow(ratio, i));
        bet = Math.max(minNeeded, geoBet);
      }

      sum += bet;
      const win = Math.round(bet * mult * 10) / 10;
      const netProfit = Math.round((win - sum) * 10) / 10;

      bets.push({
        level: i + 1,
        bet,
        win,
        netProfit,
      });
    }

    setData({
      bets,
      totalUsed: sum,
      remaining: parseFloat((total - sum).toFixed(2)),
    });
  };

  return (
    <div
      className={`w-full max-w-[500px] mx-auto p-6 sm:p-7 rounded-[20px] transition-all border shadow-lg ${
        isDarkTheme
          ? 'bg-[#0e1913] text-white border-emerald-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_25px_rgba(16,185,129,0.12)]'
          : 'bg-white text-slate-900 border-emerald-500/25 shadow-emerald-950/10'
      }`}
    >
      {/* Header */}
      <div className="text-center mb-5">
        <h2 className="font-space font-black text-xl sm:text-2xl text-emerald-500 dark:text-emerald-400 tracking-wide drop-shadow-[0_0_12px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2">
          <span>💰 LEVEL MAINTAIN TRICK</span>
        </h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/30">
            WINGO 1.96X RATE
          </span>
          <span className="text-[10px] font-mono text-[#3d5c47] dark:text-slate-400">
            ₹10 Bet = ₹19.60 Win
          </span>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-3.5">
        <div className="space-y-1">
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            placeholder="Enter Total Amount (₹)"
            className={`w-full p-3.5 rounded-[10px] border-2 text-base font-mono outline-none transition-all duration-300 ${
              isDarkTheme
                ? 'bg-[#14231b] border-emerald-950/70 text-white placeholder-slate-500 focus:border-emerald-400 focus:bg-[#0c1711] focus:shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:shadow-[0_0_12px_rgba(16,185,129,0.15)]'
            }`}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-0.5 text-xs font-mono font-bold text-[#3d5c47] dark:text-slate-300">
            <span>SELECT LEVEL:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black">
              {levels ? `${levels} Levels` : 'Choose Level'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {levelOptions.map((lvl) => {
              const isSelected = levels === lvl.toString();
              return (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => {
                    setLevels(lvl.toString());
                    setError('');
                    sound.playClick();
                    vibrate(15);
                  }}
                  className={`py-3 px-1.5 rounded-[10px] text-xs sm:text-sm font-space font-black transition-all duration-200 border cursor-pointer text-center ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 border-emerald-300 shadow-md shadow-emerald-500/30 scale-[1.03]'
                      : isDarkTheme
                      ? 'bg-[#14231b] border-emerald-950/80 text-slate-300 hover:border-emerald-500/50 hover:text-white hover:bg-[#1a2d23]'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-emerald-500/50 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {lvl} Level
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="text-rose-400 text-xs font-mono text-center font-medium">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full p-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-space font-black text-base sm:text-lg rounded-[10px] cursor-pointer transition-all duration-300 shadow-md shadow-emerald-500/20 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(16,185,129,0.4)] active:translate-y-0.5 active:shadow-[0_2px_10px_rgba(16,185,129,0.3)]"
        >
          Generate Steps
        </button>
      </form>

      {/* Output Section */}
      {data && (
        <div className="mt-5 space-y-4 animate-fadeIn">
          {/* Table */}
          <div className="w-full overflow-hidden rounded-[10px] border border-emerald-500/30">
            <table className="w-full border-collapse text-center text-xs sm:text-sm font-mono">
              <thead>
                <tr className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider">
                  <th className="p-3 border-b border-emerald-500/25 font-black">Level</th>
                  <th className="p-3 border-b border-emerald-500/25 font-black">Bet</th>
                  <th className="p-3 border-b border-emerald-500/25 font-black">Win (1.96X)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10">
                {data.bets.map((b, i) => (
                  <tr
                    key={b.level}
                    className={`transition-colors duration-300 ${
                      isDarkTheme
                        ? 'bg-[#122018] hover:bg-emerald-500/15 text-slate-100'
                        : 'bg-white hover:bg-emerald-50 text-slate-800'
                    }`}
                    style={{
                      animation: `slideUp 0.35s ease-out ${(i * 0.07) + 0.05}s both`,
                    }}
                  >
                    <td className="p-3 font-semibold text-slate-400">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 font-bold text-xs">
                        L{b.level}
                      </span>
                    </td>
                    <td className="p-3 font-black text-slate-900 dark:text-white">
                      ₹{b.bet}
                    </td>
                    <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">
                      ₹{b.win.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Result Box */}
          <div
            className={`p-4 sm:p-4.5 rounded-[10px] border-l-4 border-emerald-500 flex justify-between items-center text-sm font-mono shadow-sm ${
              isDarkTheme
                ? 'bg-[#14231b] border-t border-r border-b border-emerald-500/20'
                : 'bg-slate-50 border-t border-r border-b border-emerald-500/20'
            }`}
            style={{
              animation: `popIn 0.35s ease-out ${(data.bets.length * 0.07) + 0.12}s both`,
            }}
          >
            <div>
              <span className="text-[11px] text-[#3d5c47] dark:text-slate-400 uppercase tracking-wide block font-bold">
                Total Used:
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black text-base sm:text-lg">
                ₹{data.totalUsed}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#3d5c47] dark:text-slate-400 uppercase tracking-wide block font-bold">
                Remaining:
              </span>
              <span className={`font-black text-base sm:text-lg ${
                data.remaining >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-rose-400'
              }`}>
                ₹{data.remaining}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe styles for slideUp and popIn animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.94);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};
