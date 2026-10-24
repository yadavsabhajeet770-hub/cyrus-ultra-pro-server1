import { WingoDrawItem, PredictionSize } from '../types';

function countSide(list: string[], side: string, maxN: number) {
  let c = 0;
  const n = Math.min(maxN, list.length);
  for (let i = 0; i < n; i++) if (list[i] === side) c++;
  return c;
}

export function analyzePrimeLogic(
  bsList: string[],
  nextPeriod: string,
  lossStreak: number,
  lastPredictions: string[],
  isServer2: boolean
) {
  if (!bsList || bsList.length < 2) {
    return {
      bs: 'BIG' as PredictionSize,
      conf: 55,
      strength: 48,
      patternId: 'chaos',
      patternName: '🌀 Chaos / Mixed',
      mode: 'NORMAL',
      sB: 50,
      sS: 50,
      confBoost: 0,
    };
  }

  const currentSide = bsList[0];
  const opposite = currentSide === 'BIG' ? 'SMALL' : 'BIG';

  let streak = 1;
  for (let i = 0; i < bsList.length - 1; i++) {
    if (bsList[i] === bsList[i + 1]) streak++;
    else break;
  }

  let alt = 0;
  for (let i = 0; i < Math.min(20, bsList.length - 1); i++) {
    if (bsList[i] !== bsList[i + 1]) alt++;
    else break;
  }

  let sB = 50;
  let sS = 50;
  let primaryPattern = 'deep_reversion';
  let patternName = '📉 Deep Reversion';
  let mode = 'NORMAL';
  let confExtra = 0;

  // Hash Logic for Server 2
  if (isServer2) {
     const periodHash = Array.from(nextPeriod.slice(-5)).reduce((acc, char) => acc + char.charCodeAt(0), 0);
     const magicNum = periodHash % 10;
     if (magicNum >= 5) {
       sB += 5; // Slight bias to BIG based on hash
     } else {
       sS += 5; // Slight bias to SMALL
     }
     confExtra += 2;
  }

  // 1. MEAN REVERSION ENGINE
  const b5 = countSide(bsList, 'BIG', 5);
  const s5 = countSide(bsList, 'SMALL', 5);
  if (b5 >= 4) { sS += 18; primaryPattern = 'deep_reversion'; patternName = '📉 Deep Reversion'; confExtra += 4; }
  if (s5 >= 4) { sB += 18; primaryPattern = 'deep_reversion'; patternName = '📉 Deep Reversion'; confExtra += 4; }

  const b8 = countSide(bsList, 'BIG', 8);
  const s8 = countSide(bsList, 'SMALL', 8);
  if (b8 >= 6) { sS += 14; confExtra += 3; }
  if (s8 >= 6) { sB += 14; confExtra += 3; }

  const b10 = countSide(bsList, 'BIG', 10);
  const s10 = countSide(bsList, 'SMALL', 10);
  if (b10 >= 7) { sS += 12; confExtra += 2; }
  if (s10 >= 7) { sB += 12; confExtra += 2; }

  const b15 = countSide(bsList, 'BIG', 15);
  const s15 = countSide(bsList, 'SMALL', 15);
  if (b15 >= 10) { sS += 10; confExtra += 2; }
  if (s15 >= 10) { sB += 10; confExtra += 2; }

  const b20 = countSide(bsList, 'BIG', 20);
  const s20 = countSide(bsList, 'SMALL', 20);
  if (b20 >= 13) { sS += 8; confExtra += 1; }
  if (s20 >= 13) { sB += 8; confExtra += 1; }

  // 2. DRAGON DETECTION
  if (streak === 2) {
    if (currentSide === 'BIG') sB += 8; else sS += 8;
    primaryPattern = 'dragon_follow'; patternName = '🐉 Early Dragon';
  } else if (streak === 3) {
    if (currentSide === 'BIG') sS += 10; else sB += 10;
    primaryPattern = 'classic'; patternName = '📊 Classic Pattern';
  } else if (streak === 4) {
    if (currentSide === 'BIG') sS += 20; else sB += 20;
    primaryPattern = 'dragon_break'; patternName = '🐉 Dragon Break'; confExtra += 5;
  } else if (streak >= 5) {
    if (currentSide === 'BIG') sS += 28; else sB += 28;
    primaryPattern = 'dragon_break'; patternName = '🐉 Dragon Break'; confExtra += 7;
  }

  // 3. ZIGZAG DETECTION
  if (alt >= 5) {
    if (currentSide === 'BIG') sS += 16; else sB += 16;
    primaryPattern = 'zigzag'; patternName = alt >= 6 ? '⚡ Strong Zigzag' : '⚡ Zigzag Mode';
    confExtra += alt >= 6 ? 6 : 4;
  } else if (alt >= 3) {
    if (currentSide === 'BIG') sS += 8; else sB += 8;
  }

  // 4. CLASSIC PATTERNS
  if (bsList.length >= 3 && bsList[0] === bsList[1] && bsList[1] === bsList[2]) {
    if (bsList[0] === 'BIG') sS += 14; else sB += 14;
    if (primaryPattern !== 'dragon_break') { primaryPattern = 'classic'; patternName = '📊 Classic Pattern'; }
  }
  if (bsList.length >= 3 && bsList[0] !== bsList[1] && bsList[1] !== bsList[2] && bsList[0] === bsList[2]) {
    if (currentSide === 'BIG') sS += 10; else sB += 10;
    primaryPattern = 'zigzag'; patternName = '⚡ Strong Zigzag';
  }

  // 5. RECOVERY MODE
  if (lossStreak >= 2) {
    const lastPred = bsList[0] === 'BIG' ? 'SMALL' : 'BIG'; // Assuming loss meant we predicted opposite
    if (lastPred === 'BIG') sS += 22; else sB += 22;
    primaryPattern = 'recovery'; patternName = '🛡 Recovery Mode'; mode = 'RECOVERY'; confExtra += 8;
  } else if (lossStreak === 1) {
    const lastPred = bsList[0] === 'BIG' ? 'SMALL' : 'BIG';
    if (lastPred === 'BIG') sS += 10; else sB += 10;
    confExtra += 3;
  }

  // 6. ANTI-REPEAT ENGINE
  if (lastPredictions.length >= 2) {
    if (lastPredictions[0] === 'BIG' && lastPredictions[1] === 'BIG') {
      sS += 12;
      primaryPattern = primaryPattern === 'recovery' ? 'recovery' : 'anti_repeat';
      if (primaryPattern === 'anti_repeat') patternName = '🔄 Anti Repeat';
    }
    if (lastPredictions[0] === 'SMALL' && lastPredictions[1] === 'SMALL') {
      sB += 12;
      primaryPattern = primaryPattern === 'recovery' ? 'recovery' : 'anti_repeat';
      if (primaryPattern === 'anti_repeat') patternName = '🔄 Anti Repeat';
    }
  }
  if (lastPredictions.length >= 3 && lastPredictions[0] === lastPredictions[1] && lastPredictions[1] === lastPredictions[2]) {
    if (lastPredictions[0] === 'BIG') sS += 20; else sB += 20;
    primaryPattern = 'force_balance'; patternName = '⚖️ Force Balance'; confExtra += 5;
  }

  // 7. PREDICTION BALANCER
  if (lastPredictions.length >= 4) {
    const lookP = Math.min(6, lastPredictions.length);
    let predBig = 0, predSmall = 0;
    for (let i = 0; i < lookP; i++) {
      if (lastPredictions[i] === 'BIG') predBig++; else predSmall++;
    }
    if (predBig >= 4) {
      sS += 14;
      if (primaryPattern !== 'recovery' && primaryPattern !== 'force_balance') { primaryPattern = 'force_balance'; patternName = '⚖️ Force Balance'; }
    }
    if (predSmall >= 4) {
      sB += 14;
      if (primaryPattern !== 'recovery' && primaryPattern !== 'force_balance') { primaryPattern = 'force_balance'; patternName = '⚖️ Force Balance'; }
    }
  }

  // FINAL DECISION
  let pred: PredictionSize;
  if (sB > sS + 2) {
    pred = 'BIG';
  } else if (sS > sB + 2) {
    pred = 'SMALL';
  } else {
    const b20t = countSide(bsList, 'BIG', 20);
    const s20t = countSide(bsList, 'SMALL', 20);
    if (b20t > s20t) pred = 'SMALL';
    else if (s20t > b20t) pred = 'BIG';
    else pred = opposite as PredictionSize;
    primaryPattern = 'chaos'; patternName = '🌀 Chaos / Mixed';
  }

  const scoreDiff = Math.abs(sB - sS);
  let conf = 52 + Math.min(33, Math.floor(scoreDiff * 0.9) + confExtra);
  conf = Math.min(85, Math.max(52, conf));
  let strength = 48 + Math.min(40, Math.floor(scoreDiff * 1.1) + confExtra);
  strength = Math.min(88, Math.max(48, strength));

  return { bs: pred, conf, strength, confBoost: confExtra, patternId: primaryPattern, patternName, mode, sB, sS };
}

