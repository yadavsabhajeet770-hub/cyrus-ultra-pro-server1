import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Shield,
  CornerDownLeft,
  ChevronDown,
  ChevronUp,
  Coins,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Calculator,
} from 'lucide-react';
import { sound, vibrate } from '../utils/audio';
import { ServerEngine } from '../types';
import { ThemeDef } from '../utils/theme';

export interface NextRoundBetPlan {
  walletBalance: number;
  currentLevel: number;
  totalLevels: number;
  multiplier: number;
  baseBet: number;
  requiredBet: number;
  totalRiskToCurrentLevel: number;
  potentialPayout: number;
  netProfit: number;
  remainingBalance: number;
  isSafe: boolean;
  warning?: string;
  levels: Array<{
    level: number;
    bet: number;
    win: number;
    netProfit: number;
    cumulativeRisk: number;
  }>;
}

/**
 * Calculates the exact required betting amount for the next round based on a user's
 * current wallet balance and the configured recovery strategy level.
 */
export function calculateNextRoundBet(
  walletBalance: number,
  currentLevel: number = 1,
  totalLevels: number = 5,
  multiplier: number = 1.96
): NextRoundBetPlan {
  const mult = Math.max(1.01, multiplier);
  const lvls = Math.max(1, Math.min(10, totalLevels));
  const lvl = Math.max(1, Math.min(lvls, currentLevel));
  const ratio = mult / (mult - 1);
  const factor = (Math.pow(ratio, lvls) - 1) / (ratio - 1);
  const base = Math.max(1, Math.floor(walletBalance / factor));

  const levels: Array<{
    level: number;
    bet: number;
    win: number;
    netProfit: number;
    cumulativeRisk: number;
  }> = [];

  let sum = 0;
  for (let i = 0; i < lvls; i++) {
    let bet = 0;
    if (i === 0) {
      bet = base;
    } else {
      const minNeeded = Math.ceil((sum + Math.max(1, Math.floor(base * 0.5))) / (mult - 1));
      const geoBet = Math.floor(base * Math.pow(ratio, i));
      bet = Math.max(minNeeded, geoBet);
    }
    sum += bet;
    const win = Math.round(bet * mult * 10) / 10;
    const netProfit = Math.round((win - sum) * 10) / 10;
    levels.push({
      level: i + 1,
      bet,
      win,
      netProfit,
      cumulativeRisk: sum,
    });
  }

  const targetLevelObj = levels[lvl - 1] || levels[0];
  const requiredBet = targetLevelObj ? targetLevelObj.bet : base;
  const totalRiskToCurrentLevel = targetLevelObj ? targetLevelObj.cumulativeRisk : requiredBet;
  const isSafe = walletBalance >= totalRiskToCurrentLevel;
  const potentialPayout = targetLevelObj ? targetLevelObj.win : Math.round(requiredBet * mult * 10) / 10;
  const netProfit = targetLevelObj ? targetLevelObj.netProfit : Math.round((potentialPayout - totalRiskToCurrentLevel) * 10) / 10;
  const remainingBalance = Math.max(0, walletBalance - sum);

  return {
    walletBalance,
    currentLevel: lvl,
    totalLevels: lvls,
    multiplier: mult,
    baseBet: base,
    requiredBet,
    totalRiskToCurrentLevel,
    potentialPayout,
    netProfit,
    remainingBalance,
    isSafe,
    warning: !isSafe ? 'Wallet balance is low for this level backup.' : undefined,
    levels,
  };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
  actions?: Array<{ label: string; action: 'open_telegram' | 'open_settings' | 'open_level_calculator' }>;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPeriod: string;
  currentPrediction: string;
  totalDraws: number;
  bigPct: number;
  smallPct: number;
  streak: number;
  server?: ServerEngine;
  isTelegramActive?: boolean;
  onOpenTelegram?: () => void;
  onOpenSettings?: () => void;
  isDarkTheme?: boolean;
  theme?: ThemeDef;
}

/**
 * Premium text parser: removes raw markdown ** symbols, parses tokens,
 * renders high-end cards for steps/rules/levels, and highlights currency and profits.
 */
