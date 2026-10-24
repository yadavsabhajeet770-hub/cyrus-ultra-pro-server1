import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fireConfetti } from './utils/confetti';

import {
  WingoDrawItem,
  StrategyResult,
  WingoHistoryRecord,
  Analysis500Data,
  Analysis100kData,
  AppSettings,
  AppStats,
  ServerEngine,
  AppNotification,
} from './types';
import {
  fetch500WingoHistory,
  fetch100kWingoAnalytics,
  getISTParts,
  getNextPeriodClock,
  pad,
  mergeWingoItems,
} from './services/api';
import {
  analyze500Data,
  generatePrediction,
  getSize,
  getColor,
} from './services/analyzer';
import { sound, vibrate } from './utils/audio';
import { getTheme, isSystemDark, applyThemeToDocument } from './utils/theme';
import {
  auth,
  onAuthStateChanged,
  signOut,
  syncHistoryRecordToCloud,
  fetchUserHistoryFromCloud,
  syncUserSettingsToCloud,
  fetchUserSettingsFromCloud,
  publishGlobalPredictionSignal,
} from './services/firebase';

import { Header } from './components/Header';
import { LiveStatusTicker } from './components/LiveStatusTicker';
import { PredictionHero } from './components/PredictionHero';
import { Data500Analytics } from './components/Data500Analytics';
import { StatsGrid } from './components/StatsGrid';
import { HistoryPanel } from './components/HistoryPanel';
import { GamePanel } from './components/GamePanel';
import { SettingsPanel } from './components/SettingsPanel';
import { FloatingNav, NavTab } from './components/FloatingNav';
import { AIChatModal } from './components/AIChatModal';
import { FloatingAIChatWidget } from './components/FloatingAIChatWidget';
import { IPhoneNotification } from './components/IPhoneNotification';
import { LoginScreen } from './components/LoginScreen';
import { TelegramBotModal } from './components/TelegramBotModal';
import {
  loadTelegramConfig,
  saveTelegramConfig,
  loadTelegramTemplates,
  sendTelegramMessage,
  sendTelegramSticker,
  formatPredictionMessage,
  formatWinMessage,
  formatJackpotMessage,
  formatLossMessage,
  appendTelegramLog,
  broadcastStartSessionPipeline,
  broadcastStopSessionPipeline,
  broadcastRoundResultPipeline,
  STICKERS,
} from './services/telegramBot';

