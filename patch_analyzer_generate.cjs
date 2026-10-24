const fs = require('fs');
const file = 'src/services/analyzer.ts';
let code = fs.readFileSync(file, 'utf8');

const replacement = `export function generatePrediction(
  server: ServerEngine,
  draws: WingoDrawItem[],
  analysis: Analysis500Data,
  nextPeriod: string,
  cycleIdx: number,
  lossStreak: number,
  recovery: boolean
): StrategyResult {
  if (server === 1) {
    return runAdaptiveServer1(draws, nextPeriod, lossStreak, analysis);
  }
  return runAdaptiveServer2(draws, nextPeriod, lossStreak, analysis);
}`;

code = code.replace(/export function generatePrediction\([\s\S]*?return runServer2ManPower\([\s\S]*?\};\n\}/, replacement);

fs.writeFileSync(file, code);
