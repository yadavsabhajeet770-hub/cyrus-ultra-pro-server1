import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Play,
  Square,
  Sparkles,
  Settings2,
  FileText,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  X,
  Activity,
  Smile,
} from 'lucide-react';
import {
  TelegramConfig,
  TelegramTemplates,
  TelegramLog,
  DEFAULT_BOT_TOKEN,
  DEFAULT_BOT_USERNAME,
  DEFAULT_BOT_LINK,
  DEFAULT_TEMPLATES,
  STICKERS,
  loadTelegramConfig,
  saveTelegramConfig,
  loadTelegramTemplates,
  saveTelegramTemplates,
  loadTelegramLogs,
  appendTelegramLog,
  verifyTelegramBotAndChannel,
  sendTelegramMessage,
  sendTelegramSticker,
  formatPredictionMessage,
  formatWinMessage,
  formatJackpotMessage,
  formatLossMessage,
  formatSessionStartMessage,
  formatSessionStopMessage,
  broadcastStartSessionPipeline,
  broadcastStopSessionPipeline,
} from '../services/telegramBot';
import { StrategyResult, ServerEngine, AppStats } from '../types';
import { sound, vibrate } from '../utils/audio';

interface TelegramBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: ServerEngine;
  currentPrediction: StrategyResult | null;
  targetPeriod: string;
  stats: AppStats;
  onToggleAutoBroadcast?: (active: boolean) => void;
  isAutoBroadcastActive?: boolean;
}

type TabType = 'SETUP' | 'TEMPLATES' | 'LOGS';
type TemplateKey = keyof TelegramTemplates;