export default function App() {
  // 1. App Authentication state (Firebase + Local Storage sync)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('ny_active_key_v7');
  });

  // Listen to Firebase auth changes & sync from Cloud
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setIsAuthenticated(true);
        if (user.displayName) {
          localStorage.setItem('ny_username', user.displayName);
          setSettings(s => ({ ...s, userName: user.displayName || s.userName }));
        }

        // Fetch persisted settings from Firestore Database
        fetchUserSettingsFromCloud(user.uid)
          .then(cloudSettings => {
            if (cloudSettings && Object.keys(cloudSettings).length > 0) {
              setSettings(prev => ({ ...prev, ...cloudSettings }));
            }
          })
          .catch(() => {});

        // Fetch persisted history records from Firestore Database
        fetchUserHistoryFromCloud(user.uid)
          .then(cloudHistory => {
            if (Array.isArray(cloudHistory) && cloudHistory.length > 0) {
              setHistory(cloudHistory);
            }
          })
          .catch(() => {});
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Settings state
  const [settings, setSettings] = useState<AppSettings>(() => {
    return {
      userName: localStorage.getItem('ny_username') || 'CYRUS VIP Player',
      userAvatar: localStorage.getItem('ny_user_avatar') || '',
      userTitle: localStorage.getItem('ny_user_title') || 'VIP ELITE',
      theme: (() => { const saved = localStorage.getItem('ny_theme'); return !saved || saved === 'green' ? 'ocean' : saved; })(),
      sound: localStorage.getItem('ny_sound') !== 'false',
      vibrate: localStorage.getItem('ny_vibrate') !== 'false',
      particles: localStorage.getItem('ny_particles') !== 'false',
      autoRefresh: localStorage.getItem('ny_autorefresh') !== 'false',
      refreshInterval: parseInt(localStorage.getItem('ny_interval') || '2', 10),
      recovery: localStorage.getItem('ny_recovery') !== 'false',
      showNums: localStorage.getItem('ny_shownums') !== 'false',
      resultNotifications: localStorage.getItem('ny_resultnotifications') !== 'false',
      server: (() => {
        const saved = parseInt(localStorage.getItem('ny_server') || '1', 10);
        return (saved === 2 || saved === 3 ? 2 : 1) as ServerEngine;
      })(),
      dataAnalysisMode: (localStorage.getItem('ny_dataanalysismode') as any) || '500_DATA',
      wingoMode: (localStorage.getItem('ny_wingomode') as any) || '30s',
      proxyUrl: localStorage.getItem('ny_proxy') || '',
      aiProxyUrl: localStorage.getItem('ny_ai_proxy') || '',
      activeKey: localStorage.getItem('ny_active_key_v7') || '',
    };
  });

  // 3. User Stats & History state
  const [stats, setStats] = useState<AppStats>(() => {
    try {
      const saved = localStorage.getItem('ny_stats_v7');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      wins: 0,
      losses: 0,
      jacks: 0,
      streak: 0,
      bestStreak: 0,
      lossRun: 0,
      recoveryActive: false,
    };
  });

  const [history, setHistory] = useState<WingoHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('ny_history_v7');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            period: String(item?.period || ''),
            wingoMode: item?.wingoMode || '30s',
            predicted: item?.predicted || 'BIG',
            suggestedNums: Array.isArray(item?.suggestedNums) ? item.suggestedNums : [],
            actualNum: item?.actualNum !== undefined ? item.actualNum : undefined,
            actualSize: item?.actualSize || undefined,
            result: item?.result || undefined,
            engine: item?.engine || 'CYRUS ULTRA™',
            confidence: item?.confidence || 85,
            timestamp: item?.timestamp || '',
          }));
        }
      }
    } catch {}
    return [];
  });

  // 4. Game URL & Persistence state across tab switching
  const [gameUrl, setGameUrl] = useState<string>(() => {
    const saved = localStorage.getItem('ny_current_game_url') || '';
    return saved.includes('dhaniwin.games') || saved.includes('9kclub1.com') ? saved : 'https://dhaniwin.games/register?inviteCode=HRJ4KLN&from=web';
  });

  // 5. Live Prediction State
  const [activeTab, setActiveTab] = useState<NavTab>('predictor');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [rawDraws, setRawDraws] = useState<WingoDrawItem[]>([]);
  const [analysis, setAnalysis] = useState<Analysis500Data>(() => analyze500Data([]));
  const [targetPeriod, setTargetPeriod] = useState<string>(() => getNextPeriodClock((localStorage.getItem('ny_wingomode') as any) || '30s'));
  const [prediction, setPrediction] = useState<StrategyResult | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);

  // Telegram Broadcaster State
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isTelegramActive, setIsTelegramActive] = useState<boolean>(() => {
    const cfg = loadTelegramConfig();
    return !!cfg.autoBroadcast && !!cfg.isVerified;
  });

  const getServerFullName = useCallback((s: ServerEngine) => {
    switch (s) {
      case 1:
        return 'SERVER 1 · CYRUS ULTRA™';
      case 2:
      default:
        return 'SERVER 2 · CYRUS PATTERNS™';
    }
  }, []);

  // Time & Clock state
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [istTimeStr, setIstTimeStr] = useState('--:--:--');

  // Ref tracking to prevent double resolution and duplicate broadcasts
  const lastResolvedPeriodRef = useRef<string>('');
  const lastKnownDrawIssueRef = useRef<string>('');
  const lastPredictedRef = useRef<{ period: string; pred: StrategyResult } | null>(null);
  // Keep Server 1 fixed within each active period despite polling or manual refreshes.
  const server1PeriodPredictionsRef = useRef<Map<string, StrategyResult>>(new Map());
  const generatePeriodPrediction = (server: ServerEngine, draws: WingoDrawItem[], data: Analysis500Data, period: string, cycle: number, lossStreak: number, recovery: boolean): StrategyResult => {
    if (server !== 1) return generatePrediction(server, draws, data, period, cycle, lossStreak, recovery);
    const key = `${settings.wingoMode || '30s'}:${period}`;
    const cache = server1PeriodPredictionsRef.current;
    const cached = cache.get(key);
    if (cached) return cached;
    const result = generatePrediction(server, draws, data, period, cycle, lossStreak, recovery);
    cache.set(key, result);
    if (cache.size > 80) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey !== undefined) cache.delete(oldestKey);
    }
    return result;
  };
  const lastBroadcastedPredPeriodRef = useRef<string>('');
  const lastBroadcastedResultPeriodRef = useRef<string>('');

  // Apply audio settings
  useEffect(() => {
    sound.setEnabled(settings.sound);
  }, [settings.sound]);

  // Persist stats and history
  useEffect(() => {
    localStorage.setItem('ny_stats_v7', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('ny_history_v7', JSON.stringify(history));
  }, [history]);

  // 100k Big Data Analytics Ref
  const analysis100kRef = useRef<Analysis100kData | null>(null);

  // Background 100k Big Data Syncer
  useEffect(() => {
    let isMounted = true;
    const load100k = async () => {
      try {
        const data100k = await fetch100kWingoAnalytics(settings.proxyUrl);
        if (data100k && isMounted) {
          analysis100kRef.current = data100k;
          setAnalysis(prev => ({
            ...prev,
            analysis100k: data100k,
          }));
        }
      } catch (err) {
        console.error('Failed to background load 100k analytics', err);
      }
    };

    load100k();
    const interval100k = setInterval(load100k, 5 * 60 * 1000); // sync 100k every 5 minutes
    return () => {
      isMounted = false;
      clearInterval(interval100k);
    };
  }, [settings.proxyUrl]);

  // Settings updater
  const handleUpdateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      Object.entries(updates).forEach(([k, v]) => {
        localStorage.setItem(`ny_${k.toLowerCase()}`, String(v));
      });
      if (auth.currentUser) {
        syncUserSettingsToCloud(auth.currentUser.uid, updates).catch(() => {});
      }
      return next;
    });
  }, []);

  // Instant Wingo Game Mode Switching Handler (30s vs 1min)
  const handleWingoModeChange = useCallback((mode: '30s' | '1min') => {
    sound.playClick();
    vibrate(25);
    handleUpdateSettings({ wingoMode: mode });
    lastKnownDrawIssueRef.current = '';
    lastResolvedPeriodRef.current = '';
    lastPredictedRef.current = null;
    lastBroadcastedPredPeriodRef.current = '';
    lastBroadcastedResultPeriodRef.current = '';
    setTargetPeriod(getNextPeriodClock(mode));
  }, [handleUpdateSettings]);

  // Instant server switching handler (Immediately re-analyzes with selected server algorithm)
  const handleServerChange = useCallback((newServer: ServerEngine) => {
    sound.playClick();
    vibrate(25);
    handleUpdateSettings({ server: newServer });

    // Instantly recompute prediction with the newly selected server engine
    if (rawDraws && rawDraws.length > 0) {
      const activeAnalysis = analysis.totalAnalyzed > 0 ? analysis : analyze500Data(rawDraws, analysis100kRef.current || undefined, history);
      const activePeriod = targetPeriod || getNextPeriodClock(settings.wingoMode || '30s');
      const pred = generatePeriodPrediction(
        newServer,
        rawDraws,
        activeAnalysis,
        activePeriod,
        cycleIndex,
        stats.lossRun,
        settings.recovery
      );
      setPrediction(pred);
      lastPredictedRef.current = { period: activePeriod, pred };

      // Volatility Guard alert check on server switch
      if (activeAnalysis?.volatilityGuard?.isHighEntropy || pred?.isSkip || (pred && pred.confidence < 50)) {
        if (settings.vibrate) {
          vibrate([100, 50, 100]);
        }
      }
    }
  }, [handleUpdateSettings, rawDraws, analysis, targetPeriod, settings.wingoMode, cycleIndex, stats.lossRun, settings.recovery, settings.vibrate]);

  // Recalculate and generate prediction
  const computePrediction = useCallback(
    (draws: WingoDrawItem[], dataAnalysis: Analysis500Data, nextPer: string) => {
      const pred = generatePeriodPrediction(
        settings.server,
        draws,
        dataAnalysis,
        nextPer,
        cycleIndex,
        stats.lossRun,
        settings.recovery
      );
      setPrediction(pred);
      lastPredictedRef.current = { period: nextPer, pred };

      // Volatility Guard: Trigger silent vibration alert when high entropy in last 10 periods is detected (confidence < 50%)
      if (dataAnalysis?.volatilityGuard?.isHighEntropy || pred?.isSkip || (pred && pred.confidence < 50)) {
        if (settings.vibrate) {
          vibrate([100, 50, 100]);
        }
      }

      // Publish live prediction signal to Firestore Global Signals
      if (nextPer && pred) {
        publishGlobalPredictionSignal(nextPer, pred).catch(() => {});

        // Auto-Broadcast live prediction signal to Telegram VIP Channel (EXACTLY ONCE per period)
        const tgCfg = loadTelegramConfig();
        if (
          tgCfg.autoBroadcast &&
          tgCfg.isVerified &&
          tgCfg.channelId &&
          lastBroadcastedPredPeriodRef.current !== nextPer
        ) {
          lastBroadcastedPredPeriodRef.current = nextPer;
          const tgTemplates = loadTelegramTemplates();
          const predMsg = formatPredictionMessage(
            tgTemplates.prediction,
            nextPer,
            getServerFullName(settings.server),
            pred
          );
          sendTelegramMessage(tgCfg.botToken, tgCfg.channelId, predMsg)
            .then(res => {
              appendTelegramLog({
                type: 'PREDICTION',
                message: `Auto-Broadcasted Signal for Period ${nextPer}`,
                status: res.success ? 'SUCCESS' : 'FAILED',
                error: res.error,
              });
            })
            .catch(() => {});
        }
      }
    },
    [settings.server, settings.recovery, settings.vibrate, settings.wingoMode, cycleIndex, stats.lossRun, getServerFullName]
  );

  // In-flight fetch lock to prevent overlapping network calls from freezing the applet
  const isFetchingRef = useRef(false);

  // Core Data & Resolution Cycle (Non-blocking & Auto-healing)
  const runPredictionCycle = useCallback(
    async (isManual: boolean = false, forceLatest: boolean = false): Promise<boolean> => {
      if (isFetchingRef.current) return false;
      isFetchingRef.current = true;
      if (isManual) {
        setIsManualRefreshing(true);
      }
      let hasResolvedNewDraw = false;
      const currentMode = settings.wingoMode || '30s';
      try {
        const forceFast = forceLatest || settings.dataAnalysisMode === '10_DATA';
        const desiredLimit = settings.dataAnalysisMode === '100_DATA' ? 100 : (settings.dataAnalysisMode === '10_DATA' ? 10 : 500);
        const draws = await fetch500WingoHistory(settings.proxyUrl, forceFast, currentMode, desiredLimit);

        if (draws && draws.length > 0) {
          setIsConnected(true);
          const latest = draws[0];
          const latestIssue = latest.issueNumber;
          const isNewDraw = lastKnownDrawIssueRef.current !== latestIssue;

          // 1. Next Period calculation
          let nextPer = getNextPeriodClock(currentMode);
          if (/^\d+$/.test(latestIssue)) {
            try {
              nextPer = String(BigInt(latestIssue) + 1n);
            } catch {
              nextPer = String(parseInt(latestIssue, 10) + 1);
            }
          }
          setTargetPeriod(nextPer);

          // 2. Only update heavy 500-draw analysis if new draw arrived or initial load
          let currentAnalysis = analysis;
          if (isNewDraw || rawDraws.length === 0 || isManual) {
            lastKnownDrawIssueRef.current = latestIssue;
            const combinedDraws = draws.length < 50 && rawDraws.length >= 50
              ? mergeWingoItems(draws, rawDraws, desiredLimit > 100 ? 500 : Math.max(100, desiredLimit))
              : draws;
            setRawDraws(combinedDraws);
            currentAnalysis = analyze500Data(combinedDraws, analysis100kRef.current || undefined, history);
            setAnalysis(currentAnalysis);
          }

          // 3. Check for draw result resolution
          if (latestIssue && lastResolvedPeriodRef.current !== latestIssue) {
            const pending = lastPredictedRef.current;
            const isMatchingPeriod =
              !pending ||
              !pending.period ||
              pending.period === '---' ||
              pending.period === latestIssue ||
              latestIssue.endsWith(pending.period) ||
              pending.period.endsWith(latestIssue) ||
              (latestIssue.length >= 4 && pending.period.length >= 4 && latestIssue.slice(-4) === pending.period.slice(-4));

            if (pending && pending.pred && isMatchingPeriod) {
              hasResolvedNewDraw = true;
              const actualNum = Math.abs(latest.number % 10);
              const actualSize = getSize(actualNum);
              const actualColor = getColor(actualNum);
              const actualColorFull = actualNum === 0 ? 'RED-VIOLET' : actualNum === 5 ? 'GREEN-VIOLET' : actualColor;

              const target = (pending.pred.focusTarget || pending.pred.pred || 'BIG').toUpperCase();

              const isRoundSkipped = Boolean(pending.pred.isSkip);
              let resultStatus: 'WIN' | 'LOSS' | 'JACKPOT' | 'SKIPPED' = 'LOSS';

              if (isRoundSkipped) {
                resultStatus = 'SKIPPED';
                sound.playClick();
                vibrate([40, 30, 40]);
              } else {
                let isWin = false;
                if (target === 'RED') {
                  isWin = actualNum === 2 || actualNum === 4 || actualNum === 6 || actualNum === 8 || actualNum === 0 || actualColor === 'RED';
                } else if (target === 'GREEN') {
                  isWin = actualNum === 1 || actualNum === 3 || actualNum === 7 || actualNum === 9 || actualNum === 5 || actualColor === 'GREEN';
                } else if (target === 'BIG') {
                  isWin = actualNum >= 5;
                } else if (target === 'SMALL') {
                  isWin = actualNum < 5;
                } else {
                  isWin = target === actualSize;
                }

                const pendingNums = Array.isArray(pending.pred.nums) ? pending.pred.nums : [];
                const isJackpot = pendingNums.includes(actualNum);

                if (isJackpot) {
                  resultStatus = 'JACKPOT';
                  sound.playJackpot();
                  vibrate([100, 50, 100, 50, 200]);
                  if (settings.particles) {
                    try {
                      fireConfetti({ particleCount: 75, spread: 80, origin: { y: 0.65 }, colors: ['#00e676', '#00b84a', '#fbbf24'] });
                    } catch {}
                  }
                  setStats(s => ({
                    ...s,
                    wins: s.wins + 1,
                    jacks: s.jacks + 1,
                    streak: s.streak + 1,
                    bestStreak: Math.max(s.bestStreak, s.streak + 1),
                    lossRun: 0,
                    recoveryActive: false,
                  }));
                } else if (isWin) {
                  resultStatus = 'WIN';
                  sound.playWin();
                  vibrate([80, 50, 80]);
                  if (settings.particles) {
                    try {
                      fireConfetti({ particleCount: 45, spread: 65, origin: { y: 0.7 }, colors: ['#00e676', '#00b84a', '#38bdf8'] });
                    } catch {}
                  }
                  setStats(s => ({
                    ...s,
                    wins: s.wins + 1,
                    streak: s.streak + 1,
                    bestStreak: Math.max(s.bestStreak, s.streak + 1),
                    lossRun: 0,
                    recoveryActive: false,
                  }));
                } else {
                  resultStatus = 'LOSS';
                  sound.playLoss();
                  vibrate(250);
                  setStats(s => {
                    const nextLoss = s.lossRun + 1;
                    return {
                      ...s,
                      losses: s.losses + 1,
                      streak: 0,
                      lossRun: nextLoss,
                      recoveryActive: settings.recovery && nextLoss >= 2,
                    };
                  });
                }
              }

              const pendingNums = Array.isArray(pending.pred.nums) ? pending.pred.nums : [];
              const record: WingoHistoryRecord = {
                period: (latestIssue || '').length > 6 ? latestIssue.slice(-6) : latestIssue || '',
                wingoMode: currentMode,
                predicted: pending.pred.pred,
                focusTarget: pending.pred.focusTarget,
                targetCategory: pending.pred.targetCategory,
                suggestedNums: [...pendingNums],
                actualNum,
                actualSize,
                actualColor: actualColorFull,
                result: resultStatus,
                isSkip: isRoundSkipped,
                skipReason: pending.pred.skipReason,
                engine: pending.pred.mode || 'CYRUS ULTRA™',
                confidence: pending.pred.confidence || 85,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              };

              setHistory(h => [record, ...(Array.isArray(h) ? h : []).slice(0, 99)]);
              setCycleIndex(c => c + 1);

              // Sync history record to Firestore Database
              if (auth.currentUser) {
                syncHistoryRecordToCloud(auth.currentUser.uid, record).catch(() => {});
              }

              // Auto-Broadcast Result Stickers & Result Messages to Telegram VIP Channel (EXACTLY ONCE per resolved period)
              const tgCfg = loadTelegramConfig();
              if (
                tgCfg.autoBroadcast &&
                tgCfg.isVerified &&
                tgCfg.channelId &&
                lastBroadcastedResultPeriodRef.current !== latestIssue
              ) {
                lastBroadcastedResultPeriodRef.current = latestIssue;
                const tgTemplates = loadTelegramTemplates();
                const sName = getServerFullName(settings.server);

                // 1. Send Result Message & Win/Loss/Jackpot Sticker in sequence
                await broadcastRoundResultPipeline(
                  tgCfg,
                  tgTemplates,
                  sName,
                  record,
                  resultStatus === 'WIN' || resultStatus === 'JACKPOT' ? stats.streak + 1 : 0,
                  resultStatus === 'LOSS' ? stats.lossRun + 1 : 0
                );

                // 2. Ordered gap (1.2s) before next prediction is sent
                await new Promise(resolve => setTimeout(resolve, 1200));
              }

              // Trigger iPhone / iOS Dynamic Island style Top Notification (if enabled in settings)
              if (settings.resultNotifications !== false) {
                const targetName = isRoundSkipped ? 'SKIP' : pending.pred.focusTarget || pending.pred.pred;
                const notifTitle =
                  isRoundSkipped
                    ? 'ROUND SKIPPED (PROTECTED)'
                    : resultStatus === 'JACKPOT'
                    ? 'JACKPOT HIT!'
                    : resultStatus === 'WIN'
                    ? 'WIN CONFIRMED!'
                    : 'ROUND LOSS';

                const notifMsg =
                  isRoundSkipped
                    ? (pending.pred.skipReason || 'Capital Protection: Passed round due to unstable pattern')
                    : resultStatus === 'JACKPOT'
                    ? `Lucky number #${actualNum} hit jackpot! +25X Win`
                    : resultStatus === 'WIN'
                    ? `Target [${targetName}] matched successfully!`
                    : `3X Martingale Recovery Signal Active`;

                setActiveNotification({
                  id: `${latestIssue}-${Date.now()}`,
                  type: isRoundSkipped ? 'SKIP' : resultStatus,
                  title: notifTitle,
                  message: notifMsg,
                  period: latestIssue || '',
                  target: targetName,
                  actualNum,
                  actualSize,
                  actualColor: actualColorFull,
                  isSkip: isRoundSkipped,
                  skipReason: pending.pred.skipReason,
                  streak: resultStatus === 'WIN' || resultStatus === 'JACKPOT' ? stats.streak + 1 : stats.streak,
                  timestamp: Date.now(),
                });
              }
            }

            lastResolvedPeriodRef.current = latestIssue;
          }

          // 4. Generate next prediction for target period
          computePrediction(draws, currentAnalysis, nextPer);
          return hasResolvedNewDraw;
        } else {
          setIsConnected(false);
          const clkPer = getNextPeriodClock(currentMode);
          setTargetPeriod(clkPer);
          if (rawDraws.length > 0) {
            const dataAnalysis = analysis.totalAnalyzed > 0 ? analysis : analyze500Data(rawDraws);
            computePrediction(rawDraws, dataAnalysis, clkPer);
          }
          return false;
        }
      } catch (err) {
        console.warn('Network / Proxy auto-healing triggered:', err);
        setIsConnected(false);
        const clkPer = getNextPeriodClock(currentMode);
        setTargetPeriod(clkPer);
        if (rawDraws.length > 0) {
          const dataAnalysis = analysis.totalAnalyzed > 0 ? analysis : analyze500Data(rawDraws);
          computePrediction(rawDraws, dataAnalysis, clkPer);
        }
        return false;
      } finally {
        setIsLoading(false);
        setIsManualRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [settings.proxyUrl, settings.server, settings.wingoMode, settings.recovery, settings.showNums, settings.particles, computePrediction, rawDraws, analysis, getServerFullName, stats]
  );

  // Sync prediction immediately whenever server engine selection changes
  useEffect(() => {
    if (rawDraws.length > 0) {
      const activeAnalysis = analysis.totalAnalyzed > 0 ? analysis : analyze500Data(rawDraws);
      const activePeriod = targetPeriod || getNextPeriodClock(settings.wingoMode || '30s');
      const pred = generatePeriodPrediction(
        settings.server,
        rawDraws,
        activeAnalysis,
        activePeriod,
        cycleIndex,
        stats.lossRun,
        settings.recovery
      );
      setPrediction(pred);
      lastPredictedRef.current = { period: activePeriod, pred };
    }
  }, [settings.server, settings.wingoMode]);

  // Live IST Clock and Countdown Timer (Adaptive 30s vs 60s Turnover Resolution)
  useEffect(() => {
    let lastSec = -1;
    let turboPollActive = false;
    let turboInterval: NodeJS.Timeout | null = null;

    const is30s = (settings.wingoMode || '30s') === '30s';
    const cycleSec = is30s ? 30 : 60;

    const clockInterval = setInterval(() => {
      const ist = getISTParts();
      setIstTimeStr(`${pad(ist.h)}:${pad(ist.m)}:${pad(ist.s)}`);
      const rem = cycleSec - (ist.s % cycleSec);
      setSecondsLeft(rem === 0 ? cycleSec : rem);

      if (ist.s !== lastSec) {
        lastSec = ist.s;

        // Completion & Turnover Boundary: (Seconds cycleSec - 1, 00..05)
        // Immediately start rapid Turbo Resolution polling (every 350ms)
        const modSec = ist.s % cycleSec;
        const isNearTurnover = modSec >= cycleSec - 1 || modSec <= 5;

        if (settings.autoRefresh && isNearTurnover) {
          if (!turboPollActive) {
            turboPollActive = true;
            runPredictionCycle(false, true);

            if (turboInterval) clearInterval(turboInterval);
            turboInterval = setInterval(async () => {
              const currentIst = getISTParts();
              const currentModSec = currentIst.s % cycleSec;
              if (currentModSec > 5 && currentModSec < cycleSec - 1) {
                turboPollActive = false;
                if (turboInterval) clearInterval(turboInterval);
                return;
              }
              const resolved = await runPredictionCycle(false, true);
              if (resolved) {
                // If resolved, pause turbo polling until next turnover
                turboPollActive = false;
                if (turboInterval) clearInterval(turboInterval);
              }
            }, 350);
          }
        } else {
          turboPollActive = false;
          if (turboInterval) {
            clearInterval(turboInterval);
            turboInterval = null;
          }
        }
      }
    }, 250);

    return () => {
      clearInterval(clockInterval);
      if (turboInterval) clearInterval(turboInterval);
    };
  }, [settings.autoRefresh, settings.wingoMode, runPredictionCycle]);

  // Initial and periodic refresh
  useEffect(() => {
    if (!isAuthenticated) return;
    runPredictionCycle(false);

    let intervalId: NodeJS.Timeout | null = null;
    if (settings.autoRefresh) {
      intervalId = setInterval(() => {
        runPredictionCycle(false);
      }, settings.refreshInterval * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated, settings.autoRefresh, settings.refreshInterval, runPredictionCycle]);

  // Clear stats & history
  const handleResetAll = () => {
    sound.playClick();
    setStats({
      wins: 0,
      losses: 0,
      jacks: 0,
      streak: 0,
      bestStreak: 0,
      lossRun: 0,
      recoveryActive: false,
    });
    setHistory([]);
    localStorage.removeItem('ny_stats_v7');
    localStorage.removeItem('ny_history_v7');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {}
    localStorage.removeItem('ny_active_key_v7');
    setIsAuthenticated(false);
  };

  // Test iPhone Dynamic Island Notification Banner
  const handleTestNotification = (type: 'WIN' | 'JACKPOT' | 'LOSS') => {
    const period = targetPeriod || getNextPeriodClock();
    const target = prediction?.focusTarget || prediction?.pred || 'BIG';

    let title = 'WIN CONFIRMED!';
    let message = `Target [${target}] matched successfully!`;
    let actualNum = target === 'BIG' ? 7 : 2;
    let actualSize = target === 'BIG' ? 'BIG' : 'SMALL';
    let actualColor = 'RED';

    if (type === 'JACKPOT') {
      title = 'JACKPOT HIT!';
      actualNum = 7;
      message = `Lucky sniper #7 hit jackpot! +25X Win`;
    } else if (type === 'LOSS') {
      title = 'ROUND LOSS';
      actualNum = target === 'BIG' ? 3 : 8;
      actualSize = target === 'BIG' ? 'SMALL' : 'BIG';
      message = '3X Martingale Recovery Signal Active';
    }

    setActiveNotification({
      id: `test-${Date.now()}`,
      type,
      title,
      message,
      period,
      target,
      actualNum,
      actualSize,
      actualColor,
      streak: type === 'WIN' || type === 'JACKPOT' ? stats.streak + 1 : 0,
      timestamp: Date.now(),
    });
  };

  const handleDismissNotification = useCallback(() => {
    setActiveNotification(null);
  }, []);

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => isSystemDark());

  // Listen to device dark mode changes dynamically in real time ("time to time")
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemPrefersDark(e.matches);
    };
    try {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    } catch {
      media.addListener(update);
      return () => media.removeListener(update);
    }
  }, []);

  const currentTheme = getTheme(settings.theme, systemPrefersDark);

  // Sync dark class on document element, html color-scheme, and theme-color meta tag
  useEffect(() => {
    const isDark = currentTheme.isDark;
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }

    const metaColor = document.querySelector('meta[name="color-scheme"]');
    if (metaColor) {
      metaColor.setAttribute('content', isDark ? 'dark' : 'light');
    }

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', currentTheme.bgBase || (isDark ? '#030805' : '#f4f8f5'));
    }

    // Dynamic Theme Color Variables for CSS Keyframes & Particle Effects
    applyThemeToDocument(currentTheme);
  }, [currentTheme]);

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={(name, email) => {
          localStorage.setItem('ny_active_key_v7', 'VIP_ACTIVE');
          localStorage.setItem('ny_username', name);
          setSettings(s => ({ ...s, userName: name, activeKey: 'VIP_ACTIVE' }));
          setIsAuthenticated(true);
        }}
        isDarkTheme={currentTheme.isDark}
      />
    );
  }

  const serverNames: Record<ServerEngine, string> = {
    1: 'Server 1: CYRUS ULTRA™ (Dual Size & Color Matrix + Dual Sure Numbers)',
    2: 'Server 2: CYRUS PATTERNS™ (SURESHOT Database 1=BIG, 2=SMALL + Single Precision Sniper Number)',
  };

  return (
    <div
      className={`min-h-screen w-full relative bg-gradient-to-b ${currentTheme.bgGradient} flex flex-col items-center pb-28 overflow-x-hidden transition-colors duration-500`}
    >
      {/* iOS iPhone Dynamic Island Notification Toast */}
      <IPhoneNotification
        notification={activeNotification}
        onDismiss={handleDismissNotification}
      />

      {/* Dynamic Fluid Liquid Mesh Orbs & Theme Multi-Hue Aurora */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Animated Top Edge Specular Theme Laser Beam */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] opacity-80 animate-gradient-flow-fast pointer-events-none"
          style={{
            background: `linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.accent}, ${currentTheme.secondary}, ${currentTheme.primary})`,
          }}
        />

        {/* Primary Dynamic Aurora Liquid Orb */}
        <div
          className="absolute -top-28 left-1/6 w-[450px] h-[450px] rounded-full blur-[115px] opacity-45 dark:opacity-35 animate-fluid-orb animate-aurora-shift"
          style={{
            background: `radial-gradient(circle, ${currentTheme.primary} 0%, ${currentTheme.accent} 55%, transparent 75%)`,
          }}
        />

        {/* Secondary Swirling Cosmic Wave */}
        <div
          className="absolute top-1/4 -right-32 w-[420px] h-[420px] rounded-full blur-[110px] opacity-40 dark:opacity-30 animate-fluid-orb animate-ambient-breathe"
          style={{
            background: `radial-gradient(circle, ${currentTheme.secondary} 0%, ${currentTheme.primary} 60%, transparent 80%)`,
            animationDelay: '-6s',
          }}
        />

        {/* Soft Accent Depth Bloom */}
        <div
          className="absolute -bottom-24 left-1/3 w-[480px] h-[480px] rounded-full blur-[125px] opacity-35 dark:opacity-25 animate-fluid-orb animate-aurora-shift"
          style={{
            background: `radial-gradient(circle, ${currentTheme.accent} 0%, ${currentTheme.secondary} 65%, transparent 80%)`,
            animationDelay: '-12s',
          }}
        />

        {/* Specular Liquid Light Flare */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-3/4 h-36 bg-gradient-to-b from-white/20 via-white/5 to-transparent blur-2xl rounded-full opacity-60 pointer-events-none" />
      </div>

      {/* Main Container */}
      <main
        className={`w-full relative z-10 transition-[max-width,padding] duration-200 ${
          activeTab === 'game'
            ? 'max-w-6xl px-2 pt-1.5 sm:pt-2'
            : activeTab === 'settings' || activeTab === 'analytics' || activeTab === 'history'
            ? 'max-w-2xl px-3 pt-3 sm:pt-4'
            : 'max-w-lg px-3 pt-3 sm:pt-4'
        }`}
      >
        {/* Zero-Lag Fast Persistent Tab Views */}
        <div className="w-full relative">
          {/* TAB 1: PREDICTOR HERO, HEADER & STATS */}
          <div
            className={`w-full transition-all duration-150 transform ${
              activeTab === 'predictor'
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto block'
                : 'opacity-0 translate-y-2 scale-[0.99] pointer-events-none hidden'
            }`}
            style={{ willChange: 'opacity, transform' }}
          >
            <Header
              userName={settings.userName}
              userAvatar={settings.userAvatar}
              userTitle={settings.userTitle}
              server={settings.server}
              onServerChange={handleServerChange}
              wingoMode={settings.wingoMode || '30s'}
              onWingoModeChange={handleWingoModeChange}
              onOpenSettings={() => setIsSettingsOpen(true)}
              isTelegramActive={isTelegramActive}
              soundEnabled={settings.sound}
              onToggleSound={() => handleUpdateSettings({ sound: !settings.sound })}
              themeColor={currentTheme.primary}
              isDarkTheme={currentTheme.isDark}
              theme={currentTheme}
              onLogout={handleLogout}
            />

            <LiveStatusTicker
              isConnected={isConnected}
              activeMode={prediction?.mode || 'Analyzing Patterns'}
              secondsLeft={secondsLeft}
              istTime={istTimeStr}
              totalLoaded={analysis.totalAnalyzed}
              recoveryActive={stats.recoveryActive}
              isDarkTheme={currentTheme.isDark}
              theme={currentTheme}
            />

            <PredictionHero
              period={targetPeriod}
              prediction={prediction}
              isLoading={isManualRefreshing}
              stats={stats}
              showNumbers={settings.showNums}
              onRefresh={() => runPredictionCycle(true)}
              serverName={serverNames[settings.server]}
              isDarkTheme={currentTheme.isDark}
              theme={currentTheme}
            />
            <StatsGrid stats={stats} history={history} isDarkTheme={currentTheme.isDark} theme={currentTheme} />
          </div>

          {/* TAB 2: ANALYTICS (Kept mounted for 0ms instant loading) */}
          <div
            className={`w-full transition-all duration-150 transform ${
              activeTab === 'analytics'
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto block'
                : 'opacity-0 translate-y-2 scale-[0.99] pointer-events-none hidden'
            }`}
            style={{ willChange: 'opacity, transform' }}
          >
            <Data500Analytics
              analysis={analysis}
              draws={rawDraws}
              stats={stats}
              history={history}
              settings={settings}
              isDarkTheme={currentTheme.isDark}
              theme={currentTheme}
            />
          </div>

          {/* TAB 3: HISTORY (Kept mounted for instant log inspection) */}
          <div
            className={`w-full transition-all duration-150 transform ${
              activeTab === 'history'
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto block'
                : 'opacity-0 translate-y-2 scale-[0.99] pointer-events-none hidden'
            }`}
            style={{ willChange: 'opacity, transform' }}
          >
            <HistoryPanel
              history={history}
              onClearHistory={handleResetAll}
              isDarkTheme={currentTheme.isDark}
            />
          </div>

          {/* TAB 4: PERSISTENT GAME WEBVIEW */}
          <div
            className={`w-full transition-all duration-150 transform ${
              activeTab === 'game'
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto block'
                : 'opacity-0 translate-y-2 scale-[0.99] pointer-events-none hidden'
            }`}
            style={{ willChange: 'opacity, transform' }}
          >
            <GamePanel
              isDarkTheme={currentTheme.isDark}
              theme={currentTheme}
              livePrediction={prediction}
              targetPeriod={targetPeriod}
              secondsLeft={secondsLeft}
              onRefreshPrediction={runPredictionCycle}
              savedGameUrl={gameUrl}
              onUrlChange={url => {
                setGameUrl(url);
                localStorage.setItem('ny_current_game_url', url);
              }}
            />
          </div>

          {/* TAB 5: DEDICATED FULL-PAGE SETTINGS */}
          <div
            className={`w-full transition-all duration-150 transform ${
              activeTab === 'settings'
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto block'
                : 'opacity-0 translate-y-2 scale-[0.99] pointer-events-none hidden'
            }`}
            style={{ willChange: 'opacity, transform' }}
          >
            <SettingsPanel
              isModal={false}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetStats={handleResetAll}
              onLogout={handleLogout}
              onTestNotification={handleTestNotification}
              draws={rawDraws}
              analysis={analysis}
              stats={stats}
              history={history}
              isDarkTheme={currentTheme.isDark}
            />
          </div>
        </div>
      </main>

      {/* Floating Corner AI Chatbot Widget */}
      <FloatingAIChatWidget
        onOpen={() => setIsAIChatOpen(true)}
        currentPrediction={
          prediction
            ? `${prediction.pred} ${
                Array.isArray(prediction.nums) && prediction.nums.length > 0
                  ? `[${prediction.nums.join(',')}]`
                  : ''
              }`
            : undefined
          }
        confidence={prediction?.confidence}
        isDarkTheme={currentTheme.isDark}
        theme={currentTheme}
      />

      {/* Settings Modal (When triggered from Header icon) */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        isModal={true}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetStats={handleResetAll}
        onLogout={handleLogout}
        onTestNotification={handleTestNotification}
        draws={rawDraws}
        analysis={analysis}
        stats={stats}
        history={history}
        isDarkTheme={currentTheme.isDark}
      />

      {/* CYRUS Gemini AI Assistant Modal */}
      <AIChatModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        currentPeriod={targetPeriod}
        currentPrediction={prediction?.pred || 'Calculating'}
        totalDraws={analysis.totalAnalyzed}
        bigPct={analysis.bigPct}
        smallPct={analysis.smallPct}
        streak={analysis.currentStreak.count}
        server={settings.server}
        isTelegramActive={isTelegramActive}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDarkTheme={currentTheme.isDark}
        theme={currentTheme}
      />

      {/* Liquid Bottom Navigation Bar */}
      <FloatingNav
        currentTab={activeTab}
        onTabChange={setActiveTab}
        isDarkTheme={currentTheme.isDark}
        theme={currentTheme}
      />
    </div>
  );
}
