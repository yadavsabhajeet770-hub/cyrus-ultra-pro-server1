export interface WingoDrawItem {
  issueNumber: string;
  number: number;
  colour?: string;
  premium?: string;
  openTime?: string;
}

export type PredictionSize = 'BIG' | 'SMALL';
export type PredictionColor = 'RED' | 'GREEN' | 'VIOLET';
export type BestPlayType = 'BIG_SMALL' | 'COLOR' | 'NUMBER_SNIPE' | 'COMBO_PLAY';

// 2 Ultra-Powerful Servers:
// 1 = CYRUS ULTRA™ (Hybrid Size/Color Dual Matrix + Max-1 Loss Shield + Dual Sure Numbers)
// 2 = CYRUS PATTERNS™ (SURESHOT_DATABASE Pattern Dictionary Logic 1=BIG, 2=SMALL + Single Precision Sniper Number)
export type ServerEngine = 1 | 2;

export type WingoMode = '30s' | '1min';
export type DataAnalysisMode = '10_DATA' | '100_DATA' | '500_DATA';

export interface HackSignal {
  title: string;
  badge: string;
  type: 'BIG_SMALL' | 'COLOR' | 'NUMBER' | 'COMBO';
  recommendation: string;
  target: string;
  confidence: number;
  reason: string;
  edgePct: number;
}

export interface DigitAnalysisItem {
  digit: number;
  prob: number;
  score: number;
  gap: number;
  isHot: boolean;
  isCold: boolean;
}

export type FocusTarget = 'BIG' | 'SMALL' | 'RED' | 'GREEN' | 'SKIP';
export type TargetCategory = 'SIZE' | 'COLOR';

export interface NumberDetail {
  num: number;
  type: 'PRIMARY' | 'HEDGE';
  label: string;
  reason: string;
}

export type TrendStatusType = 'SOLID' | 'HEALTHY' | 'VOLATILE' | 'CHOPPY' | 'DRAGON_EXHAUSTION' | 'COUNTER_TREND' | 'CAUTION';

export interface VolatilityGuardState {
  isHighEntropy: boolean;
  entropyScore: number; // 0 - 100%
  last10FlipRate: number; // 0 - 100%
  status: 'SECURE' | 'HIGH_ENTROPY_ALERT';
  alertMessage: string;
  confidenceDroppedBelow50: boolean;
  recent10Pattern: PredictionSize[];
}

export interface StrategyResult {
  pred: PredictionSize;
  nums: number[];
  numDetails?: NumberDetail[];
  isHedgeActive?: boolean;
  hedgeReason?: string;
  trendHealth?: number; // 0 - 100%
  trendStatus?: TrendStatusType;
  top4Nums?: number[];
  mode: string;
  confidence: number;
  bigProb: number;
  smallProb: number;
  reasoning: string;
  // Advanced Single Focus Prediction: BIG vs SMALL vs RED vs GREEN
  focusTarget: FocusTarget;
  targetCategory: TargetCategory;
  targetScores: {
    big: number;
    small: number;
    red: number;
    green: number;
  };
  // Advanced Smart Skip Protection System
  isSkip?: boolean;
  skipReason?: string;
  skipRiskLevel?: 'HIGH_CHOP' | 'PATTERN_CONFLICT' | 'FATIGUE_TRAP' | 'ENTROPY_ALERT';
  modeCategory?: string;
  baseWinRate?: number;
  confidenceMetrics?: {
    momentum: number;
    volatility: number;
    volume: number;
  };
  volatilityGuard?: VolatilityGuardState;
  // Cryptographic Hash Logic Details
  hashSignature?: string;
  hashEntropy?: number;
  hashAlgorithm?: string;
  detectedPatternName?: string;
  databasePatternDisplay?: string; // e.g. SSSSSBSSS:"1"
  databasePatternSignal?: '1' | '2';
  // Advanced Color & Number Hack Analytics
  colorPred?: PredictionColor;
  colorProb?: {
    red: number;
    green: number;
    violet: number;
  };
  bestPlayType?: BestPlayType;
  hackSignal?: HackSignal;
  allDigitsAnalysis?: DigitAnalysisItem[];
}

