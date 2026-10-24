import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Palette,
  Volume2,
  Smartphone,
  Shield,
  Shuffle,
  User,
  Link,
  Check,
  RotateCcw,
  LogOut,
  Sparkles,
  Sliders,
  BellRing,
  Download,
  Flame,
  CheckCircle2,
  Camera,
  Upload,
  Trash2,
  Crown,
  Zap,
  Target,
  TrendingUp,
  Trophy,
  AlertCircle,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { AppSettings, ServerEngine, WingoDrawItem, Analysis500Data, AppStats, WingoHistoryRecord } from '../types';
import { THEMES } from '../utils/theme';
import { sound, vibrate } from '../utils/audio';
import { download500RecordsAsText } from '../utils/exporter';
import { analyze500Data } from '../services/analyzer';
import { LevelMaintainCalculator } from './LevelMaintainCalculator';

interface SettingsPanelProps {
  isOpen?: boolean;
  isModal?: boolean;
  onClose?: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetStats: () => void;
  onLogout?: () => void;
  onTestNotification?: (type: 'WIN' | 'JACKPOT' | 'LOSS') => void;
  draws?: WingoDrawItem[];
  analysis?: Analysis500Data;
  stats?: AppStats;
  history?: WingoHistoryRecord[];
  isDarkTheme?: boolean;
}



