const fs = require('fs');
const file = 'src/services/adaptivePatternEngine.ts';
let code = fs.readFileSync(file, 'utf8');

const importStr = `
import { analyzePrimeLogic, generatePrimeNumbers } from './primeEngine';
`;

// Prepend import if not exists
if (!code.includes('analyzePrimeLogic')) {
  code = importStr + code;
}

// Rewrite runAdaptiveServer1
const server1Replacement = `export function runAdaptiveServer1(
  draws: WingoDrawItem[],
  nextPeriod: string,
  lossStreak: number = 0,
  analysis?: Analysis500Data
): StrategyResult {
  const safeDraws = draws && draws.length > 0 ? draws.slice(0, 500) : [];
  const bsList = safeDraws.map(d => Math.abs(Number(d.number) % 10) >= 5 ? 'BIG' : 'SMALL');
  const numList = safeDraws.map(d => Math.abs(Number(d.number) % 10));

  // Simulate last 12 predictions for balancer (simplified proxy)
  const lastPredictions = bsList.slice(0, 12);

  const primeAnalysis = analyzePrimeLogic(bsList, nextPeriod, lossStreak, lastPredictions, false);
  const { primaryNumber, oppositeNumber } = generatePrimeNumbers(primeAnalysis.bs, numList, nextPeriod, false);

  const focusTarget: FocusTarget = primeAnalysis.bs;
  const targetCategory = 'SIZE';
  const sureNums = [primaryNumber, oppositeNumber];
  
  const bigProb = primeAnalysis.bs === 'BIG' ? primeAnalysis.conf : 100 - primeAnalysis.conf;
  const smallProb = 100 - bigProb;
  const overallConfidence = primeAnalysis.conf;
  
  // Dummy colors to satisfy the structure
  const colorProb = { red: 50, green: 50, violet: 0 };
  const colorPred = primaryNumber % 2 === 0 ? 'RED' : 'GREEN';

  const numDetails: NumberDetail[] = [
    {
      num: primaryNumber,
      type: 'PRIMARY',
      label: \`Primary Sure #\${primaryNumber}\`,
      reason: \`NY ULTRA™ Dominant Pattern Alignment: [\${primeAnalysis.bs}] (\${primeAnalysis.patternName})\`,
    },
    {
      num: oppositeNumber,
      type: 'HEDGE',
      label: \`Opposite Hedge #\${oppositeNumber}\`,
      reason: \`NY ULTRA™ Anti-Loss Strategic Hedge: [\${primeAnalysis.bs === 'BIG' ? 'SMALL' : 'BIG'}] to prevent total loss\`,
    },
  ];

  const mode = 'SERVER 1 · NY ULTRA™';
  return {
    pred: primeAnalysis.bs,
    nums: sureNums,
    top4Nums: [primaryNumber, oppositeNumber, (primaryNumber + 2) % 10, (oppositeNumber + 3) % 10],
    numDetails,
    colorPred,
    colorProb,
    trendHealth: primeAnalysis.strength,
    trendStatus: primeAnalysis.strength >= 85 ? 'SOLID' : 'HEALTHY',
    mode,
    modeCategory: 'BALANCED',
    baseWinRate: overallConfidence,
    confidenceMetrics: {
      momentum: primeAnalysis.strength,
      volatility: 100 - primeAnalysis.strength,
      volume: 85
    }
  };
}
`;

// Rewrite runAdaptiveServer2
const server2Replacement = `export function runAdaptiveServer2(
  draws: WingoDrawItem[],
  nextPeriod: string,
  lossStreak: number = 0,
  analysis?: Analysis500Data
): StrategyResult {
  const safeDraws = draws && draws.length > 0 ? draws.slice(0, 500) : [];
  const bsList = safeDraws.map(d => Math.abs(Number(d.number) % 10) >= 5 ? 'BIG' : 'SMALL');
  const numList = safeDraws.map(d => Math.abs(Number(d.number) % 10));

  // Simulate last 12 predictions for balancer (simplified proxy)
  const lastPredictions = bsList.slice(0, 12);

  const primeAnalysis = analyzePrimeLogic(bsList, nextPeriod, lossStreak, lastPredictions, true); // true for Server 2
  const { primaryNumber, oppositeNumber } = generatePrimeNumbers(primeAnalysis.bs, numList, nextPeriod, true);

  const focusTarget: FocusTarget = primeAnalysis.bs;
  const targetCategory = 'SIZE';
  const sureNums = [primaryNumber, oppositeNumber];
  
  const bigProb = primeAnalysis.bs === 'BIG' ? primeAnalysis.conf : 100 - primeAnalysis.conf;
  const smallProb = 100 - bigProb;
  const overallConfidence = primeAnalysis.conf;
  
  const colorProb = { red: 50, green: 50, violet: 0 };
  const colorPred = primaryNumber % 2 === 0 ? 'RED' : 'GREEN';

  const numDetails: NumberDetail[] = [
    {
      num: primaryNumber,
      type: 'PRIMARY',
      label: \`Primary Sure #\${primaryNumber}\`,
      reason: \`NY POWER™ Hash Matrix Alignment: [\${primeAnalysis.bs}] (\${primeAnalysis.patternName})\`,
    },
    {
      num: oppositeNumber,
      type: 'HEDGE',
      label: \`Opposite Hedge #\${oppositeNumber}\`,
      reason: \`NY POWER™ Advanced Anti-Loss Hedge: [\${primeAnalysis.bs === 'BIG' ? 'SMALL' : 'BIG'}]\`,
    },
  ];

  const mode = 'SERVER 2 · NY POWER™';
  return {
    pred: primeAnalysis.bs,
    nums: sureNums,
    top4Nums: [primaryNumber, oppositeNumber, (primaryNumber + 2) % 10, (oppositeNumber + 3) % 10],
    numDetails,
    colorPred,
    colorProb,
    trendHealth: primeAnalysis.strength,
    trendStatus: primeAnalysis.strength >= 85 ? 'SOLID' : 'HEALTHY',
    mode,
    modeCategory: 'AGGRESSIVE',
    baseWinRate: overallConfidence,
    confidenceMetrics: {
      momentum: primeAnalysis.strength,
      volatility: 100 - primeAnalysis.strength,
      volume: 95
    }
  };
}
`;

code = code.replace(/export function runAdaptiveServer1\([\s\S]*?return \{[\s\S]*?\};\n\}/, server1Replacement);
code = code.replace(/export function runAdaptiveServer2\([\s\S]*?return \{[\s\S]*?\};\n\}/, server2Replacement);

fs.writeFileSync(file, code);
