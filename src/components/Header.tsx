import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MoreVertical,
  Volume2,
  VolumeX,
  Shield,
  Zap,
  Sparkles,
  LogOut,
  Settings,
  Check,
  Cpu,
  Layers,
  X,
  Radio,
  Sliders,
  Timer,
} from 'lucide-react';
import { ServerEngine, WingoMode } from '../types';
import { sound, vibrate } from '../utils/audio';
import { ThemeDef } from '../utils/theme';

interface HeaderProps {
  userName: string;
  userAvatar?: string;
  userTitle?: string;
  server: ServerEngine;
  onServerChange: (s: ServerEngine) => void;
  wingoMode?: WingoMode;
  onWingoModeChange?: (m: WingoMode) => void;
  onOpenSettings: () => void;
  onOpenTelegram?: () => void;
  isTelegramActive?: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  themeColor: string;
  isDarkTheme?: boolean;
  theme?: ThemeDef;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  userName,
  userAvatar,
  userTitle = 'VIP PRO',
  server,
  onServerChange,
  wingoMode = '30s',
  onWingoModeChange,
  onOpenSettings,
  onOpenTelegram,
  isTelegramActive = false,
  soundEnabled,
  onToggleSound,
  themeColor,
  isDarkTheme = false,
  theme,
  onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const getServerBadge = () => {
    switch (server) {
      case 1:
      default:
        return {
          title: 'SERVER 1 · CYRUS ULTRA™',
          subLine1: 'DUAL MATRIX · SIZE & COLOR',
          subLine2: 'CYRUS POWERFULL AI',
          desc: 'Server 1 · CYRUS ULTRA™ (Dual Matrix & 2 Sure Numbers)',
          gradient: 'bg-emerald-500/15 text-[#006b28] border-emerald-500/30 dark:text-emerald-300',
          dot: 'bg-[#00b84a]',
        };
      case 2:
        return {
          title: 'SERVER 2 · CYRUS PATTERNS™',
          subLine1: 'SURESHOT_DATABASE PATTERN PREDICTOR',
          subLine2: 'EXACT 9-PATTERN LOOKUP & SINGLE SNIPER NUMBER',
          desc: 'Server 2 · CYRUS PATTERNS™ (SURESHOT 1=BIG, 2=SMALL)',
          gradient: 'bg-amber-500/15 text-amber-900 border-amber-500/30 dark:text-amber-300',
          dot: 'bg-[#f59e0b]',
        };
    }
  };

  const badge = getServerBadge();

  const handleSelectServer = (s: ServerEngine) => {
    sound.playClick();
    vibrate(25);
    onServerChange(s);
  };