export const TelegramBotModal: React.FC<TelegramBotModalProps> = ({
  isOpen,
  onClose,
  server,
  currentPrediction,
  targetPeriod,
  stats,
  onToggleAutoBroadcast,
  isAutoBroadcastActive = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('SETUP');
  const [config, setConfig] = useState<TelegramConfig>(loadTelegramConfig);
  const [templates, setTemplates] = useState<TelegramTemplates>(loadTelegramTemplates);
  const [logs, setLogs] = useState<TelegramLog[]>(loadTelegramLogs);

  const [activeTemplateKey, setActiveTemplateKey] = useState<TemplateKey>('prediction');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Sync state with storage on open
  useEffect(() => {
    if (isOpen) {
      const cfg = loadTelegramConfig();
      setConfig(cfg);
      setTemplates(loadTelegramTemplates());
      setLogs(loadTelegramLogs());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getServerName = (s: ServerEngine) => {
    switch (s) {
      case 1:
        return 'SERVER 1 · CYRUS ULTRA™';
      case 2:
        return 'SERVER 2 · CYRUS PATTERNS™';
      default:
        return 'SERVER 1 · CYRUS ULTRA™';
    }
  };

  const handleSaveConfig = (newCfg: TelegramConfig) => {
    setConfig(newCfg);
    saveTelegramConfig(newCfg);
  };

  const handleVerifyChannel = async () => {
    sound.playClick();
    vibrate(30);
    setIsVerifying(true);
    setVerifyResult(null);

    const res = await verifyTelegramBotAndChannel(config.botToken, config.channelId);
    setIsVerifying(false);
    setVerifyResult({ success: res.success, message: res.message });

    if (res.success) {
      sound.playWin();
      vibrate([50, 50, 100]);
      const updated: TelegramConfig = {
        ...config,
        isVerified: true,
        channelTitle: res.chatTitle,
        channelUsername: res.chatUsername,
        lastVerifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      handleSaveConfig(updated);

      appendTelegramLog({
        type: 'VERIFY',
        message: `Channel Verified: "${res.chatTitle}" (${res.chatUsername})`,
        status: 'SUCCESS',
      });
      setLogs(loadTelegramLogs());
    } else {
      sound.playLoss();
      vibrate(200);
      const updated: TelegramConfig = {
        ...config,
        isVerified: false,
      };
      handleSaveConfig(updated);

      appendTelegramLog({
        type: 'VERIFY',
        message: `Verification Failed for channel ${config.channelId}: ${res.message}`,
        status: 'FAILED',
        error: res.message,
      });
      setLogs(loadTelegramLogs());
    }
  };

  const handleStartBroadcast = async () => {
    sound.playClick();
    vibrate(40);

    if (!config.channelId) {
      alert('Please enter and verify your Telegram Channel ID first!');
      return;
    }

    const updated = { ...config, autoBroadcast: true };
    handleSaveConfig(updated);
    if (onToggleAutoBroadcast) onToggleAutoBroadcast(true);

    // Run strict ordered pipeline: Start Sticker -> Start Message -> Immediate 1st Prediction
    await broadcastStartSessionPipeline(
      config,
      templates,
      getServerName(server),
      currentPrediction,
      targetPeriod
    );

    setLogs(loadTelegramLogs());
  };

  const handleStopBroadcast = async () => {
    sound.playClick();
    vibrate(40);

    const updated = { ...config, autoBroadcast: false };
    handleSaveConfig(updated);
    if (onToggleAutoBroadcast) onToggleAutoBroadcast(false);

    if (config.channelId) {
      // Run strict ordered pipeline: Stop Sticker -> Stop Summary Message
      await broadcastStopSessionPipeline(
        config,
        templates,
        stats.wins,
        stats.losses
      );
      setLogs(loadTelegramLogs());
    }
  };

  const handleSendTestPrediction = async () => {
    if (!config.channelId) {
      alert('Please enter and verify your Channel ID first!');
      return;
    }

    sound.playClick();
    vibrate(30);
    setIsSendingTest(true);
    setTestSuccessMessage(null);

    const mockPred: StrategyResult = currentPrediction || {
      pred: 'BIG',
      nums: [1, 3, 8],
      colorPred: 'GREEN',
      confidence: 96,
      mode: getServerName(server),
      bigProb: 92,
      smallProb: 8,
      trendHealth: 98,
      trendStatus: 'SOLID',
      colorProb: { red: 10, green: 90, violet: 0 },
      reasoning: 'Test signal from CYRUS VIP Control Panel',
      focusTarget: 'BIG',
      targetCategory: 'SIZE',
      targetScores: { big: 92, small: 8, red: 10, green: 90 },
      isSkip: false,
      skipReason: '',
      top4Nums: [1, 3, 8, 5],
      numDetails: [],
    };

    const text = formatPredictionMessage(
      templates.prediction,
      targetPeriod || '20260822100',
      getServerName(server),
      mockPred
    );

    const res = await sendTelegramMessage(config.botToken, config.channelId, text);
    setIsSendingTest(false);

    if (res.success) {
      sound.playWin();
      vibrate([40, 40, 80]);
      setTestSuccessMessage('Test prediction sent to channel!');
      setTimeout(() => setTestSuccessMessage(null), 4000);
      appendTelegramLog({
        type: 'PREDICTION',
        message: `Sent Test Signal for period ${targetPeriod || 'TEST'}`,
        status: 'SUCCESS',
      });
      setLogs(loadTelegramLogs());
    } else {
      sound.playLoss();
      alert(`Failed to send test message: ${res.error}`);
      appendTelegramLog({
        type: 'PREDICTION',
        message: 'Failed to send test prediction',
        status: 'FAILED',
        error: res.error,
      });
      setLogs(loadTelegramLogs());
    }
  };

  const handleSendTestSticker = async (stickerType: keyof typeof STICKERS, label: string) => {
    if (!config.channelId) {
      alert('Please enter and verify your Channel ID first!');
      return;
    }

    sound.playClick();
    vibrate(25);
    const stickerId = STICKERS[stickerType];
    const res = await sendTelegramSticker(config.botToken, config.channelId, stickerId);

    if (res.success) {
      sound.playWin();
      setTestSuccessMessage(`Sent ${label} Sticker to channel!`);
      setTimeout(() => setTestSuccessMessage(null), 3000);
      appendTelegramLog({
        type: 'STICKER',
        message: `Sent ${label} Sticker`,
        stickerId,
        status: 'SUCCESS',
      });
      setLogs(loadTelegramLogs());
    } else {
      sound.playLoss();
      alert(`Failed to send sticker: ${res.error}`);
    }
  };

  const handleResetTemplates = () => {
    if (window.confirm('Reset all templates to default VIP format?')) {
      sound.playClick();
      setTemplates(DEFAULT_TEMPLATES);
      saveTelegramTemplates(DEFAULT_TEMPLATES);
    }
  };

  const handleCopyVariable = (varName: string) => {
    sound.playClick();
    vibrate(20);
    navigator.clipboard.writeText(varName);
    setCopiedVar(varName);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const isBroadcasting = config.autoBroadcast || isAutoBroadcastActive;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      id="telegram-bot-modal-overlay"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-[#090f0c] border border-emerald-500/30 text-white shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden"
        id="telegram-bot-modal-container"
      >
        {/* Top Glow Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-[#0088ff] via-[#00ffaa] to-[#7b2ff7]" />

        {/* Modal Header */}
        <div className="px-3.5 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between border-b border-emerald-500/20 bg-emerald-950/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#0088ff] to-[#00c6ff] flex items-center justify-center shadow-md shadow-sky-500/30 flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-white" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-xs sm:text-sm font-black font-space tracking-wide text-white truncate">
                  TELEGRAM BROADCASTER
                </h2>
                {isBroadcasting && (
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/50 text-[#00ffaa] text-[9px] font-mono font-black flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ffaa]" />
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
                Auto-send prediction signals & stickers to your channel
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10 flex-shrink-0"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation - Fixed for Mobile */}
        <div className="grid grid-cols-3 gap-1 p-1.5 bg-black/50 border-b border-emerald-500/15">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('SETUP');
            }}
            className={`flex items-center justify-center gap-1 py-1.5 sm:py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold font-space uppercase transition-all ${
              activeTab === 'SETUP'
                ? 'bg-gradient-to-r from-[#0088ff] to-[#00c6ff] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings2 size={13} className="flex-shrink-0" />
            <span className="truncate">Bot Setup</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('TEMPLATES');
            }}
            className={`flex items-center justify-center gap-1 py-1.5 sm:py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold font-space uppercase transition-all ${
              activeTab === 'TEMPLATES'
                ? 'bg-gradient-to-r from-emerald-500 to-[#00ffaa] text-black font-black shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText size={13} className="flex-shrink-0" />
            <span className="truncate">Templates</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('LOGS');
            }}
            className={`flex items-center justify-center gap-1 py-1.5 sm:py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold font-space uppercase transition-all ${
              activeTab === 'LOGS'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity size={13} className="flex-shrink-0" />
            <span className="truncate">Logs</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 custom-scrollbar">
          {/* TAB 1: EASY BOT SETUP */}
          {activeTab === 'SETUP' && (
            <div className="space-y-3.5">
              {/* STEP 1: Direct Clickable Bot Link Card */}
              <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-sky-950/60 via-[#0a1b22] to-black/70 border border-sky-500/35 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] font-black flex items-center justify-center">
                      1
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white">Add Bot to Your Channel</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[9px] font-bold">
                    Official Bot
                  </span>
                </div>

                <p className="text-[11px] sm:text-xs text-slate-300 leading-snug">
                  Click the button below to open <b>@{DEFAULT_BOT_USERNAME}</b>. Add it to your channel as an <b>Administrator</b> with <b>Post Messages</b> permission.
                </p>

                <a
                  href={DEFAULT_BOT_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    sound.playClick();
                    vibrate(25);
                  }}
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#0088ff] to-[#00c6ff] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-md shadow-sky-500/30"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
                  </svg>
                  <span>Open @{DEFAULT_BOT_USERNAME}</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* STEP 2: Channel ID Input & Verify */}
              <div className="p-3 sm:p-4 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-black text-[10px] font-black flex items-center justify-center">
                      2
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white">Enter & Verify Channel</span>
                  </div>
                  {config.isVerified && (
                    <span className="text-[10px] font-bold text-[#00ffaa] flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={config.channelId}
                      onChange={e => {
                        setVerifyResult(null);
                        handleSaveConfig({ ...config, channelId: e.target.value.trim(), isVerified: false });
                      }}
                      placeholder="@YourChannel or -100123456789"
                      className="w-full px-3 py-2 sm:py-2.5 rounded-xl bg-black/80 border border-emerald-500/30 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-emerald-400 placeholder:text-slate-500"
                    />
                  </div>

                  <button
                    onClick={handleVerifyChannel}
                    disabled={isVerifying || !config.channelId}
                    className={`px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all font-space flex-shrink-0 ${
                      config.isVerified
                        ? 'bg-emerald-500/20 text-[#00ffaa] border border-emerald-500/50 hover:bg-emerald-500/30'
                        : 'bg-gradient-to-r from-emerald-500 to-[#00ffaa] text-black font-black hover:opacity-95 shadow-md shadow-emerald-500/20'
                    } disabled:opacity-50`}
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : config.isVerified ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Re-Verify</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={14} />
                        <span>Verify Channel</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Verification result feedback */}
                {verifyResult && (
                  <div
                    className={`p-2.5 rounded-xl text-[11px] sm:text-xs font-medium flex items-center gap-2 ${
                      verifyResult.success
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {verifyResult.success ? (
                      <CheckCircle2 size={15} className="flex-shrink-0" />
                    ) : (
                      <AlertTriangle size={15} className="flex-shrink-0" />
                    )}
                    <span className="leading-tight">{verifyResult.message}</span>
                  </div>
                )}

                {config.isVerified && config.channelTitle && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-[11px] sm:text-xs flex-wrap gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00ffaa] animate-ping" />
                      <span className="text-slate-300">Connected:</span>
                      <b className="text-white">{config.channelTitle}</b>
                      {config.channelUsername && (
                        <span className="text-emerald-400 font-mono">({config.channelUsername})</span>
                      )}
                    </div>
                    {config.lastVerifiedAt && (
                      <span className="text-[10px] text-slate-400 font-mono">Synced {config.lastVerifiedAt}</span>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 3: Broadcast Controls */}
              <div className="p-3 sm:p-4 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-black flex items-center justify-center">
                      3
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white">Broadcast Controls</span>
                  </div>

                  <label className="text-[11px] sm:text-xs text-slate-300 font-medium flex items-center gap-1.5 cursor-pointer bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={config.sendStickers}
                      onChange={e => handleSaveConfig({ ...config, sendStickers: e.target.checked })}
                      className="rounded border-emerald-500 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Auto Stickers</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {!isBroadcasting ? (
                    <button
                      onClick={handleStartBroadcast}
                      className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-[#00e676] to-[#00ffaa] text-black font-black text-xs sm:text-sm uppercase font-space tracking-wide flex items-center justify-center gap-1.5 hover:opacity-95 active:scale-95 transition-all shadow-md shadow-emerald-500/25"
                    >
                      <Play size={16} className="fill-black" />
                      <span>START BROADCAST</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopBroadcast}
                      className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs sm:text-sm uppercase font-space tracking-wide flex items-center justify-center gap-1.5 hover:opacity-95 active:scale-95 transition-all shadow-md shadow-rose-600/25 animate-pulse"
                    >
                      <Square size={16} className="fill-white" />
                      <span>STOP BROADCAST</span>
                    </button>
                  )}

                  <button
                    onClick={handleSendTestPrediction}
                    disabled={isSendingTest || !config.channelId}
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#0088ff] to-[#00c6ff] text-white font-black text-xs sm:text-sm uppercase font-space tracking-wide flex items-center justify-center gap-1.5 hover:opacity-95 active:scale-95 transition-all shadow-md shadow-sky-500/25 disabled:opacity-50"
                  >
                    {isSendingTest ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>SEND TEST SIGNAL</span>
                      </>
                    )}
                  </button>
                </div>

                {testSuccessMessage && (
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-[#00ffaa] text-[11px] sm:text-xs font-bold text-center animate-fade-in">
                    {testSuccessMessage}
                  </div>
                )}
              </div>

              {/* Quick Stickers Test Grid */}
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    <Smile size={13} className="text-amber-400" />
                    <span>Test VIP Stickers:</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Click to send to channel</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    onClick={() => handleSendTestSticker('startSession', 'Start Session')}
                    className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-slate-200 transition-colors truncate"
                  >
                    Start Sticker
                  </button>
                  <button
                    onClick={() => handleSendTestSticker('win', 'Win')}
                    className="px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-medium text-emerald-300 transition-colors truncate"
                  >
                    Win Sticker
                  </button>
                  <button
                    onClick={() => handleSendTestSticker('jackpot', 'Jackpot')}
                    className="px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-medium text-amber-300 transition-colors truncate"
                  >
                    Jackpot Sticker
                  </button>
                  <button
                    onClick={() => handleSendTestSticker('loss', 'Loss / Recovery')}
                    className="px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[11px] font-medium text-rose-300 transition-colors truncate"
                  >
                    Loss Sticker
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEMPLATES SETUP */}
          {activeTab === 'TEMPLATES' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold font-space text-white">CUSTOMIZE TEMPLATES</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">Modify signals text sent to your channel</p>
                </div>
                <button
                  onClick={handleResetTemplates}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] sm:text-[11px] text-slate-300 hover:text-white flex items-center gap-1 transition-colors font-mono"
                >
                  <RotateCcw size={11} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Template Category Selector Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-black/60 border border-emerald-500/20">
                {[
                  { key: 'prediction' as TemplateKey, label: 'Prediction' },
                  { key: 'win' as TemplateKey, label: 'Win Signal' },
                  { key: 'jackpot' as TemplateKey, label: 'Jackpot Hit' },
                  { key: 'loss' as TemplateKey, label: 'Loss/Recovery' },
                  { key: 'startSession' as TemplateKey, label: 'Start Session' },
                  { key: 'stopSession' as TemplateKey, label: 'Stop Session' },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => {
                      sound.playClick();
                      setActiveTemplateKey(t.key);
                    }}
                    className={`px-2 py-1.5 rounded-xl text-[11px] font-bold transition-all truncate text-center ${
                      activeTemplateKey === t.key
                        ? 'bg-gradient-to-r from-emerald-500 to-[#00ffaa] text-black font-black shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Active Template Editor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                  <span className="font-mono text-emerald-400 font-bold uppercase">
                    {activeTemplateKey} Template (HTML)
                  </span>
                  <span className="text-slate-400">&lt;b&gt;, &lt;i&gt;, &lt;code&gt; supported</span>
                </div>
                <textarea
                  rows={7}
                  value={templates[activeTemplateKey]}
                  onChange={e => {
                    const updated = { ...templates, [activeTemplateKey]: e.target.value };
                    setTemplates(updated);
                    saveTelegramTemplates(updated);
                  }}
                  className="w-full p-3 rounded-xl bg-black/80 border border-emerald-500/30 text-emerald-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-emerald-400 custom-scrollbar"
                />
              </div>

              {/* Dynamic Variables Legend */}
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <HelpCircle size={12} className="text-sky-400" />
                    <span>Variables (Tap to Copy):</span>
                  </span>
                  {copiedVar && (
                    <span className="text-[10px] text-emerald-400 font-mono animate-fade-in">
                      Copied {copiedVar} ✓
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {[
                    '{period}',
                    '{server}',
                    '{prediction}',
                    '{numbers}',
                    '{color}',
                    '{confidence}',
                    '{actual_num}',
                    '{actual_size}',
                    '{streak}',
                    '{hit_number}',
                    '{next_step}',
                    '{total_wins}',
                    '{total_loss}',
                    '{time}',
                  ].map(v => (
                    <button
                      key={v}
                      onClick={() => handleCopyVariable(v)}
                      className="px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 rounded-2xl bg-gradient-to-b from-sky-950/30 to-black/60 border border-sky-500/20 space-y-1">
                <div className="text-[9px] font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={10} />
                  <span>Live Preview</span>
                </div>
                <div
                  className="p-2.5 rounded-xl bg-black/80 border border-sky-500/20 text-[11px] text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto"
                  dangerouslySetInnerHTML={{
                    __html: formatPredictionMessage(
                      templates[activeTemplateKey],
                      targetPeriod || '20260822100',
                      getServerName(server),
                      currentPrediction || {
                        pred: 'BIG',
                        nums: [1, 3, 8],
                        colorPred: 'GREEN',
                        confidence: 96,
                        mode: getServerName(server),
                        bigProb: 92,
                        smallProb: 8,
                        trendHealth: 98,
                        trendStatus: 'SOLID',
                        colorProb: { red: 10, green: 90, violet: 0 },
                        reasoning: 'Live preview matrix',
                        focusTarget: 'BIG',
                        targetCategory: 'SIZE',
                        targetScores: { big: 92, small: 8, red: 10, green: 90 },
                        isSkip: false,
                        skipReason: '',
                        top4Nums: [1, 3, 8, 5],
                        numDetails: [],
                      }
                    ),
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: BROADCAST LOGS */}
          {activeTab === 'LOGS' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold font-space text-white">BROADCAST LOGS</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">History of signals sent to your channel</p>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    localStorage.removeItem('ny_telegram_logs_v2');
                    setLogs([]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[10px] sm:text-[11px] text-rose-300 font-mono transition-colors"
                >
                  Clear Logs
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-black/40 border border-white/10 text-slate-400 text-xs">
                  No telegram broadcast logs yet. Start broadcasting or send a test signal to view live logs.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {logs.map(log => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-black/60 border border-emerald-500/20 flex items-start justify-between gap-2 text-[11px]"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-black ${
                              log.status === 'SUCCESS'
                                ? 'bg-emerald-500/20 text-[#00ffaa] border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {log.type}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">{log.timestamp}</span>
                        </div>
                        <p className="text-slate-200 font-medium truncate">{log.message}</p>
                        {log.error && <p className="text-rose-400 font-mono text-[9px]">Error: {log.error}</p>}
                      </div>

                      <span
                        className={`text-[9px] font-bold font-mono flex-shrink-0 ${
                          log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 bg-black/60 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className="w-2 h-2 rounded-full bg-[#0088ff] flex-shrink-0" />
            <span className="truncate">Bot: @{DEFAULT_BOT_USERNAME}</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold transition-colors text-xs flex-shrink-0"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
