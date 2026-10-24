import { PredictionSize, PredictionColor, WingoDrawItem } from '../types';

const BIG_POOL = [5, 6, 7, 8, 9];
const SMALL_POOL = [0, 1, 2, 3, 4];
const GREEN_POOL = [1, 3, 5, 7, 9];
const RED_POOL = [0, 2, 4, 6, 8];

export function executeEagleLogic(
    draws: WingoDrawItem[],
    nextPeriod: string,
    lossStreak: number,
    isServer2: boolean
) {
    const lastResultWasLoss = lossStreak > 0;
    
    // User's EXACT HTML logic mapping
    const numList = draws.map(d => Math.abs(Number(d.number) % 10));
    const fullSizes = numList.map(n => n >= 5 ? "B" : "S");
    const fullColors = numList.map(n => GREEN_POOL.includes(n) ? "G" : "R");

    let nextID = 0n;
    try {
        nextID = BigInt(nextPeriod);
    } catch {
        nextID = BigInt(Date.now());
    }

    // CYCLE LOGIC: every 2 rounds switches between COLOR and SIZE
    let cyclePosition = Number(nextID % 4n);
    let activeChannel = (cyclePosition < 2) ? "COLOR" : "SIZE";

    if (isServer2) {
        // Hash logic for Server 2
        const hash = Array.from(nextPeriod).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        cyclePosition = (Number(nextID % 4n) + (hash % 3)) % 4;
        activeChannel = (cyclePosition < 2) ? "COLOR" : "SIZE";
    }

    let optA = activeChannel === "COLOR" ? "G" : "B";
    let optB = activeChannel === "COLOR" ? "R" : "S";
    let seq = activeChannel === "COLOR" ? fullColors : fullSizes;

    let lastTrend = seq[0] || optA;
    let trendStreak = 0;
    for (let i = 0; i < seq.length; i++) {
        if (seq[i] === lastTrend) trendStreak++;
        else break;
    }

    let streakLimit = 3;
    if (isServer2) {
        const hash2 = Array.from(nextPeriod).reduce((acc, char) => acc + char.charCodeAt(0) * 2, 0);
        streakLimit = 2 + (hash2 % 3); 
    }

    // EXACT LOGIC: Break trend if streak >= 3
    let finalSide = (trendStreak >= streakLimit) ? (lastTrend === optA ? optB : optA) : lastTrend;

    // EXACT LOGIC: Max-1 Loss Shield Invert
    if (lastResultWasLoss) {
        finalSide = (finalSide === optA) ? optB : optA;
    }

    // EXACT LOGIC: Number pool selection
    let numericSeed = Number(nextID % 100n);
    if (isServer2) {
         const hash3 = Array.from(nextPeriod).reduce((acc, char) => acc + char.charCodeAt(0) * 3, 0);
         numericSeed = (numericSeed + hash3) % 100;
    }

    let displayString = "";
    let finalNum1 = 0, finalNum2 = 0;

    if (activeChannel === "COLOR") {
        displayString = finalSide === "G" ? "GREEN" : "RED";
        let winPool = finalSide === "G" ? GREEN_POOL : RED_POOL;
        let oppPool = finalSide === "G" ? RED_POOL : GREEN_POOL;
        finalNum1 = winPool[numericSeed % winPool.length];
        finalNum2 = oppPool[(numericSeed + 3) % oppPool.length];
    } else {
        displayString = finalSide === "B" ? "BIG" : "SMALL";
        let winPool = finalSide === "B" ? BIG_POOL : SMALL_POOL;
        let oppPool = finalSide === "B" ? SMALL_POOL : BIG_POOL;
        finalNum1 = winPool[numericSeed % winPool.length];
        finalNum2 = oppPool[(numericSeed + 3) % oppPool.length];
    }

    let sizePred: PredictionSize = "BIG";
    let colorPred: PredictionColor = "RED";
    let patternName = "";

    if (activeChannel === "COLOR") {
        colorPred = displayString as PredictionColor;
        sizePred = finalNum1 >= 5 ? "BIG" : "SMALL";
        patternName = `🔴🟢 COLOR ENGINE [${displayString}]`;
    } else {
        sizePred = displayString as PredictionSize;
        colorPred = GREEN_POOL.includes(finalNum1) ? "GREEN" : "RED";
        patternName = `🔵🟡 SIZE ENGINE [${displayString}]`;
    }

    if (lastResultWasLoss) {
        patternName += ' 🛡️ MAX-1 SHIELD INVERTED';
    } else if (trendStreak >= streakLimit) {
         patternName += ' ⚡ TREND BREAK';
    } else {
        patternName += ' 🚀 TREND FOLLOW';
    }

    if (isServer2) {
        patternName += ' (HASH SECURED)';
    }

    // In the UI we want to highlight the PRIMARY target (Size OR Color)
    // We pass this through focusTarget
    const focusTarget = activeChannel === "COLOR" ? colorPred : sizePred;

    return {
        sizePred,
        colorPred,
        nums: [finalNum1, finalNum2],
        patternName,
        activeChannel,
        focusTarget
    };
}