export interface WingoHistoryRecord {
  period: string;
  wingoMode?: WingoMode;
  predicted: PredictionSize;
  focusTarget?: FocusTarget;
  targetCategory?: TargetCategory;
  suggestedNums: number[];
  numDetails?: NumberDetail[];
  isHedgeActive?: boolean;
  actualNum?: number;
  actualSize?: PredictionSize;
  actualColor?: string;
  result?: 'WIN' | 'LOSS' | 'JACKPOT' | 'SKIPPED';
  isSkip?: boolean;
  skipReason?: string;
  engine: string;
  confidence: number;
  timestamp: string;
}

export interface DigitStat {
  digit: number;
  count: number;
  pct: number;
  gap: number;
  isHot: boolean;
  isCold: boolean;
}

export interface TrendPoint {
  period: string;
  num: number;
  size: PredictionSize;
  delta: number;
  ma7: number;
}

export interface DetectedPattern {
  id: string;
  name: string;
  category: 'TREND' | 'REVERSAL' | 'REPETITION' | 'CYCLE' | 'HARMONIC';
  matchScore: number;
  expectedOutcome: PredictionSize;
  targetDigits: number[];
  occurrencesIn500: number;
  successRate: number;
  description: string;
}

export interface PatternInsight {
  patternName: string;
  confidence: number;
  description: string;
  type: 'DRAGON' | 'ALTERNATION' | 'DOUBLE' | 'CHOPPY' | 'BALANCED' | 'SYMMETRIC' | 'STEP_STAIR';
  detectedPatterns?: DetectedPattern[];
  activeRule?: string;
}

export interface LivePatternAlert {
  id: string;
  patternType: string;
  patternFormula: string;
  matchedDepth: number;
  expectedNext: PredictionSize;
  confidence: number;
  betTimingSignal: 'STRONG_BET' | 'MODERATE_BET' | 'WAIT_AND_WATCH' | 'STRICT_SKIP';
  actionHindi?: string;
  actionEnglish: string;
  historicalHitRate: number;
  description: string;
  targetNumbers: number[];
}

export interface AdvancedTimingGuide {
  currentDecision: 'BET_NOW_HIGH_CONFIDENCE' | 'BET_MODERATE' | 'WAIT_NEXT_ROUND' | 'AVOID_TRAP_ZONE';
  badgeTitle: string;
  actionGuidanceHindi?: string;
  actionGuidanceEnglish: string;
  confidenceScore: number;
  recommendedStakeMultiplier: '1X' | '2X' | '3X' | '0X (SKIP)';
  riskIndex: number; // 0-100%
  consecutiveLossSafetyAlert: string;
  bestEntryStrategy: string;
}

export interface Analysis500Data {
  totalAnalyzed: number;
  bigCount: number;
  smallCount: number;
  bigPct: number;
  smallPct: number;
  digitStats: DigitStat[];
  hotDigits: number[];
  coldDigits: number[];
  recentSequence: { num: number; size: PredictionSize; period: string }[];
  currentStreak: { type: PredictionSize; count: number };
  alternationScore: number;
  markovTopDigits: number[];
  volatilityIndex: number;
  markovMatrix: number[][];
  streakDistribution: { big: number[]; small: number[] };
  trendTimeline: TrendPoint[];
  patternInsight: PatternInsight;
  detectedPatterns?: DetectedPattern[];
  livePatternAlerts?: LivePatternAlert[];
  timingGuide?: AdvancedTimingGuide;
  colorBreakdown: {
    green: number;
    red: number;
    violet: number;
    greenPct: number;
    redPct: number;
    violetPct: number;
  };
  oddEvenBreakdown: {
    odd: number;
    even: number;
    oddPct: number;
    evenPct: number;
  };
  volatilityGuard?: VolatilityGuardState;
  analysis100k?: Analysis100kData;
  patternLossAnalytics?: PatternLossAnalytics;
}