  const handleSelectWingoMode = (m: WingoMode) => {
    sound.playClick();
    vibrate(25);
    if (onWingoModeChange) onWingoModeChange(m);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative z-30 w-full mb-3 rounded-3xl ${isDarkTheme ? 'liquid-glass-dark' : 'liquid-glass'} p-3.5 sm:p-4`}
    >
      {/* Specular Top Flowing Highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-[2.5px] opacity-80"
        style={{
          background: `linear-gradient(90deg, transparent, ${theme?.primary || '#34d399'}, ${theme?.secondary || '#10b981'}, transparent)`,
        }}
      />

      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2 mb-3 relative">
        {/* User Profile Pill with Circular DP */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenSettings();
          }}
          className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full liquid-pill hover:bg-white/90 dark:hover:bg-slate-900/90 border border-emerald-500/30 transition-all duration-200 group active:scale-95 shadow-sm"
          id="header-user-profile-btn"
        >
          <div
            className="relative w-7 h-7 rounded-full p-0.5 shadow-sm flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${themeColor || '#00e676'}, #00b84a)`,
            }}
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-[11px] font-black text-white"
                style={{ background: themeColor || '#00b84a' }}
              >
                {userName.charAt(0).toUpperCase() || 'N'}
              </div>
            )}
            <span
              className="absolute bottom-0 right-0 w-2 h-2 rounded-full ring-1 ring-white dark:ring-slate-950 animate-pulse"
              style={{ background: themeColor || '#00e676' }}
            />
          </div>
          <div className="flex flex-col text-left min-w-0 pr-1">
            <span className="text-xs font-bold text-[#0f2918] dark:text-emerald-200 group-hover:text-[#006b28] transition-colors truncate max-w-[100px] sm:max-w-[130px]">
              {userName}
            </span>
            <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 -mt-0.5">
              {userTitle}
            </span>
          </div>
        </button>

        {/* Right Action Buttons (Telegram Broadcaster + 3-Dots Menu) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Telegram VIP Broadcaster Button */}
          {onOpenTelegram && (
            <button
              onClick={() => {
                sound.playClick();
                vibrate(20);
                onOpenTelegram();
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl liquid-pill border transition-all duration-200 group active:scale-95 shadow-sm flex-shrink-0 ${
                isTelegramActive
                  ? 'bg-gradient-to-r from-sky-500/25 to-blue-600/25 border-sky-400 text-sky-500 dark:text-sky-300 ring-2 ring-sky-400/40'
                  : 'border-sky-500/30 text-[#0088ff] dark:text-sky-400 hover:bg-sky-500/10'
              }`}
              id="header-telegram-broadcast-btn"
              title="Telegram VIP Channel Broadcaster"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-[#0088ff] to-[#00c6ff] flex items-center justify-center shadow-sm flex-shrink-0">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
                </svg>
              </div>
              <span className="text-[11px] sm:text-xs font-bold font-space tracking-tight">
                Telegram
              </span>
              {isTelegramActive ? (
                <span className="w-2 h-2 rounded-full bg-[#00ffaa] animate-ping flex-shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
              )}
            </button>
          )}

          {/* 3-DOTS MENU BUTTON CONTAINER */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                sound.playClick();
                vibrate(20);
                setIsMenuOpen(prev => !prev);
              }}
              className={`w-9 h-9 rounded-2xl liquid-pill flex items-center justify-center transition-all duration-200 shadow-sm border ${
                isMenuOpen
                  ? 'bg-[#00e676]/20 border-emerald-500 text-emerald-600 dark:text-emerald-300 scale-105'
                  : 'border-emerald-500/30 text-[#111b15] dark:text-slate-200 hover:text-emerald-600 hover:border-emerald-500/50'
              }`}
              title="Options Menu"
              aria-label="Open Options Menu"
              id="header-three-dots-menu-btn"
            >
              <MoreVertical size={18} className="stroke-[2.5]" />
            </button>

            {/* 3-DOTS POPUP DROPDOWN MENU */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute right-0 top-11 z-50 w-72 sm:w-80 rounded-3xl border border-emerald-500/35 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl shadow-2xl p-3 text-[#111b15] dark:text-white space-y-3"
                  id="header-options-dropdown-menu"
                >
                  {/* Menu Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                    <div className="flex items-center gap-1.5 font-space font-black text-xs text-[#006b28] dark:text-emerald-300">
                      <Sparkles size={14} className="text-[#00e676]" />
                      <span>VIP QUICK CONTROLS</span>
                    </div>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-1 rounded-xl hover:bg-slate-500/15 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Telegram Broadcaster Quick Action */}
                  {onOpenTelegram && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenTelegram();
                      }}
                      className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-sky-500/15 to-blue-500/15 border border-sky-500/30 flex items-center justify-between hover:bg-sky-500/25 transition-all text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0088ff] to-[#00c6ff] flex items-center justify-center text-white shadow-md shadow-sky-500/30">
                          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0088ff] dark:text-sky-300">Telegram VIP Broadcaster</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {isTelegramActive ? 'Broadcasting live signals' : 'Setup bot & channel'}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-400 font-mono text-[10px] font-bold">
                        {isTelegramActive ? 'ACTIVE' : 'OPEN'}
                      </span>
                    </button>
                  )}

                {/* 1. WinGo Game Mode Switcher in Quick Controls */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-400 flex items-center justify-between px-1">
                    <span>WINGO GAME MODE</span>
                    <span className="text-[#00e676]">API SELECTOR</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleSelectWingoMode('30s')}
                      className={`p-2 rounded-2xl text-center border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none ${
                        wingoMode === '30s'
                          ? 'text-white shadow-sm ring-1 ring-white/30'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                      style={{
                        background: wingoMode === '30s'
                          ? `linear-gradient(135deg, ${theme?.primary || '#00b84a'}, ${theme?.secondary || '#007a32'})`
                          : undefined,
                        boxShadow: wingoMode === '30s' && theme ? `0 2px 8px ${theme.glowColor}` : undefined,
                      }}
                      id="menu-wingo-30s-btn"
                    >
                      <div className="flex items-center gap-1 font-space font-black text-xs">
                        <Timer size={13} className={wingoMode === '30s' ? 'text-white' : ''} style={{ color: wingoMode !== '30s' && theme ? theme.primary : undefined }} />
                        <span>WinGo 30s</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold opacity-80">30S Fast Draw</span>
                    </button>

                    <button
                      onClick={() => handleSelectWingoMode('1min')}
                      className={`p-2 rounded-2xl text-center border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none ${
                        wingoMode === '1min'
                          ? 'text-white shadow-sm ring-1 ring-white/30'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                      style={{
                        background: wingoMode === '1min'
                          ? `linear-gradient(135deg, ${theme?.primary || '#00b84a'}, ${theme?.secondary || '#007a32'})`
                          : undefined,
                        boxShadow: wingoMode === '1min' && theme ? `0 2px 8px ${theme.glowColor}` : undefined,
                      }}
                      id="menu-wingo-1m-btn"
                    >
                      <div className="flex items-center gap-1 font-space font-black text-xs">
                        <Timer size={13} className={wingoMode === '1min' ? 'text-white' : ''} style={{ color: wingoMode !== '1min' && theme ? theme.primary : undefined }} />
                        <span>WinGo 1min</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold opacity-80">1M Classic Draw</span>
                    </button>
                  </div>
                </div>

                {/* 2. Voice & Audio Toggle */}
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 dark:bg-slate-900/80 border border-emerald-500/25 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                      {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </div>
                    <div>
                      <div className="text-xs font-bold">Voice &amp; Audio Broadcast</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {soundEnabled ? 'Live voice announcements active' : 'Audio muted'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      vibrate(25);
                      onToggleSound();
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-black transition-all ${
                      soundEnabled
                        ? 'bg-[#00e676] text-slate-950 shadow-md shadow-emerald-500/30'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                    }`}
                    id="menu-toggle-sound-btn"
                  >
                    {soundEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* 3. Server Switcher Section (Server 1 & Server 2) */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-400 flex items-center justify-between px-1">
                    <span>ACTIVE SERVER ENGINE</span>
                    <span className="text-[#00e676]">2 ENGINES</span>
                  </div>

                  <div className="space-y-1">
                    {[
                      {
                        id: 1 as ServerEngine,
                        name: 'Server 1: CYRUS ULTRA™',
                        desc: 'Dual Size & Color Matrix + Max-1 Loss Shield + 2 Sure Numbers',
                        badge: 'CYRUS ULTRA',
                        color: 'border-emerald-500/50 bg-emerald-500/15',
                      },
                      {
                        id: 2 as ServerEngine,
                        name: 'Server 2: CYRUS PATTERNS™',
                        desc: 'SURESHOT Pattern Database (1=BIG, 2=SMALL) + Single Precision Sniper Number',
                        badge: 'CYRUS PATTERNS',
                        color: 'border-amber-500/50 bg-amber-500/15',
                      },
                    ].map(s => {
                      const isSelected = server === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => handleSelectServer(s.id)}
                          className={`w-full p-2 rounded-2xl text-left border transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? `${s.color} ring-1 ring-emerald-500 shadow-md`
                              : 'border-transparent hover:bg-emerald-500/10 dark:hover:bg-slate-900/60'
                          }`}
                          id={`menu-server-btn-${s.id}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isSelected ? 'bg-[#00e676] animate-ping' : 'bg-slate-400'
                              }`}
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate text-[#111b15] dark:text-white">
                                {s.name}
                              </div>
                              <div className="text-[9.5px] font-mono text-slate-500 dark:text-slate-400 truncate">
                                {s.desc}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#00e676] text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <Check size={12} className="stroke-[3]" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Settings & Logout Actions */}
                <div className="pt-2 border-t border-emerald-500/20 space-y-1">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full p-2 rounded-2xl hover:bg-emerald-500/10 dark:hover:bg-slate-900 flex items-center gap-2 text-xs font-bold text-[#111b15] dark:text-slate-200 transition-colors"
                    id="menu-open-settings-btn"
                  >
                    <Settings size={15} className="text-emerald-500" />
                    <span>VIP Settings &amp; Preferences</span>
                  </button>

                  {onLogout && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        setIsMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full p-2 rounded-2xl hover:bg-rose-500/15 flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 transition-colors"
                      id="menu-logout-btn"
                    >
                      <LogOut size={15} />
                      <span>Logout Account</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>

      {/* Main Clean CYRUS AI Logo & Title */}
      <div className="text-center relative py-1 px-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0284c7] via-[#0369a1] to-[#0c4a6e] p-0.5 shadow-lg shadow-emerald-500/25 mb-2.5 animate-liquid-pulse">
          <div className="w-full h-full rounded-[14px] bg-white/95 dark:bg-slate-950 flex items-center justify-center backdrop-blur-sm">
            <img src="/assets/cyrus-ultra-pro-logo.jpg" alt="Cyrus Ultra Pro" className="w-full h-full rounded-[14px] object-cover" />
          </div>
        </div>

        {/* Main Title & Version */}
        <h1 className="font-space font-black text-xl sm:text-2xl tracking-tight text-[#0b1e12] dark:text-white flex items-center justify-center gap-2">
          <span>CYRUS ULTRA PRO</span>
          <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-[#006b28] dark:text-emerald-300 border border-emerald-500/30 shadow-sm">
            V6.0
          </span>
        </h1>

        {/* Server Subtitle Lines - Clean, No star icons, high contrast */}
        <div className="mt-1 space-y-0.5">
          <div className="text-[11px] sm:text-xs font-space font-black text-[#111b15] dark:text-slate-100 tracking-wider uppercase">
            {badge.subLine1}
          </div>
          <div className="text-[10px] sm:text-[11px] font-mono font-bold text-[#006b28] dark:text-emerald-400 tracking-wide uppercase">
            {badge.subLine2}
          </div>
        </div>

        {/* WINGO MODE SWITCHER PILL (WinGo 30s vs WinGo 1min) */}
        <div className="mt-2.5 flex items-center justify-center gap-2">
          <div
            className="inline-flex items-center p-1 rounded-2xl bg-black/5 dark:bg-white/5 border shadow-inner transition-colors"
            style={{ borderColor: theme ? `${theme.primary}35` : 'rgba(16, 185, 129, 0.25)' }}
          >
            <button
              onClick={() => handleSelectWingoMode('30s')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                wingoMode === '30s'
                  ? 'text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={{
                background: wingoMode === '30s'
                  ? `linear-gradient(135deg, ${theme?.primary || '#00e676'}, ${theme?.secondary || '#00b84a'})`
                  : undefined,
                boxShadow: wingoMode === '30s' && theme ? `0 4px 14px ${theme.glowColor}` : undefined,
              }}
              id="header-wingo-30s-tab"
            >
              <Timer size={13} className={wingoMode === '30s' ? 'text-white' : ''} style={{ color: wingoMode !== '30s' && theme ? theme.primary : undefined }} />
              <span>WinGo 30s</span>
            </button>
            <button
              onClick={() => handleSelectWingoMode('1min')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                wingoMode === '1min'
                  ? 'text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={{
                background: wingoMode === '1min'
                  ? `linear-gradient(135deg, ${theme?.primary || '#00e676'}, ${theme?.secondary || '#00b84a'})`
                  : undefined,
                boxShadow: wingoMode === '1min' && theme ? `0 4px 14px ${theme.glowColor}` : undefined,
              }}
              id="header-wingo-1m-tab"
            >
              <Timer size={13} className={wingoMode === '1min' ? 'text-white' : ''} style={{ color: wingoMode !== '1min' && theme ? theme.primary : undefined }} />
              <span>WinGo 1min</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clean Engine Status Pill */}
      <div className="mt-2.5 pt-2 border-t border-emerald-500/10 flex items-center justify-between text-[11px] text-[#3d5c47] dark:text-slate-400">
        <span className="flex items-center gap-1.5 truncate max-w-[280px]">
          <Shield size={12} className="text-[#00b84a] flex-shrink-0" />
          <span className="font-mono font-semibold truncate text-[10.5px]">{badge.desc}</span>
        </span>
        <span className="font-mono text-[10px] font-bold text-[#006b28] dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex-shrink-0">
          ONLINE &amp; ACTIVE
        </span>
      </div>
    </motion.header>
  );
});