export const VIP_TITLES: { title: string; Icon: LucideIcon }[] = [
  { title: 'VIP ELITE', Icon: Sparkles },
  { title: 'GRANDMASTER', Icon: Crown },
  { title: 'STREAK KING', Icon: Flame },
  { title: 'QUANTUM PRO', Icon: Zap },
  { title: '99% SNIPER', Icon: Target },
  { title: 'ALPHA TRADER', Icon: TrendingUp },
  { title: 'JACKPOT LEGEND', Icon: Trophy },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = React.memo(({
  isOpen = true,
  isModal = false,
  onClose,
  settings,
  onUpdateSettings,
  onResetStats,
  onLogout,
  onTestNotification,
  draws = [],
  analysis,
  stats = { wins: 0, losses: 0, jacks: 0, streak: 0, bestStreak: 0, lossRun: 0, recoveryActive: false },
  history = [],
  isDarkTheme = false,
}) => {
  const [nameInput, setNameInput] = useState(settings.userName);
  const [userTitle, setUserTitle] = useState(settings.userTitle || 'VIP ELITE');
  const [proxyInput, setProxyInput] = useState(settings.proxyUrl || '');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [themeFilter, setThemeFilter] = useState<'all' | 'dark' | 'light' | 'vip'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolvedAnalysis = analysis || analyze500Data(draws);

  if (isModal && !isOpen) return null;

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleExport500RecordsText = () => {
    sound.playSuccess();
    vibrate(40);
    try {
      download500RecordsAsText(draws, resolvedAnalysis, stats, history, settings);
      showToast('500 Records exported (.txt)!');
    } catch {
      showToast('Export failed. Please try again.');
    }
  };



  // Handle Photo File Upload & Compress to Circular Base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        // Resize & compress to optimal 256x256 circular square image
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Crop center square
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        onUpdateSettings({ userAvatar: dataUrl });
        localStorage.setItem('ny_user_avatar', dataUrl);
        sound.playSuccess();
        vibrate(40);
        showToast('Profile photo updated successfully!');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };



  // Remove Photo / Reset to Initials
  const handleRemovePhoto = () => {
    sound.playClick();
    vibrate(20);
    onUpdateSettings({ userAvatar: '' });
    localStorage.removeItem('ny_user_avatar');
    showToast('Profile photo removed.');
  };

  // Save Player Name & Title
  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    vibrate(30);
    const finalName = nameInput.trim() || 'CYRUS VIP Player';
    onUpdateSettings({ userName: finalName, userTitle });
    localStorage.setItem('ny_username', finalName);
    localStorage.setItem('ny_user_title', userTitle);
    showToast('Profile Name & Title saved!');
  };

  const handleSaveProxy = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    onUpdateSettings({ proxyUrl: proxyInput.trim() });
    showToast('Proxy URL saved!');
  };

  const shuffleTheme = () => {
    sound.playClick();
    vibrate(30);
    const random = THEMES[Math.floor(Math.random() * THEMES.length)];
    onUpdateSettings({ theme: random.id });
    showToast(`Theme changed to ${random.name}!`);
  };

  const handleExportHistory = () => {
    sound.playClick();
    try {
      const raw = localStorage.getItem('ny_history_v7') || '[]';
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ny_prediction_history_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('History exported successfully!');
    } catch {
      showToast('Failed to export history.');
    }
  };

  const currentAvatar = settings.userAvatar;

  const content = (
    <div
      className={`w-full ${
        isModal
          ? `max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl ${
              isDarkTheme ? 'liquid-glass-dark' : 'liquid-glass'
            } p-5 sm:p-7 shadow-2xl border border-emerald-500/25 relative`
          : `rounded-3xl ${
              isDarkTheme ? 'liquid-glass-dark' : 'liquid-glass'
            } p-4 sm:p-6 shadow-2xl border border-emerald-500/25 relative space-y-6`
      }`}
    >
      {/* Hidden File Input for DP Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Floating Toast Notification */}
      {saveToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#00e676] to-[#00b84a] text-slate-950 font-space font-black text-xs shadow-2xl border border-white/40 flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Close Button (only for modal) */}
      {isModal && onClose && (
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full liquid-pill flex items-center justify-center text-[#3d5c47] dark:text-slate-200 hover:text-rose-600 transition-colors shadow-sm z-20"
        >
          <X size={17} />
        </button>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: CIRCULAR GOAL DP & VIP PROFILE CARD */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent border-2 border-emerald-500/35 relative overflow-hidden shadow-lg">
        {/* Glow Background Elements */}
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-teal-500/20 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
          {/* Main Goal Circular DP with Camera / Upload Action */}
          <div className="relative group flex-shrink-0">
            {/* Animated Glowing Ring Halo */}
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#00e676] via-[#00b84a] to-[#004d1e] opacity-75 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-300 animate-spin-slow" />

            {/* Circular DP Container */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#00e676] via-[#00b84a] to-[#004d1e] shadow-2xl overflow-hidden flex items-center justify-center cursor-pointer">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="Player DP"
                  className="w-full h-full rounded-full object-cover shadow-inner transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#00e676] via-[#00b84a] to-[#004d1e] flex items-center justify-center text-white font-space font-black text-3xl shadow-inner">
                  {settings.userName.charAt(0).toUpperCase() || 'N'}
                </div>
              )}

              {/* Hover / Active Overlay with Camera Icon */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white backdrop-blur-[2px]"
                title="Click to Upload DP / Photo"
              >
                <Camera size={22} className="text-[#00e676] mb-0.5" />
                <span className="text-[10px] font-space font-black uppercase tracking-wider">
                  Change DP
                </span>
              </div>
            </div>

            {/* Quick Upload Button Badge on bottom-right of DP */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-tr from-[#00e676] to-[#00b84a] text-slate-950 p-1.5 shadow-lg border-2 border-white dark:border-slate-900 hover:scale-110 active:scale-95 transition-transform flex items-center justify-center"
              title="Upload Custom Photo"
            >
              <Camera size={14} />
            </button>
          </div>

          {/* Profile Name, VIP Title & DP Controls */}
          <div className="flex-1 text-center sm:text-left min-w-0 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-space font-black text-xl sm:text-2xl text-[#111b15] dark:text-white truncate">
                {settings.userName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-mono font-black text-[11px] shadow-sm flex items-center gap-1.5 border border-yellow-300">
                <Crown size={12} className="fill-current text-slate-950" />
                <span>{settings.userTitle || 'VIP ELITE'}</span>
              </span>
            </div>

            <p className="text-xs text-[#3d5c47] dark:text-slate-300 font-semibold flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles size={13} className="text-[#00e676]" />
              <span>CYRUS Fusion AI Master Account · Active Level Status</span>
            </p>

            {/* DP Action Buttons: Upload Photo & Remove & Quick Level Maintain */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00e676] to-[#00b84a] text-slate-950 font-space font-black text-xs shadow-md shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Upload size={13} />
                <span>UPLOAD PHOTO</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  vibrate(20);
                  const el = document.getElementById('level-maintain-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-space font-black text-xs shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>🎯 WINGO 1.96X LEVEL SYSTEM</span>
              </button>

              {currentAvatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/25 active:scale-95 transition-all flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>


      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: PLAYER NAME & TITLE EDIT STUDIO */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl liquid-pill border border-emerald-500/25 space-y-3.5 shadow-sm">
        <label className="text-xs font-mono font-black text-[#111b15] dark:text-slate-200 uppercase flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <User size={14} className="text-[#00b84a]" />
            <span>Customize Name &amp; VIP Badge</span>
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            Live Preview
          </span>
        </label>

        {/* Name Input Form */}
        <form onSubmit={handleSaveName} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="Enter custom player name"
                className="w-full pl-3.5 pr-8 py-2.5 rounded-2xl liquid-pill text-xs sm:text-sm font-bold text-[#111b15] dark:text-white border-2 border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {nameInput && (
                <button
                  type="button"
                  onClick={() => setNameInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#00e676] to-[#00b84a] text-slate-950 font-space font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
            >
              <Check size={14} />
              <span>SAVE</span>
            </button>
          </div>

          {/* VIP Title Badges Selector with Real Icons */}
          <div>
            <span className="text-[10.5px] font-mono font-bold text-[#7a9e87] dark:text-slate-400 block mb-1.5">
              Select VIP Honor Badge:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {VIP_TITLES.map(({ title, Icon: TitleIcon }) => {
                const isSelected = userTitle === title;
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => {
                      setUserTitle(title);
                      onUpdateSettings({ userTitle: title });
                      localStorage.setItem('ny_user_title', title);
                      sound.playClick();
                      vibrate(15);
                      showToast(`Title set to ${title}`);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10.5px] font-mono font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-md border border-yellow-300 scale-105'
                        : 'liquid-pill text-[#3d5c47] dark:text-slate-300 border border-emerald-500/20 hover:border-emerald-500/40'
                    }`}
                  >
                    <TitleIcon size={12} className={isSelected ? 'text-slate-950' : 'text-amber-500'} />
                    <span>{title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* SECTION 3: THEME STUDIO (20 PREMIUM THEMES) */}
        {/* ========================================================================= */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono font-black text-[#111b15] dark:text-slate-200 uppercase flex items-center gap-1.5">
              <Palette size={14} className="text-[#00b84a]" />
              <span>Theme Studio &amp; Fluid Mesh (20 Themes)</span>
            </label>
            <button
              onClick={shuffleTheme}
              className="text-[11px] font-bold text-[#006b28] dark:text-emerald-300 hover:underline flex items-center gap-1"
            >
              <Shuffle size={12} />
              <span>Randomize</span>
            </button>
          </div>

          {/* Active Theme Live Fluid Color & Mesh Banner */}
          {(() => {
            const currentActiveTheme = THEMES.find(t => t.id === settings.theme) || THEMES[0];
            return (
              <div className="mb-3 p-3 rounded-2xl liquid-glass border border-emerald-500/20 shadow-sm relative overflow-hidden">
                {/* Flowing animated color streak */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 animate-gradient-flow-fast"
                  style={{
                    background: `linear-gradient(90deg, ${currentActiveTheme.primary}, ${currentActiveTheme.accent}, ${currentActiveTheme.secondary}, ${currentActiveTheme.primary})`,
                  }}
                />
                <div className="flex items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md overflow-hidden">
                      <div
                        className="absolute inset-0 bg-gradient-to-tr animate-aurora-shift"
                        style={{
                          background: `linear-gradient(135deg, ${currentActiveTheme.primary}, ${currentActiveTheme.accent})`,
                        }}
                      />
                      <Sparkles size={16} className="text-white relative z-10 drop-shadow" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#111b15] dark:text-slate-100 truncate">
                          {currentActiveTheme.name}
                        </span>
                        {currentActiveTheme.tag && (
                          <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                            {currentActiveTheme.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        Active Fluid Mesh • {currentActiveTheme.isDark ? 'Obsidian Dark' : 'Crystal Light'}
                      </p>
                    </div>
                  </div>

                  {/* Color Palette Chips */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-inner border border-white/40"
                      style={{ background: currentActiveTheme.primary }}
                      title="Primary"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-inner border border-white/40"
                      style={{ background: currentActiveTheme.secondary }}
                      title="Secondary"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-inner border border-white/40"
                      style={{ background: currentActiveTheme.accent }}
                      title="Accent"
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Theme Category Filter Pills */}
          <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: `All (${THEMES.length})` },
              { id: 'vip', label: `⭐ VIP Premium (${THEMES.filter(t => !!t.tag).length})` },
              { id: 'dark', label: `Dark Luxe (${THEMES.filter(t => t.isDark).length})` },
              { id: 'light', label: `Light Glass (${THEMES.filter(t => !t.isDark).length})` },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setThemeFilter(cat.id as any)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold font-mono whitespace-nowrap transition-all duration-150 ${
                  themeFilter === cat.id
                    ? 'bg-[#00b84a] text-white shadow-sm ring-2 ring-emerald-500/30'
                    : 'liquid-pill text-slate-600 dark:text-slate-300 hover:bg-emerald-500/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Themes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {THEMES.filter(t => {
              if (themeFilter === 'dark') return t.isDark;
              if (themeFilter === 'light') return !t.isDark;
              if (themeFilter === 'vip') return !!t.tag;
              return true;
            }).map(t => {
              const isActive = settings.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    sound.playClick();
                    vibrate(20);
                    onUpdateSettings({ theme: t.id });
                    showToast(`Theme changed to ${t.name}`);
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all duration-200 shadow-sm flex items-center justify-between gap-2.5 ios-press relative overflow-hidden ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                      : 'liquid-pill border-emerald-500/15 hover:border-emerald-500/30 hover:bg-emerald-500/5'
                  }`}
                  style={{
                    borderColor: isActive ? t.primary : undefined,
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 relative z-10">
                    {/* Multi-tone animated preview swatch */}
                    <div className="relative w-6 h-6 rounded-full flex-shrink-0 shadow-sm flex items-center justify-center overflow-hidden">
                      <div
                        className={`w-full h-full bg-gradient-to-tr ${t.previewGradient} ${
                          isActive ? 'animate-aurora-shift' : ''
                        }`}
                      />
                      {isActive && (
                        <div
                          className="absolute inset-0 rounded-full animate-ping opacity-35"
                          style={{ background: t.primary }}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-[#111b15] dark:text-slate-200 truncate">
                          {t.id === 'auto' ? 'Auto (Device Sync)' : t.name.split('(')[0].trim()}
                        </span>
                      </div>
                      {t.tag && (
                        <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-300">
                          {t.tag}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 relative z-10">
                    {/* Mini Color Dots */}
                    <div className="flex -space-x-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/50"
                        style={{ background: t.primary }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/50"
                        style={{ background: t.accent }}
                      />
                    </div>
                    {isActive && <Check size={14} className="text-[#00b84a] flex-shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4A: WINGO GAME MODE SELECTOR (30S vs 1MIN) */}
        {/* ========================================================================= */}
        <div>
          <label className="text-xs font-mono font-black text-[#111b15] dark:text-slate-200 uppercase flex items-center justify-between mb-2.5">
            <span className="flex items-center gap-1.5">
              <Zap size={14} className="text-[#00b84a]" />
              <span>WinGo Game Mode &amp; API Selector</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              Live Synchronized
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: '30s' as const,
                title: 'WinGo 30s (Ultra Fast)',
                desc: '30-Second Rapid Draws. Uses high-frequency micro-entropy scanning & lightning fast trend calibration.',
                apiUrl: 'WinGo_30S/GetHistoryIssuePage.json',
                badge: '30-SEC DRAW',
                color: 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30',
              },
              {
                id: '1min' as const,
                title: 'WinGo 1min (Classic Standard)',
                desc: '60-Second Standard Draws. Deep 500-draw multi-pattern momentum & 2nd/3rd-Order Markov chains.',
                apiUrl: 'WinGo_1M/GetHistoryIssuePage.json',
                badge: '1-MIN DRAW',
                color: 'border-purple-500 bg-purple-500/15 ring-2 ring-purple-500/30',
              },
            ].map(m => {
              const isActive = (settings.wingoMode || '30s') === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    vibrate(20);
                    onUpdateSettings({ wingoMode: m.id });
                    localStorage.setItem('ny_wingomode', m.id);
                    showToast(`Switched to ${m.title}`);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all shadow-sm flex flex-col justify-between gap-2 cursor-pointer ${
                    isActive
                      ? `${m.color} shadow-md shadow-emerald-500/15`
                      : 'liquid-pill border-emerald-500/15 hover:border-emerald-500/30'
                  }`}
                  id={`settings-wingo-mode-${m.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-space font-black text-xs text-[#111b15] dark:text-white">
                      {m.title}
                    </span>
                    {isActive && <Check size={14} className="text-[#00b84a]" />}
                  </div>
                  <div className="text-[10.5px] text-[#3d5c47] dark:text-slate-400 font-semibold leading-relaxed">
                    {m.desc}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[9.5px] font-mono">
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      {m.badge}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                      {m.apiUrl}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4B: SERVER ENGINE SELECTION (SERVER 1 & SERVER 2) */}
        {/* ========================================================================= */}
        <div>
          <label className="text-xs font-mono font-black text-[#111b15] dark:text-slate-200 uppercase flex items-center gap-1.5 mb-2.5">
            <Shield size={14} className="text-[#00b84a]" />
            <span>AI Prediction Engine Matrix</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: 1 as ServerEngine,
                name: 'Server 1: CYRUS ULTRA™',
                desc: 'Dual Size & Color Matrix + Max-1 Loss Shield + Dual Sure Numbers',
                tag: 'CYRUS ULTRA',
              },
              {
                id: 2 as ServerEngine,
                name: 'Server 2: CYRUS PATTERNS™',
                desc: 'SURESHOT Pattern Database (1=BIG, 2=SMALL) + Single Precision Sniper Number',
                tag: 'SURESHOT SNIPER',
              },
            ].map(s => {
              const isActive = settings.server === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    sound.playClick();
                    vibrate(20);
                    onUpdateSettings({ server: s.id });
                    showToast(`Switched to ${s.name}`);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all shadow-sm flex flex-col justify-between gap-2 ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/15'
                      : 'liquid-pill border-emerald-500/15 hover:border-emerald-500/30'
                  }`}
                  id={`settings-server-engine-${s.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-space font-black text-xs text-[#111b15] dark:text-white">
                      {s.name}
                    </span>
                    {isActive && <Check size={14} className="text-[#00b84a]" />}
                  </div>
                  <div className="text-[10.5px] text-[#3d5c47] dark:text-slate-400 font-semibold leading-relaxed">
                    {s.desc}
                  </div>
                  <span className="text-[9.5px] font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {s.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        
        {/* ========================================================================= */}
        {/* SECTION 4C: DATA ANALYSIS MODE SELECTION */}
        {/* ========================================================================= */}
        <div className="mt-8 mb-4">
          <label className="text-xs font-mono font-black text-[#111b15] dark:text-slate-200 uppercase flex items-center gap-1.5 mb-2.5">
            <Sparkles size={14} className="text-[#00b84a]" />
            <span>Data Analysis Mode</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: '10_DATA',
                name: '10 Data Analysis',
                desc: 'Fast predictions using latest 10 draw results.',
                tag: '10 DRAWS (FAST)',
              },
              {
                id: '100_DATA',
                name: '100 Data Analysis',
                desc: 'Balanced Markov & pattern analysis with 100 API.',
                tag: '100 DRAWS (OPTIMAL)',
              },
              {
                id: '500_DATA',
                name: '500 Data Analysis',
                desc: 'Maximum neural depth using full 500 API.',
                tag: '500 DRAWS (DEEP AI)',
              },
            ].map(s => {
              const isActive = settings.dataAnalysisMode === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    sound.playClick();
                    vibrate(20);
                    onUpdateSettings({ dataAnalysisMode: s.id as any });
                    const t = document.createElement('div');
                    t.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold z-[9999] shadow-xl border border-emerald-500/30';
                    t.innerText = `Switched to ${s.name}`;
                    document.body.appendChild(t);
                    setTimeout(() => t.remove(), 2000);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all shadow-sm flex flex-col justify-between gap-2 ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/15'
                      : 'liquid-pill border-emerald-500/15 hover:border-emerald-500/30'
                  }`}
                  id={`settings-data-mode-${s.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-space font-black text-xs text-[#111b15] dark:text-white">
                      {s.name}
                    </span>
                    {isActive && <Check size={14} className="text-[#00b84a]" />}
                  </div>
                  <div className="text-[10.5px] text-[#3d5c47] dark:text-slate-400 font-semibold leading-relaxed">
                    {s.desc}
                  </div>
                  <span className="text-[9.5px] font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {s.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {/* ========================================================================= */}        {/* SECTION 5: AUTOMATION & RISK MANAGEMENT */}
        {/* ========================================================================= */}
        <div>
          <label className="text-xs font-mono font-black text-[#111b15] dark:text-slate-200 uppercase flex items-center gap-1.5 mb-2.5">
            <Sliders size={14} className="text-[#00b84a]" />
            <span>Automation &amp; Risk Settings</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Auto-Refresh */}
            <div className="p-3 rounded-2xl border border-emerald-500/15 liquid-pill flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs font-bold text-[#111b15] dark:text-white flex items-center gap-1.5">
                  <BellRing size={14} className="text-emerald-500" />
                  <span>Auto-Refresh Draws</span>
                </div>
                <div className="text-[10px] text-[#3d5c47] dark:text-slate-400">
                  Sync with real-time 1M timer
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onUpdateSettings({ autoRefresh: !settings.autoRefresh });
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                  settings.autoRefresh ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.autoRefresh ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 2-Loss Recovery Hedge */}
            <div className="p-3 rounded-2xl border border-emerald-500/15 liquid-pill flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs font-bold text-[#111b15] dark:text-white flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-500" />
                  <span>2-Loss Martingale Hedge</span>
                </div>
                <div className="text-[10px] text-[#3d5c47] dark:text-slate-400">
                  Auto-activate defensive recovery
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onUpdateSettings({ recovery: !settings.recovery });
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                  settings.recovery ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.recovery ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Lucky Numbers Display */}
            <div className="p-3 rounded-2xl border border-emerald-500/15 liquid-pill flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs font-bold text-[#111b15] dark:text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-purple-500" />
                  <span>Suggest Lucky Numbers</span>
                </div>
                <div className="text-[10px] text-[#3d5c47] dark:text-slate-400">
                  Show hot 2-digit numbers
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onUpdateSettings({ showNums: !settings.showNums });
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                  settings.showNums ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.showNums ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Win/Loss/Jackpot Dynamic Island Alerts */}
            <div className="p-3 rounded-2xl border border-emerald-500/15 liquid-pill flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs font-bold text-[#111b15] dark:text-white flex items-center gap-1.5">
                  <BellRing size={14} className="text-emerald-500" />
                  <span>Win / Loss / Jackpot Alerts</span>
                </div>
                <div className="text-[10px] text-[#3d5c47] dark:text-slate-400">
                  Slide-in top Dynamic Island notifications
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onUpdateSettings({ resultNotifications: settings.resultNotifications === false });
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                  settings.resultNotifications !== false ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.resultNotifications !== false ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Particle Confetti FX */}
            <div className="p-3 rounded-2xl border border-emerald-500/15 liquid-pill flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs font-bold text-[#111b15] dark:text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-cyan-500" />
                  <span>Confetti Celebrations</span>
                </div>
                <div className="text-[10px] text-[#3d5c47] dark:text-slate-400">
                  Celebrate wins and jackpots
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onUpdateSettings({ particles: !settings.particles });
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                  settings.particles ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.particles ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 6: 💰 2X LEVEL MAINTAIN CALCULATOR (MARTINGALE TRICK) */}
        {/* ========================================================================= */}
        <div id="level-maintain-section">
          <LevelMaintainCalculator isDarkTheme={isDarkTheme} />
        </div>

        {/* ========================================================================= */}
        {/* SECTION 7: AUDIO & HAPTICS */}
        {/* ========================================================================= */}
        <div>
          <label className="text-xs font-mono font-black text-[#111b15] dark:text-slate-200 uppercase flex items-center gap-1.5 mb-2.5">
            <Volume2 size={14} className="text-[#00b84a]" />
            <span>Audio &amp; Haptics</span>
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                vibrate(20);
                const nextVal = !settings.sound;
                onUpdateSettings({ sound: nextVal });
                if (nextVal) sound.playClick();
              }}
              className={`p-3 rounded-2xl border flex items-center justify-between shadow-sm transition-all ${
                settings.sound
                  ? 'bg-emerald-500/15 border-emerald-500/30'
                  : 'liquid-pill border-emerald-500/15 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Volume2
                  size={16}
                  className={settings.sound ? 'text-[#00b84a]' : 'text-slate-400'}
                />
                <span className="text-xs font-bold text-[#111b15] dark:text-white">Sound SFX</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#006b28] dark:text-emerald-300">
                {settings.sound ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => {
                vibrate(40);
                onUpdateSettings({ vibrate: !settings.vibrate });
              }}
              className={`p-3 rounded-2xl border flex items-center justify-between shadow-sm transition-all ${
                settings.vibrate
                  ? 'bg-emerald-500/15 border-emerald-500/30'
                  : 'liquid-pill border-emerald-500/15 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Smartphone
                  size={16}
                  className={settings.vibrate ? 'text-[#00b84a]' : 'text-slate-400'}
                />
                <span className="text-xs font-bold text-[#111b15] dark:text-white">
                  Haptic Vibe
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#006b28] dark:text-emerald-300">
                {settings.vibrate ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* IPHONE DYNAMIC ISLAND NOTIFICATION CONTROLS */}
        {/* ========================================================================= */}
        {onTestNotification && (
          <div className={`p-4 rounded-3xl border liquid-pill space-y-3 shadow-sm transition-all ${
            settings.resultNotifications !== false
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : 'border-slate-500/20 opacity-80'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  settings.resultNotifications !== false ? 'bg-emerald-500/20 text-[#00b84a]' : 'bg-slate-500/20 text-slate-400'
                }`}>
                  <BellRing size={16} />
                </div>
                <div>
                  <label className="text-xs font-mono font-black text-[#111b15] dark:text-slate-200 uppercase flex items-center gap-1.5 cursor-pointer"
                    onClick={() => {
                      sound.playClick();
                      onUpdateSettings({ resultNotifications: settings.resultNotifications === false });
                    }}
                  >
                    <span>Win / Loss / Jackpot Banner</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#7a9e87]">
                    {settings.resultNotifications !== false ? 'Active (Dynamic Island)' : 'Notifications Disabled'}
                  </span>
                </div>
              </div>

              {/* Master ON/OFF Switch */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onUpdateSettings({ resultNotifications: settings.resultNotifications === false });
                }}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors flex items-center ${
                  settings.resultNotifications !== false ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md flex items-center justify-center text-[9px] font-black ${
                    settings.resultNotifications !== false ? 'translate-x-5 text-emerald-600' : 'translate-x-0 text-slate-400'
                  }`}
                >
                  {settings.resultNotifications !== false ? '✓' : '✕'}
                </div>
              </button>
            </div>

            <p className="text-[11px] text-[#3d5c47] dark:text-slate-400 leading-relaxed">
              Real-time iPhone banner slides down from the top on every Win, Loss, or Jackpot round with tactile haptics. Turn OFF if you prefer silent results.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  if (settings.resultNotifications === false) {
                    onUpdateSettings({ resultNotifications: true });
                  }
                  onTestNotification('WIN');
                }}
                className="flex-1 py-2 px-2 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-500 dark:text-emerald-300 font-space font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <Trophy size={13} />
                <span>Test Win</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  if (settings.resultNotifications === false) {
                    onUpdateSettings({ resultNotifications: true });
                  }
                  onTestNotification('JACKPOT');
                }}
                className="flex-1 py-2 px-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-500 dark:text-amber-300 font-space font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <Sparkles size={13} />
                <span>Test Jackpot</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  if (settings.resultNotifications === false) {
                    onUpdateSettings({ resultNotifications: true });
                  }
                  onTestNotification('LOSS');
                }}
                className="flex-1 py-2 px-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-500 dark:text-rose-300 font-space font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <AlertCircle size={13} />
                <span>Test Loss</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 7: API PROXY SETTINGS */}
        {/* ========================================================================= */}
        <div>
          <label className="text-xs font-mono font-black text-[#111b15] dark:text-slate-200 uppercase flex items-center gap-1.5 mb-1.5">
            <Link size={13} className="text-[#00b84a]" />
            <span>Custom Data API Proxy (Optional)</span>
          </label>
          <form onSubmit={handleSaveProxy} className="flex gap-2">
            <input
              type="text"
              value={proxyInput}
              onChange={e => setProxyInput(e.target.value)}
              placeholder="e.g. https://my-proxy.com/?url="
              className="flex-1 px-3 py-2 rounded-xl liquid-pill text-xs font-mono font-semibold text-[#111b15] dark:text-white border border-emerald-500/20 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00e676] to-[#00b84a] text-slate-950 font-bold text-xs shadow-sm active:scale-95 transition-all"
            >
              Save
            </button>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 8: DATA EXPORT & RESET CONTROLS */}
        {/* ========================================================================= */}
        <div className="pt-3 border-t border-emerald-500/15 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExport500RecordsText}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
              title="Backup 500 records & personal performance metrics locally in plain text format"
            >
              <FileText size={13} className="text-emerald-500" />
              <span>Export 500 Records (.txt)</span>
            </button>

            <button
              onClick={handleExportHistory}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/25 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Download size={13} />
              <span>Export History (JSON)</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                vibrate(40);
                onResetStats();
                showToast('Statistics reset!');
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/25 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <RotateCcw size={13} />
              <span>Reset Stats</span>
            </button>
          </div>

          {onLogout && (
            <button
              onClick={() => {
                sound.playClick();
                onLogout();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-500/15 text-slate-800 dark:text-slate-300 border border-slate-500/30 text-xs font-bold hover:bg-slate-500/25 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <LogOut size={13} />
              <span>Logout Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full flex justify-center"
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return content;
});