export interface PatternFrequencyStat {
  patternKey: string;
  patternName: string;
  category: 'DRAGON' | 'CYCLE' | 'TRAP' | 'MOMENTUM' | 'WAVE' | 'STUTTER' | 'HARMONIC' | 'GENERAL';
  sequenceLength: number;
  occurrencesIn500: number;
  frequencyPct: number;
  winsIn500: number;
  lossesIn500: number;
  winRate: number;
  expectedOutcome: PredictionSize;
  lastSeenGap: number; // in rounds
  riskLevel: 'SAFE_HIGH_ACCURACY' | 'MODERATE' | 'DANGEROUS_TRAP';
  behavior: string;
  hindiExplanation?: string;
  englishExplanation: string;
}

export interface LossForensicReport {
  id: string;
  period: string;
  predicted: PredictionSize;
  actual: PredictionSize;
  actualNum: number;
  actualColor: string;
  activePatternName: string;
  failureCategory: 'DRAGON_EXTENSION' | 'CHOP_BREAK' | 'STUTTER_HICCUP' | 'TRAP_SANDWICH' | 'ENTROPY_NOISE' | 'PARITY_SKEW' | 'GAP_EXTREME';
  rootCauseHindi?: string;
  rootCauseEnglish: string;
  patternFaultDetail: string;
  compensationAction: string;
  recoveryStakeAdvice: '1X Flat' | '2X Smart Martingale' | '1 Round Strict Skip';
  riskSeverity: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
}

export interface PatternLossAnalytics {
  totalLossesAnalyzed: number;
  totalWinsAnalyzed: number;
  empiricalWinRate: number;
  topLossPatterns: {
    patternName: string;
    lossCount: number;
    failRate: number;
    mainTrapReason: string;
  }[];
  topWinningPatterns: {
    patternName: string;
    winCount: number;
    winRate: number;
    edgeStrength: string;
  }[];
  failureCategoryBreakdown: {
    category: string;
    labelHindi?: string;
    labelEnglish: string;
    count: number;
    pct: number;
    color: string;
  }[];
  recentForensicReports: LossForensicReport[];
  patternFrequencyMatrix: PatternFrequencyStat[];
  recoverySuccessRate: number;
  antiTrapRulesHindi?: string[];
  antiTrapRulesEnglish: string[];
}

export interface Analysis100kData {
  totalDraws: number;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  bigCount: number;
  smallCount: number;
  bigPct: number;
  smallPct: number;
  colorBreakdown: {
    green: number;
    red: number;
    violet: number;
    greenPct: number;
    redPct: number;
    violetPct: number;
  };
  oddEvenBreakdown: {
    odd: number;
    even: number;
    oddPct: number;
    evenPct: number;
  };
  digitDistribution: {
    digit: number;
    count: number;
    pct: number;
    deviation: number;
    isHot: boolean;
    isCold: boolean;
  }[];
  allTimeLongestStreaks: {
    maxBigStreak: number;
    maxSmallStreak: number;
    maxRedStreak: number;
    maxGreenStreak: number;
    maxAlternationStreak: number;
  };
  markovOrder2: {
    pattern: string;
    nextBigProb: number;
    nextSmallProb: number;
    count: number;
  }[];
  markovOrder3: {
    pattern: string;
    nextBigProb: number;
    nextSmallProb: number;
    count: number;
  }[];
  hourlyStats: {
    hour: number;
    hourLabel: string;
    total: number;
    bigCount: number;
    smallCount: number;
    bigPct: number;
    smallPct: number;
    dominantSide: 'BIG' | 'SMALL' | 'BALANCED';
    volatility: 'LOW' | 'NORMAL' | 'HIGH';
  }[];
  currentHourInsight?: {
    hour: number;
    hourLabel: string;
    bigPct: number;
    smallPct: number;
    edge: string;
    recommendation: string;
  };
  patternHitRates100k: {
    patternName: string;
    occurrences: number;
    winRate: number;
    bestTarget: PredictionSize;
  }[];
  quantumEntropy100k: number;
  aiQuantumScore: number;
}