const FormattedMessage: React.FC<{ text: string; isAI: boolean }> = ({ text, isAI }) => {
  if (!isAI) {
    return <span>{text.replace(/\*\*/g, '')}</span>;
  }

  const lines = text.split('\n');

  // Helper to render inline elements (bold, currency, tags) with zero raw asterisks
  const renderInline = (str: string) => {
    // Regex splits by **...**, currency ₹..., and percentages
    const parts = str.split(/(\*\*[^*]+\*\*|₹\d+(?:,\d+)*(?:\.\d+)?|\+\s*₹\d+(?:,\d+)*(?:\.\d+)?|\d+%\s*(?:confidence)?)/g);

    return parts.map((part, idx) => {
      if (!part) return null;

      // Handle **bold**
      if (part.startsWith('**') && part.endsWith('**')) {
        const clean = part.slice(2, -2);
        return (
          <span
            key={idx}
            className="font-extrabold text-[#00ffaa] drop-shadow-[0_0_8px_rgba(0,255,170,0.3)] tracking-wide"
          >
            {clean}
          </span>
        );
      }

      // Handle profit like +₹28.8
      if (/^\+\s*₹/.test(part)) {
        return (
          <span
            key={idx}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 font-mono font-black text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded text-[11px]"
          >
            {part}
          </span>
        );
      }

      // Handle currency like ₹1,000
      if (/^₹/.test(part)) {
        return (
          <span
            key={idx}
            className="inline-flex items-center gap-0.5 px-1 py-0.2 font-mono font-bold text-amber-300 bg-amber-400/10 border border-amber-400/25 rounded text-[11.5px]"
          >
            {part}
          </span>
        );
      }

      // Handle confidence percentage
      if (/%/.test(part)) {
        return (
          <span key={idx} className="font-mono font-bold text-cyan-300">
            {part}
          </span>
        );
      }

      // Clean any accidental leftover asterisks
      const sanitized = part.replace(/\*\*/g, '').replace(/\*/g, '');
      return <span key={idx}>{sanitized}</span>;
    });
  };

  return (
    <div className="space-y-2.5 font-sans leading-relaxed">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lineIdx} className="h-1" />;

        // 1. Divider lines (e.g. ━━━━━━━━━━━━━━━━━━━ or ---)
        if (/^[━─\-=_]{3,}$/.test(trimmed)) {
          return (
            <div
              key={lineIdx}
              className="my-2 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"
            />
          );
        }

        // 2. Section Header banners (e.g. 🎯 5-LEVEL BET & PROFIT BREAKDOWN: or 📊 Capital Status:)
        if (/^(?:🎯|📊|🧠|💰|⚡|🛡️)\s*([A-Z0-9\s\-&:]+)/.test(trimmed)) {
          return (
            <motion.div
              key={lineIdx}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border-l-2 border-emerald-400 my-1.5"
            >
              <div className="font-space font-extrabold text-[12px] sm:text-[13px] text-white tracking-wide">
                {renderInline(trimmed)}
              </div>
            </motion.div>
          );
        }

        // 3. Numbered Rule Cards (e.g. 1. Rule 1 - Shuruat: ... or 1. Start Small: ...)
        const ruleMatch = trimmed.match(/^(\d+)\.\s*(?:\*\*)?([^:*]+)?(?:\*\*)?(?::|\s*[-–])?\s*(.*)$/);
        if (ruleMatch && ruleMatch[2]) {
          const stepNum = ruleMatch[1].padStart(2, '0');
          const title = ruleMatch[2].replace(/\*\*/g, '').trim();
          const desc = ruleMatch[3] ? ruleMatch[3].trim() : '';

          return (
            <motion.div
              key={lineIdx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: lineIdx * 0.02 }}
              className="p-2.5 sm:p-3 rounded-xl bg-black/60 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-start gap-2.5 shadow-sm group"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500/30 to-emerald-700/30 border border-emerald-500/40 flex items-center justify-center text-[10.5px] font-mono font-black text-[#00ffaa] flex-shrink-0 shadow-sm">
                {stepNum}
              </div>
              <div className="flex-1 min-w-0 text-xs sm:text-[12.5px]">
                <div className="font-space font-black text-emerald-300 mb-0.5 tracking-wide flex items-center gap-1.5">
                  {title}
                </div>
                {desc && (
                  <div className="text-slate-300 leading-normal">
                    {renderInline(desc)}
                  </div>
                )}
              </div>
            </motion.div>
          );
        }

        // 4. Level Breakdown item (e.g. • Level 1 (Base Bet): ₹30 ➔ Win: ₹58.8 | Net Profit: +₹28.8)
        if (/^[•\-*]\s*(?:Level\s*\d+|L\d+)/i.test(trimmed)) {
          const cleanLine = trimmed.replace(/^[•\-*]\s*/, '');
          return (
            <motion.div
              key={lineIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-1.5 px-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between text-xs gap-2"
            >
              <div className="flex items-center gap-1.5 font-medium text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ffaa] shadow-[0_0_6px_#00ffaa] flex-shrink-0" />
                <span>{renderInline(cleanLine)}</span>
              </div>
            </motion.div>
          );
        }

        // 5. Generic Bullet points (e.g. • ...)
        if (/^[•\-*]\s+/.test(trimmed)) {
          const bulletText = trimmed.replace(/^[•\-*]\s+/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2 text-slate-200 text-xs sm:text-[12.5px] pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ffaa] shadow-[0_0_6px_#00ffaa] flex-shrink-0 mt-1.5" />
              <div className="flex-1 leading-relaxed">{renderInline(bulletText)}</div>
            </div>
          );
        }

        // 6. Regular paragraphs
        return (
          <motion.div
            key={lineIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-200 text-xs sm:text-[12.5px] leading-relaxed"
          >
            {renderInline(trimmed)}
          </motion.div>
        );
      })}
    </div>
  );
};

