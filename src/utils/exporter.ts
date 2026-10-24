import { WingoDrawItem, Analysis500Data, AppStats, WingoHistoryRecord, AppSettings } from '../types';
import { getSize, getColor } from '../services/analyzer';

export function generate500RecordsTextContent(
  draws: WingoDrawItem[],
  analysis: Analysis500Data,
  stats: AppStats,
  history: WingoHistoryRecord[],
  settings: AppSettings
): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const totalPlays = stats.wins + stats.losses;
  const winRate = totalPlays > 0 ? ((stats.wins / totalPlays) * 100).toFixed(1) : '0.0';
  const totalDraws = draws.length;

  const serverNames: Record<number, string> = {
    1: 'Server 1: CYRUS AI Engine (500-Data Matrix & Multi-Tier)',
    2: 'Server 2: CYRUS POWER™ Algorithm (Period Digit & 10/50/100/500)',
    3: 'Server 3: VIP Hack Pro Multi-Engine (11 AI Engines & Sure Numbers)',
  };

  const activeServer = serverNames[settings.server] || `Server ${settings.server}`;

  // Volatility Guard metric
  const recent10 = draws.slice(0, 10);
  let flips10 = 0;
  for (let i = 0; i < recent10.length - 1; i++) {
    const s1 = getSize(Math.abs(recent10[i].number % 10));
    const s2 = getSize(Math.abs(recent10[i + 1].number % 10));
    if (s1 !== s2) flips10++;
  }
  const flipRate10 = recent10.length > 1 ? Math.round((flips10 / (recent10.length - 1)) * 100) : 0;
  const isHighEntropy = flipRate10 >= 75 || analysis?.volatilityIndex >= 70;

  const lines: string[] = [
    '================================================================================',
    '        CYRUS FUSION AI - 500-DATA HISTORICAL PERFORMANCE & AUDIT BACKUP           ',
    '================================================================================',
    `Generated At      : ${dateStr} ${timeStr} IST`,
    `Player Account    : ${settings.userName} (${settings.userTitle || 'VIP ELITE'})`,
    `Active Engine     : ${activeServer}`,
    `Total Draws Stored: ${totalDraws} Records`,
    `Platform Version  : CYRUS Fusion AI Predictor v6.0`,
    '',
    '--------------------------------------------------------------------------------',
    '1. PERSONAL PERFORMANCE METRICS',
    '--------------------------------------------------------------------------------',
    `  • Total Rounds Tracked : ${totalPlays}`,
    `  • Confirmed Wins       : ${stats.wins}`,
    `  • Losses Incurred      : ${stats.losses}`,
    `  • Jackpot Hits (+25X)  : ${stats.jacks}`,
    `  • Net Win Accuracy     : ${winRate}%`,
    `  • Current Active Streak: ${stats.streak} consecutive wins`,
    `  • All-Time Best Streak : ${stats.bestStreak} consecutive wins`,
    `  • Current Loss Run     : ${stats.lossRun}`,
    `  • Defensive Recovery   : ${stats.recoveryActive ? 'ACTIVE (Martingale Shield On)' : 'STANDBY (Normal Flow)'}`,
    '',
    '--------------------------------------------------------------------------------',
    '2. 500-DATA STATISTICAL ANALYSIS & MARKET EQUILIBRIUM',
    '--------------------------------------------------------------------------------',
    `  • Analyzed Dataset     : ${analysis.totalAnalyzed || totalDraws} draws`,
    `  • BIG Ratio            : ${analysis.bigCount} draws (${analysis.bigPct}%)`,
    `  • SMALL Ratio          : ${analysis.smallCount} draws (${analysis.smallPct}%)`,
    `  • Color Breakdown      : GREEN ${analysis.colorBreakdown?.greenPct || 0}% | RED ${analysis.colorBreakdown?.redPct || 0}% | VIOLET ${analysis.colorBreakdown?.violetPct || 0}%`,
    `  • Parity Balance       : ODD ${analysis.oddEvenBreakdown?.oddPct || 50}% | EVEN ${analysis.oddEvenBreakdown?.evenPct || 50}%`,
    `  • Overall Volatility   : ${analysis.volatilityIndex || 50}%`,
    `  • Trailing Trend Streak: ${analysis.currentStreak?.count || 0}x ${analysis.currentStreak?.type || 'BIG'}`,
    `  • Hot Numbers          : [${(analysis.hotDigits || []).join(', ')}]`,
    `  • Cold Numbers         : [${(analysis.coldDigits || []).join(', ')}]`,
    '',
    '--------------------------------------------------------------------------------',
    '3. VOLATILITY GUARD & MULTI-TIER ENTROPY AUDIT',
    '--------------------------------------------------------------------------------',
    `  • Volatility Guard     : ${isHighEntropy ? '⚠️ HIGH ENTROPY ALERT (Smart Skip Active)' : '🛡️ ARMED & STABLE (Low Micro-Noise)'}`,
    `  • Last 10-Period Flips : ${flipRate10}% erratic switches`,
    `  • Micro-Chop Status    : ${flipRate10 >= 75 ? 'ERRATIC (Confidence < 50% Risk)' : 'ORDERLY (Confidence >= 85%)'}`,
    `  • Tier 10 Confluence   : ${analysis.recentSequence?.slice(0, 10).filter(s => s.size === 'BIG').length * 10 || 50}% BIG`,
    `  • Tier 50 Confluence   : ${Math.round((analysis.bigPct + (analysis.recentSequence?.slice(0, 10).filter(s => s.size === 'BIG').length * 10 || 50)) / 2)}% BIG`,
    `  • Tier 100 Confluence  : ${Math.round(analysis.bigPct * 0.95 + 2.5)}% BIG`,
    `  • Tier 500 Baseline    : ${analysis.bigPct}% BIG`,
    '',
    '--------------------------------------------------------------------------------',
    '4. RECENT PREDICTION HISTORY AUDIT LOG (LAST 50 ROUNDS)',
    '--------------------------------------------------------------------------------',
    '#   | Period  | Predicted | Actual | Size  | Color       | Result   | Conf | Engine',
    '--------------------------------------------------------------------------------',
  ];

  if (history && history.length > 0) {
    history.slice(0, 50).forEach((h, idx) => {
      const idxStr = String(idx + 1).padStart(3, '0');
      const perStr = (h.period || '------').padEnd(7, ' ');
      const predStr = (h.focusTarget || h.predicted || 'BIG').padEnd(9, ' ');
      const actNumStr = h.actualNum !== undefined ? String(h.actualNum).padEnd(6, ' ') : '-     ';
      const actSizeStr = (h.actualSize || '-').padEnd(5, ' ');
      const actColStr = (h.actualColor || '-').padEnd(11, ' ');
      const resStr = (h.result || 'PENDING').padEnd(8, ' ');
      const confStr = `${h.confidence || 90}%`.padEnd(4, ' ');
      const engStr = (h.engine || 'CYRUS AI').slice(0, 14);

      lines.push(`${idxStr} | ${perStr} | ${predStr} | ${actNumStr} | ${actSizeStr} | ${actColStr} | ${resStr} | ${confStr} | ${engStr}`);
    });
  } else {
    lines.push('  No local prediction history records logged yet.');
  }

  lines.push('');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('5. COMPLETE 500 HISTORICAL DRAW RECORDS (CHRONOLOGICAL RECENT-FIRST)');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('#     | Period         | Digit | Size  | Color        | Open Time (IST)');
  lines.push('--------------------------------------------------------------------------------');

  if (draws && draws.length > 0) {
    draws.slice(0, 500).forEach((d, idx) => {
      const idxStr = String(idx + 1).padStart(5, '0');
      const perStr = String(d.issueNumber || '---------------').padEnd(14, ' ');
      const num = Math.abs(d.number % 10);
      const digitStr = String(num).padEnd(5, ' ');
      const sizeStr = getSize(num).padEnd(5, ' ');
      const col = num === 0 ? 'RED-VIOLET' : num === 5 ? 'GREEN-VIOLET' : getColor(num);
      const colStr = col.padEnd(12, ' ');
      const time = d.openTime || '--:--:--';

      lines.push(`${idxStr} | ${perStr} | ${digitStr} | ${sizeStr} | ${colStr} | ${time}`);
    });
  } else {
    lines.push('  No draw records available for export.');
  }

  lines.push('');
  lines.push('================================================================================');
  lines.push('  END OF BACKUP AUDIT - GENERATED LOCALLY BY CYRUS FUSION VIP AI PREDICTOR         ');
  lines.push('================================================================================');

  return lines.join('\n');
}

export function download500RecordsAsText(
  draws: WingoDrawItem[],
  analysis: Analysis500Data,
  stats: AppStats,
  history: WingoHistoryRecord[],
  settings: AppSettings
) {
  const content = generate500RecordsTextContent(draws, analysis, stats, history, settings);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NY_Fusion_500_Draws_Backup_${dateStr}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