export interface LiveMarketTrendCondition {
  isPlayable: boolean;
  verdict: 'SAFE_TO_PLAY' | 'CAUTION_MODERATE' | 'DO_NOT_PLAY_HIGH_RISK';
  score: number; // 0 - 100
  statusBadge: string;
  title: string;
  mainAlert: string;
  recommendation: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  metrics: {
    entropyScore: number;
    dragonTrendScore: number;
    patternClarityScore: number;
    flipRateLast20: number;
    ratioImbalanceScore: number;
    reversalRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  factors: {
    label: string;
    status: 'EXCELLENT' | 'STABLE' | 'WARNING' | 'DANGER';
    value: string;
    description: string;
  }[];
}

export interface TrendAlertInfo {
  isActive: boolean;
  type: 'DRAGON_LONG_RUN' | 'MARKOV_HIGH_PROB' | 'CONSECUTIVE_COLOR' | 'ALTERNATION_PING_PONG';
  streakCount: number;
  target: string;
  probability: number;
  title: string;
  message: string;
  recommendation: string;
  riskLevel: 'PRIME_HIGH_WIN' | 'MODERATE' | 'CAUTION';
  timestamp?: string;
}

export interface PrimeTimeSlot {
  id: string;
  name: string;
  timeRange: string;
  startHour: number;
  endHour: number;
  accuracy: number;
  status: 'GOLDEN_PRIME' | 'MODERATE' | 'AVOID_CHOPPY';
  description: string;
  recommendedBetting: string;
  martingaleAdvice: string;
}

export interface AppSettings {
  userName: string;
  userAvatar?: string;
  userTitle?: string;
  theme: string;
  sound: boolean;
  vibrate: boolean;
  particles: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  recovery: boolean;
  showNums: boolean;
  resultNotifications?: boolean;
  server: ServerEngine;
  dataAnalysisMode?: DataAnalysisMode;
  wingoMode: WingoMode;
  proxyUrl: string;
  aiProxyUrl: string;
  activeKey: string;
}

export interface AppNotification {
  id: string;
  type: 'WIN' | 'LOSS' | 'JACKPOT' | 'SKIP';
  title: string;
  message: string;
  period: string;
  target: string;
  actualNum: number;
  actualSize: string;
  actualColor: string;
  streak?: number;
  isSkip?: boolean;
  skipReason?: string;
  timestamp: number;
}

export interface AppStats {
  wins: number;
  losses: number;
  jacks: number;
  streak: number;
  bestStreak: number;
  lossRun: number;
  recoveryActive: boolean;
}

export interface Collector247Stats {
  status: 'ACTIVE_RECORDING' | 'SYNCING' | 'STANDBY';
  totalCollected: number;
  todayCollected: number;
  totalUniquePeriods: number;
  collectionUptimeSeconds: number;
  uptimeFormatted: string;
  storageSizeBytes: number;
  storageSizeFormatted: string;
  firstPeriod: string;
  lastPeriod: string;
  lastCollectedDraw?: {
    issueNumber: string;
    number: number;
    colour: string;
    premium: string;
    openTime: string;
  };
  recentLogs: Array<{
    issueNumber: string;
    number: number;
    premium: string;
    colour: string;
    savedAt: string;
  }>;
  hourlyCollection: Array<{
    hour: number;
    hourLabel: string;
    count: number;
    percentage: number;
  }>;
  integrityScore: number;
  zeroLossGuarantee: boolean;
  isBackendRunning247: boolean;
  lastSyncTimestamp: number;
}