export const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose,
  currentPeriod,
  currentPrediction,
  totalDraws,
  bigPct,
  smallPct,
  streak,
  server = 1,
  isTelegramActive = false,
  onOpenTelegram,
  onOpenSettings,
  isDarkTheme = false,
  theme,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: `Hello bhai! Main aapka CYRUS AI Trading Partner & Bankroll Guide hu 👋

Main yahan aapko live predictions, 500-data analytics, safe Level Maintain calculation, aur Telegram VIP Bot setup me full guidance dunga — ek real human dost ki tarah!

Aap mujhse bejhijhak pooch sakte hain:
• Agla round prediction & best safe target
• Level Maintain formula & exact next round bet amount
• Telegram bot setup ya verification error solution
• Server 1, 2, 3 aur loss recovery strategy

Batao bhai, aaj kya help karu? 😊`,
      time: 'Live',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Bankroll & Next Round Bet Widget State
  const [showCalculator, setShowCalculator] = useState(false);
  const [walletAmount, setWalletAmount] = useState<number>(1000);
  const [strategyLevel, setStrategyLevel] = useState<number>(1);
  const [customWalletInput, setCustomWalletInput] = useState<string>('1000');

  // Compute live safe bet plan
  const liveBetPlan = calculateNextRoundBet(walletAmount, strategyLevel, 5, 1.96);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleActionClick = (action: 'open_telegram' | 'open_settings' | 'open_level_calculator') => {
    sound.playClick();
    vibrate(25);
    onClose();
    if (action === 'open_telegram' && onOpenTelegram) {
      setTimeout(() => onOpenTelegram(), 150);
    } else if (action === 'open_settings' && onOpenSettings) {
      setTimeout(() => onOpenSettings(), 150);
    } else if (action === 'open_level_calculator' && onOpenSettings) {
      setTimeout(() => {
        onOpenSettings();
        setTimeout(() => {
          const el = document.getElementById('level-maintain-section');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }, 150);
    }
  };

  const handleWalletSelect = (amt: number) => {
    sound.playClick();
    setWalletAmount(amt);
    setCustomWalletInput(String(amt));
  };

  const handleCustomWalletChange = (val: string) => {
    setCustomWalletInput(val);
    const parsed = parseInt(val.replace(/[^\d]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      setWalletAmount(parsed);
    }
  };

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const userText = (customText || input).trim();
    if (!userText || isLoading) return;

    sound.playClick();
    vibrate(20);

    setInput('');

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const resp = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text })),
          context: {
            period: currentPeriod,
            prediction: currentPrediction,
            totalDraws,
            bigPct,
            smallPct,
            streak,
            server,
            isTelegramActive,
            walletBalance: walletAmount,
            currentLevel: strategyLevel,
            levelMaintainRules: {
              multiplier: 1.96,
              totalLevels: 5,
              baseBetRatio: 32.748,
              resetRule: 'Reset to Level 1 immediately after winning any level',
              lossRule: 'Advance to Level N+1 only on loss to recover prior cumulative loss + guaranteed net profit',
              bankrollRule: 'Never wager more than 5 levels or exceed safe capital reserve',
            },
          },
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.reply) {
          // Strip any accidental asterisks
          const sanitizedReply = data.reply.replace(/\*\*/g, '');
          setMessages(prev => [
            ...prev,
            {
              id: String(Date.now() + 1),
              role: 'ai',
              text: sanitizedReply,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actions: data.actions && data.actions.length > 0 ? data.actions : undefined,
            },
          ]);
          sound.playSuccess();
          return;
        }
      }

      // Fallback if network or server error
      const isHindi = /[अ-ह]|bhai|kya|kaise|batao|karo|paisa|loss|hai|nahi/i.test(userText);
      let replyText = isHindi
        ? `Bhai main har cheez me guide karne ke liye yahan ready hu — live prediction, Telegram VIP bot, server 1/2 aur safe money rules. Batao kya madad karu? 😊`
        : `I'm right here to guide you across all platform tools — live signals, Telegram VIP bot setup, server engines, and money management. What's on your mind? 😊`;

      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'ai',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'ai',
          text: `Bhai network me thoda issue lag raha hai, par main active hu. Aap prediction ya level maintain ka sawal dubara pooch sakte ho!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(undefined, prompt);
  };

  const handleSendSafeBetToChat = () => {
    handleQuickPrompt(
      `Mera wallet balance ₹${walletAmount} hai aur main abhi Level ${strategyLevel} par hu. Mujhe agle round ke liye safe bet amount aur profit breakdown batao.`
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      id="ai-chat-modal-overlay"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-xl h-[90vh] max-h-[740px] rounded-3xl bg-[#09130d]/95 p-3.5 sm:p-5 flex flex-col shadow-2xl border relative overflow-hidden text-slate-100 backdrop-blur-xl"
        style={{
          borderColor: theme ? `${theme.primary}40` : 'rgba(16, 185, 129, 0.3)',
        }}
        id="ai-chat-modal-container"
      >
        {/* Top Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, ${theme?.primary || '#0088ff'}, ${theme?.secondary || '#00ffaa'}, ${theme?.accent || '#7b2ff7'})`,
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0 border"
              style={{
                background: `linear-gradient(135deg, ${theme?.primary || '#00e676'}, ${theme?.secondary || '#00b84a'})`,
                boxShadow: `0 4px 16px ${theme?.glowColor || 'rgba(0, 230, 118, 0.3)'}`,
                borderColor: theme ? `${theme.accent || '#ffffff'}60` : 'rgba(52, 211, 153, 0.4)',
              }}
            >
              <Bot size={22} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-space font-black text-sm sm:text-base text-white flex items-center gap-1.5 truncate tracking-wide">
                  CYRUS AI ALL-IN-ONE MASTER
                </h2>
                <span
                  className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border flex-shrink-0"
                  style={{
                    backgroundColor: theme ? `${theme.primary}20` : 'rgba(16, 185, 129, 0.2)',
                    color: theme?.primary || '#00ffaa',
                    borderColor: theme ? `${theme.primary}40` : 'rgba(16, 185, 129, 0.4)',
                  }}
                >
                  FULL SYSTEM GUIDE
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
                Full site knowledge, Telegram bot setup, server engines & 500-data guidance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sound.playClick();
                setShowCalculator(!showCalculator);
              }}
              title="Toggle Safe Bet Calculator"
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-space font-bold border transition-all flex items-center gap-1.5 ${
                showCalculator
                  ? 'bg-emerald-500/20 border-emerald-400 text-[#00ffaa]'
                  : 'bg-black/40 border-emerald-500/30 text-slate-300 hover:text-white'
              }`}
            >
              <Calculator size={13} className="text-[#00ffaa]" />
              <span className="hidden sm:inline">Safe Bet Calc</span>
              {showCalculator ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors border border-white/10 flex-shrink-0 ml-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Expandable Bankroll & Next Round Bet Calculator */}
        <AnimatePresence>
          {showCalculator && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden flex-shrink-0 border-b border-emerald-500/20 bg-black/60 rounded-2xl my-2 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-space font-extrabold text-[#00ffaa]">
                  <Shield size={13} />
                  <span>1.96X SAFE NEXT BET CALCULATOR</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  5-Level Martingale Shield
                </div>
              </div>

              {/* Wallet Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center justify-between">
                    <span>GAME WALLET BALANCE</span>
                    <span className="text-amber-300 font-mono">₹{walletAmount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[500, 1000, 2000, 5000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => handleWalletSelect(amt)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                          walletAmount === amt
                            ? 'bg-emerald-500 text-black border-emerald-400'
                            : 'bg-black/50 text-slate-300 border-white/10 hover:border-emerald-500/40'
                        }`}
                      >
                        ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 font-bold mb-1">
                    CURRENT ROUND LEVEL
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => {
                          sound.playClick();
                          setStrategyLevel(lvl);
                        }}
                        className={`flex-1 py-1 rounded-lg text-[10.5px] font-mono font-black border transition-all ${
                          strategyLevel === lvl
                            ? 'bg-gradient-to-r from-emerald-500 to-[#00ffaa] text-black border-emerald-400 shadow-[0_0_8px_rgba(0,255,170,0.4)]'
                            : 'bg-black/50 text-slate-300 border-white/10 hover:border-emerald-500/40'
                        }`}
                      >
                        L{lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculated Results Bar */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 gap-2">
                <div className="text-center flex-1">
                  <div className="text-[9px] font-mono text-slate-400">NEXT ROUND BET</div>
                  <div className="text-sm font-space font-black text-amber-300">
                    ₹{liveBetPlan.requiredBet}
                  </div>
                </div>

                <div className="w-px h-6 bg-emerald-500/20" />

                <div className="text-center flex-1">
                  <div className="text-[9px] font-mono text-slate-400">WIN PAYOUT</div>
                  <div className="text-sm font-space font-bold text-white">
                    ₹{liveBetPlan.potentialPayout}
                  </div>
                </div>

                <div className="w-px h-6 bg-emerald-500/20" />

                <div className="text-center flex-1">
                  <div className="text-[9px] font-mono text-slate-400">NET PROFIT</div>
                  <div className="text-sm font-space font-black text-emerald-400">
                    +₹{liveBetPlan.netProfit}
                  </div>
                </div>

                <button
                  onClick={handleSendSafeBetToChat}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-black text-[10px] font-space font-bold hover:brightness-105 active:scale-95 transition-all flex items-center gap-1 shadow-sm"
                >
                  <span>Ask AI</span>
                  <ArrowRight size={10} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Suggestion Chips */}
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto flex-shrink-0 custom-scrollbar">
          {[
            { label: '💰 Level Maintain Calculator', query: 'Level maintain system kya hai aur wallet kaise manage kare?' },
            { label: 'Telegram Bot Setup Guide', query: 'Telegram bot setup guide step by step' },
            { label: 'Telegram Error Troubleshoot', query: 'How to troubleshoot Telegram verification error?' },
            { label: 'Server 1, 2, 3 Comparison', query: 'What is the difference between Server 1, Server 2, and Server 3?' },
            { label: 'Explain Next Prediction', query: 'Explain current prediction signal and Markov trend analysis' },
            { label: 'Best Martingale Strategy', query: 'What is the recommended Martingale recovery plan for 500-data?' },
            { label: 'System Overview', query: 'Give me a complete overview of all platform features.' },
          ].map(q => (
            <button
              key={q.label}
              onClick={() => handleQuickPrompt(q.query)}
              className="px-3 py-1.5 rounded-full bg-black/50 hover:bg-emerald-500/20 text-[10.5px] sm:text-[11px] font-bold text-emerald-300 hover:text-[#00ffaa] whitespace-nowrap transition-all border border-emerald-500/25 shadow-sm active:scale-95 flex-shrink-0"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-2 custom-scrollbar">
          {messages.map(m => {
            const isAI = m.role === 'ai';
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`flex gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div
                    className="w-8 h-8 rounded-xl text-white flex items-center justify-center flex-shrink-0 shadow-md mt-0.5 border"
                    style={{
                      background: `linear-gradient(135deg, ${theme?.primary || '#00e676'}, ${theme?.secondary || '#006b28'})`,
                      boxShadow: `0 2px 10px ${theme?.glowColor || 'rgba(0, 230, 118, 0.25)'}`,
                      borderColor: theme ? `${theme.primary}50` : 'rgba(52, 211, 153, 0.3)',
                    }}
                  >
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[88%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-lg ${
                    isAI
                      ? 'bg-black/75 border border-white/10 text-slate-100'
                      : 'text-white font-semibold'
                  }`}
                  style={{
                    background: !isAI
                      ? `linear-gradient(135deg, ${theme?.primary || '#00e676'}, ${theme?.secondary || '#00b84a'})`
                      : undefined,
                    boxShadow: !isAI && theme ? `0 4px 14px ${theme.glowColor}` : undefined,
                  }}
                >
                  <FormattedMessage text={m.text} isAI={isAI} />

                  {/* Interactive Action Buttons inside AI response */}
                  {isAI && m.actions && m.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap gap-2">
                      {m.actions.map(act => (
                        <button
                          key={act.label}
                          onClick={() => handleActionClick(act.action)}
                          className="px-3 py-1.5 rounded-xl text-white font-black text-xs font-space flex items-center gap-1.5 hover:opacity-95 active:scale-95 transition-all shadow-md cursor-pointer"
                          style={{
                            background: `linear-gradient(135deg, ${theme?.primary || '#00e676'}, ${theme?.secondary || '#00ffaa'})`,
                            boxShadow: theme ? `0 2px 8px ${theme.glowColor}` : '0 2px 8px rgba(0, 230, 118, 0.2)',
                          }}
                        >
                          <TrendingUp size={12} />
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`text-[9px] font-mono mt-1.5 text-right ${
                      isAI ? 'text-slate-400' : 'text-white/80'
                    }`}
                  >
                    {m.time}
                  </div>
                </div>
                {!isAI && (
                  <div
                    className="w-8 h-8 rounded-xl text-white flex items-center justify-center flex-shrink-0 shadow-md mt-0.5 border"
                    style={{
                      background: theme?.secondary || '#059669',
                      borderColor: theme ? `${theme.primary}40` : 'rgba(52, 211, 153, 0.4)',
                    }}
                  >
                    <User size={16} />
                  </div>
                )}
              </motion.div>
            );
          })}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2.5 items-center text-xs font-mono p-2.5 bg-black/60 rounded-xl border w-fit shadow-md"
              style={{
                color: theme?.primary || '#00ffaa',
                borderColor: theme ? `${theme.primary}40` : 'rgba(16, 185, 129, 0.3)',
              }}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center animate-spin"
                style={{ backgroundColor: theme ? `${theme.primary}20` : 'rgba(16, 185, 129, 0.2)' }}
              >
                <Sparkles size={14} style={{ color: theme?.primary || '#00ffaa' }} />
              </div>
              <span className="tracking-wide">
                CYRUS AI is calculating bankroll risk & drafting advice...
              </span>
            </motion.div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={e => handleSend(e)}
          className="pt-2 border-t border-white/10 flex gap-2 flex-shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Poocho: Telegram setup, server 1/2, wallet maintain rules..."
            className="flex-1 px-3.5 py-2.5 rounded-2xl bg-black/80 text-xs sm:text-sm font-medium text-white placeholder-slate-500 border border-white/15 focus:outline-none shadow-inner"
            style={{
              borderColor: input.trim() && theme ? `${theme.primary}70` : undefined,
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-2xl text-white text-xs sm:text-sm font-space font-black tracking-wider uppercase flex items-center justify-center shadow-md disabled:opacity-40 hover:brightness-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${theme?.primary || '#00e676'}, ${theme?.secondary || '#00b84a'})`,
              boxShadow: theme ? `0 4px 14px ${theme.glowColor}` : '0 4px 12px rgba(0, 230, 118, 0.25)',
            }}
          >
            <Send size={15} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