export function generatePrimeNumbers(currentBS: PredictionSize, numList: number[], nextPeriod: string, isServer2: boolean) {
  const pool = currentBS === 'BIG' ? [5, 6, 7, 8, 9] : [0, 1, 2, 3, 4];
  const recent8 = numList.slice(0, 8);
  const freq: Record<number, number> = {};
  pool.forEach(n => { freq[n] = 0; });
  recent8.forEach(n => { if (freq[n] !== undefined) freq[n]++; });

  const scored = pool.map(n => {
    let score = 20 - (freq[n] * 5);
    if (n === numList[0]) score -= 6;
    if (currentBS === 'BIG' && (n === 6 || n === 7 || n === 8)) score += 2;
    if (currentBS === 'SMALL' && (n === 1 || n === 2 || n === 3)) score += 2;
    
    let magicMod = parseInt(String(nextPeriod).slice(-3)) || 0;
    if (isServer2) {
      // Advanced hash logic for Server 2 scoring
      magicMod = Array.from(nextPeriod).reduce((a, b) => a + b.charCodeAt(0), 0);
    }
    score += ((n * 7 + magicMod) % 4);
    return { n, score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  
  const primaryNumber = scored[0].n;
  // USER REQUIREMENT: "ek opposite number prediction de esa banana without screen par kuchh likhe ya change kiye bina"
  // So the second number must be the exact opposite of the first!
  const oppositeNumber = (primaryNumber + 5) % 10;
  
  return {
    primaryNumber,
    oppositeNumber
  };
}
