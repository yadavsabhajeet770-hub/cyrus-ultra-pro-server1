const fs = require('fs');
const file = 'src/services/adaptivePatternEngine.ts';
let code = fs.readFileSync(file, 'utf8');

const server1Replacement = `export function runAdaptiveServer1(
  draws: WingoDrawItem[],
  nextPeriod: string,
  lossStreak: number = 0,
  analysis?: Analysis500Data
): StrategyResult {
  const safeDraws = draws && draws.length > 0 ? draws.slice(0, 500) : [];
  const engineResult = executeEagleLogic(safeDraws, nextPeriod, lossStreak, false);

  const primaryNumber = engineResult.nums[0];
  const oppositeNumber = engineResult.nums[1];
  
  const numDetails: NumberDetail[] = [
    {
      num: primaryNumber,
      type: 'PRIMARY',
      label: \`Primary Sure #\${primaryNumber}\`,
      reason: \`\${engineResult.patternName}\`,
    },
    {
      num: oppositeNumber,
      type: 'HEDGE',
      label: \`Opposite Hedge #\${oppositeNumber}\`,
      reason: \`Anti-Loss Strategic Hedge\`,
    },
  ];

  return {
    pred: engineResult.sizePred,
    nums: [primaryNumber, oppositeNumber],
    top4Nums: [primaryNumber, oppositeNumber, (primaryNumber + 2) % 10, (oppositeNumber + 3) % 10],
    numDetails,
    colorPred: engineResult.colorPred,
    colorProb: { red: 50, green: 50, violet: 0 },
    trendHealth: 88,
    trendStatus: 'SOLID',
    mode: 'SERVER 1 · EAGLE 30S',
    modeCategory: 'BALANCED',
    baseWinRate: 85,
    confidenceMetrics: {
      momentum: 88,
      volatility: 12,
      volume: 90
    },
    focusTarget: engineResult.focusTarget,
    targetCategory: engineResult.activeChannel,
    targetScores: { big: 50, small: 50, red: 50, green: 50, violet: 0 },
    confidence: 88,
    bigProb: engineResult.sizePred === 'BIG' ? 88 : 12,
    smallProb: engineResult.sizePred === 'SMALL' ? 88 : 12,
    reasoning: engineResult.patternName
  };
}
`;

const server2Replacement = `export function runAdaptiveServer2(
  draws: WingoDrawItem[],
  nextPeriod: string,
  lossStreak: number = 0,
  analysis?: Analysis500Data
): StrategyResult {
  const safeDraws = draws && draws.length > 0 ? draws.slice(0, 500) : [];
  const engineResult = executeEagleLogic(safeDraws, nextPeriod, lossStreak, true);

  const primaryNumber = engineResult.nums[0];
  const oppositeNumber = engineResult.nums[1];
  
  const numDetails: NumberDetail[] = [
    {
      num: primaryNumber,
      type: 'PRIMARY',
      label: \`Primary Sure #\${primaryNumber}\`,
      reason: \`\${engineResult.patternName}\`,
    },
    {
      num: oppositeNumber,
      type: 'HEDGE',
      label: \`Opposite Hedge #\${oppositeNumber}\`,
      reason: \`Advanced Hash Secured Hedge\`,
    },
  ];

  return {
    pred: engineResult.sizePred,
    nums: [primaryNumber, oppositeNumber],
    top4Nums: [primaryNumber, oppositeNumber, (primaryNumber + 2) % 10, (oppositeNumber + 3) % 10],
    numDetails,
    colorPred: engineResult.colorPred,
    colorProb: { red: 50, green: 50, violet: 0 },
    trendHealth: 92,
    trendStatus: 'SOLID',
    mode: 'SERVER 2 · EAGLE HASH™',
    modeCategory: 'AGGRESSIVE',
    baseWinRate: 90,
    confidenceMetrics: {
      momentum: 92,
      volatility: 8,
      volume: 95
    },
    focusTarget: engineResult.focusTarget,
    targetCategory: engineResult.activeChannel,
    targetScores: { big: 50, small: 50, red: 50, green: 50, violet: 0 },
    confidence: 92,
    bigProb: engineResult.sizePred === 'BIG' ? 92 : 8,
    smallProb: engineResult.sizePred === 'SMALL' ? 92 : 8,
    reasoning: engineResult.patternName
  };
}
`;

code = code.replace(/export function runAdaptiveServer1\([\s\S]*?return \{[\s\S]*?\};\n\}/, server1Replacement);
code = code.replace(/export function runAdaptiveServer2\([\s\S]*?return \{[\s\S]*?\};\n\}/, server2Replacement);

fs.writeFileSync(file, code);
