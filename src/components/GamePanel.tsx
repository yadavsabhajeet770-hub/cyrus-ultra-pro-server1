import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Maximize2,
  Minimize2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Shield,
  Layers,
  LayoutGrid,
  CheckCircle2,
  Smartphone,
  Play,
  Flame,
  ExternalLink,
} from 'lucide-react';
import { sound, vibrate } from '../utils/audio';
import { StrategyResult } from '../types';
import { ThemeDef } from '../utils/theme';

interface GamePanelProps {
  initialUrl?: string;
  isDarkTheme?: boolean;
  livePrediction?: StrategyResult | null;
  targetPeriod?: string;
  secondsLeft?: number;
  onRefreshPrediction?: () => void;
  savedGameUrl?: string;
  onUrlChange?: (url: string) => void;
  theme?: ThemeDef;
}

export interface OfficialGameItem {
  id: string;
  name: string;
  url: string;
  category: string;
  badge: string;
  color: string;
  keywords: string[];
}

export const OFFICIAL_GAMES: OfficialGameItem[] = [
  {
    id: 'dhaniwin', name: 'Dhani Win',
    url: 'https://dhaniwin.games/register?inviteCode=HRJ4KLN&from=web',
    category: 'WinGo / Color Trading', badge: 'DHANI WIN',
    color: 'from-blue-600 to-sky-500', keywords: ['dhani', 'dhani win', 'dhaniwin'],
  },
  {
    id: '9kclub', name: '9K Club',
    url: 'https://9kclub1.com/register?inviteCode=HFS25AN&from=web',
    category: 'WinGo / Color Trading', badge: '9K CLUB',
    color: 'from-red-500 to-rose-600', keywords: ['9k', '9k club', '9kclub'],
  },
];
type WebviewMode = 'proxy' | 'direct' | 'hub';

export const GamePanel: React.FC<GamePanelProps> = ({
  initialUrl = OFFICIAL_GAMES[0].url,
  isDarkTheme = false,
  livePrediction,
  targetPeriod,
  secondsLeft = 60,
  onRefreshPrediction,
  savedGameUrl,
  onUrlChange,
  theme,
}) => {
  const [url, setUrl] = useState(() => savedGameUrl || localStorage.getItem('ny_current_game_url') || initialUrl);
  const [viewMode, setViewMode] = useState<WebviewMode>(() => {
    return (localStorage.getItem('ny_game_view_mode') as WebviewMode) || 'proxy';
  });
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHudMinimized, setIsHudMinimized] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [isGameLoading, setIsGameLoading] = useState(false);

  useEffect(() => {
    if (savedGameUrl && savedGameUrl !== url) {
      setUrl(savedGameUrl);
    }
  }, [savedGameUrl]);

  const handleLaunchUrl = (targetUrl: string) => {
    sound.playClick();
    vibrate(30);
    setUrl(targetUrl);
    setIframeError(false);
    // Third-party game providers may deny embedding; direct mode avoids reliance on Express proxy routes unavailable on static Vercel deployments.
    setViewMode('direct');
    localStorage.setItem('ny_game_view_mode', 'direct');
    localStorage.setItem('ny_current_game_url', targetUrl);
    if (onUrlChange) {
      onUrlChange(targetUrl);
    }
    setIframeKey(k => k + 1);
  };

  const handleModeChange = (mode: WebviewMode) => {
    sound.playClick();
    vibrate(20);
    setViewMode(mode);
    localStorage.setItem('ny_game_view_mode', mode);
    setIframeError(false);
  };

  const toggleFullscreen = () => {
    sound.playClick();
    vibrate(25);
    setIsFullscreen(f => !f);
  };

  const getIframeSrc = () => {
    // 0. If internal API route (like /api/browser-search), return directly
    if (url.startsWith('/api/')) {
      return url;
    }

    // 1. If YouTube video URL, use YouTube embed directly
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i
    );
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&playsinline=1&rel=0&enablejsapi=1`;
    }

    // 2. If Vimeo video URL
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    // 3. If DailyMotion video URL
    const dmMatch = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/i);
    if (dmMatch && dmMatch[1]) {
      return `https://www.dailymotion.com/embed/video/${dmMatch[1]}?autoplay=1`;
    }

    if (viewMode === 'proxy') {
      return `/api/proxy-game?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const isBig = livePrediction?.pred === 'BIG';

  const activeGame = OFFICIAL_GAMES.find(g => {
    if (url === g.url) return true;
    if (url.includes(g.id)) return true;
    if (url.includes(g.name.toLowerCase().replace(/\s+/g, ''))) return true;
    try {
      const gHost = new URL(g.url).hostname.replace('www.', '');
      if (url.includes(gHost)) return true;
    } catch {
      // ignore
    }
    return false;
  }) || {
    ...OFFICIAL_GAMES[0],
    name: 'Dhani Win',
    badge: 'LIVE',
  };

  return (
    <div
      className={`w-full flex flex-col transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-2 sm:p-3'
          : `min-h-[660px] h-[calc(100vh-110px)] rounded-3xl ${
              isDarkTheme ? 'liquid-glass-dark' : 'liquid-glass'
            } p-3 sm:p-4 shadow-2xl border border-emerald-500/25 relative overflow-hidden`
      }`}
    >
      {/* Top Section: Game Controls */}
      <div className="flex-shrink-0 flex flex-col gap-2.5 pb-2.5 border-b border-emerald-500/15">
        <div className="flex items-center justify-end gap-2">
          {/* Quick Actions (Mode tabs, Reload, Fullscreen) */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Mode Switcher Tabs */}
            <div className="hidden sm:flex items-center p-1 rounded-2xl liquid-pill border border-emerald-500/20 gap-1 flex-shrink-0">
              <button
                onClick={() => handleModeChange('proxy')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  viewMode === 'proxy'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-[#3d5c47] dark:text-slate-300 hover:text-[#006b28]'
                }`}
                title="Proxy mode removes embedding blockers"
              >
                Proxy
              </button>
              <button
                onClick={() => handleModeChange('direct')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  viewMode === 'direct'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-[#3d5c47] dark:text-slate-300 hover:text-[#006b28]'
                }`}
                title="Direct iframe loading"
              >
                Direct
              </button>
              <button
                onClick={() => handleModeChange('hub')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  viewMode === 'hub'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-[#3d5c47] dark:text-slate-300 hover:text-[#006b28]'
                }`}
                title="Game Launchpad Hub"
              >
                Hub (15 Games)
              </button>
            </div>

            <button
              onClick={() => {
                sound.playRefresh();
                vibrate(20);
                setIframeKey(k => k + 1);
                setIframeError(false);
              }}
              className="p-2.5 rounded-2xl liquid-pill text-[#111b15] dark:text-white hover:text-[#006b28] border border-emerald-500/25 active:scale-95 transition-all shadow-sm"
              title="Reload Game Webview"
            >
              <RefreshCw size={16} />
            </button>

            <button
              onClick={toggleFullscreen}
              className={`p-2.5 rounded-2xl transition-all shadow-sm ${
                isFullscreen
                  ? 'bg-gradient-to-r from-[#00e676] to-[#00b84a] text-slate-950 font-black shadow-emerald-500/30'
                  : 'liquid-pill text-[#111b15] dark:text-white hover:text-[#006b28] border border-emerald-500/25'
              }`}
              title={isFullscreen ? 'Exit Full Screen' : 'Open Full Screen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {/* ROW 2: ALL 15 OFFICIAL GAME CHIPS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <div className="sm:hidden flex items-center gap-1 mr-1 flex-shrink-0">
            <button
              onClick={() =>
                handleModeChange(viewMode === 'proxy' ? 'direct' : viewMode === 'direct' ? 'hub' : 'proxy')
              }
              className="px-2 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/20 text-[#006b28] dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1"
            >
              <Layers size={11} />
              <span>{viewMode.toUpperCase()}</span>
            </button>
          </div>

          <span className="text-[10.5px] font-mono font-black text-[#7a9e87] dark:text-slate-400 uppercase mr-0.5 flex-shrink-0 flex items-center gap-1">
            <Flame size={12} className="text-amber-500" />
            <span>Games:</span>
          </span>

          {OFFICIAL_GAMES.map(game => {
            let isSelected = url === game.url || url.includes(game.id) || url.includes(game.name.toLowerCase().replace(/\s+/g, ''));
            if (!isSelected) {
              try {
                const gHost = new URL(game.url).hostname.replace('www.', '');
                if (url.includes(gHost)) isSelected = true;
              } catch {
                // ignore
              }
            }
            return (
              <button
                key={game.id}
                onClick={() => handleLaunchUrl(game.url)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'text-white font-black shadow-md scale-105 border border-white/30'
                    : 'liquid-pill text-[#3d5c47] dark:text-slate-300 hover:text-[#006b28] border border-emerald-500/20 hover:border-emerald-500/40'
                }`}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${theme?.primary || '#00e676'}, ${theme?.secondary || '#00b84a'})`
                    : undefined,
                  boxShadow: isSelected && theme ? `0 3px 12px ${theme.glowColor}` : undefined,
                }}
              >
                <span>{game.name}</span>
                {isSelected && <CheckCircle2 size={13} className="text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <a href={activeGame.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <ExternalLink size={14} /> Open {activeGame.name} securely
        </a>
      </div>
      {/* Main Game Screen Content Area */}
      <div className="relative flex-1 w-full mt-2 rounded-2xl overflow-hidden border border-emerald-500/25 bg-slate-950 shadow-inner flex flex-col">
        {viewMode === 'hub' ? (
          /* GAME LAUNCHPAD HUB: ALL VIP OFFICIAL PLATFORMS GRID */
          <div className="flex-1 w-full p-4 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-space font-black text-base text-white flex items-center gap-2">
                  <LayoutGrid size={18} className="text-[#00e676]" />
                  <span>ALL {OFFICIAL_GAMES.length} VIP GAME PLATFORMS</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select and launch your favorite verified lottery &amp; color trading game
                </p>
              </div>
              <button
                onClick={() => handleModeChange('proxy')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1"
              >
                <Smartphone size={13} />
                <span>Webview Mode</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {OFFICIAL_GAMES.map(game => (
                <div
                  key={game.id}
                  className="rounded-2xl bg-slate-900/90 border border-emerald-500/20 hover:border-emerald-500/50 p-3.5 flex flex-col justify-between gap-3 shadow-lg hover:shadow-emerald-500/10 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-space font-black text-sm shadow-md">
                      {game.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {game.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-space font-black text-sm text-white group-hover:text-emerald-300 transition-colors">
                      {game.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{game.category}</p>
                  </div>

                  <button
                    onClick={() => handleLaunchUrl(game.url)}
                    className="w-full py-2 rounded-xl text-white font-space font-black text-xs shadow-md group-hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${theme?.primary || '#00e676'}, ${theme?.secondary || '#00b84a'})`,
                      boxShadow: theme ? `0 3px 10px ${theme.glowColor}` : '0 2px 8px rgba(0, 230, 118, 0.2)',
                    }}
                  >
                    <Play size={13} fill="currentColor" />
                    <span>LAUNCH GAME</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* EMBEDDED IFRAME WEBVIEW */
          <div className="relative flex-1 w-full h-full bg-slate-950 flex flex-col">
            {/* Loading Indicator */}
            {isGameLoading && (
              <div className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full border-3 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                <span className="text-xs font-mono text-emerald-400 font-bold tracking-wider animate-pulse">
                  CONNECTING HIGH-SPEED PROXY TO {activeGame.name.toUpperCase()}...
                </span>
              </div>
            )}

            <iframe
              key={iframeKey}
              src={getIframeSrc()}
              title="WinGo Game Webview"
              className="w-full h-full border-0 rounded-2xl bg-white"
              onLoad={() => setIsGameLoading(false)}
              onError={() => {
                setIsGameLoading(false);
                setIframeError(true);
              }}
              allow="accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; camera; microphone; geolocation"
            />

            {/* Error or blocked frame fallback */}
            {iframeError && (
              <div className="absolute inset-0 z-20 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3">
                  <Shield size={24} />
                </div>
                <h3 className="font-space font-black text-lg text-white mb-1">
                  High-Speed Game Mode Active
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Direct rendering ensures instant response and UPI connectivity for {activeGame.name}.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setViewMode(viewMode === 'proxy' ? 'direct' : 'proxy');
                      setIframeError(false);
                      setIframeKey(k => k + 1);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold"
                  >
                    Switch to {viewMode === 'proxy' ? 'Direct' : 'Proxy'} Mode
                  </button>
                  <button
                    onClick={() => {
                      setIframeError(false);
                      setIframeKey(k => k + 1);
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00e676] to-[#00b84a] text-slate-950 font-space font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-1.5"
                  >
                    <RefreshCw size={13} />
                    <span>Retry Load</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* COMPACT SLEEK FLOATING AI ASSISTANT OVERLAY (NON-INTRUSIVE)    */}
        {/* ------------------------------------------------------------- */}
        <aside
          aria-label="Live Prediction Assistant Overlay"
          className="absolute top-2 right-2 z-30 pointer-events-auto max-w-[210px] sm:max-w-[230px] w-full"
        >
          {isHudMinimized ? (
            /* ULTRA-COMPACT FLOATING PILL WHEN MINIMIZED */
            <div
              onClick={() => {
                sound.playClick();
                setIsHudMinimized(false);
              }}
              className="ml-auto flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/95 border border-emerald-500/60 shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all text-white backdrop-blur-md"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-2 h-2 rounded-full bg-[#00e676] animate-ping flex-shrink-0" />
                {(() => {
                  const target = livePrediction?.focusTarget || livePrediction?.pred || 'BIG';
                  const isBig = target === 'BIG';
                  const isSmall = target === 'SMALL';
                  const isRed = target === 'RED';
                  return (
                    <span
                      className={`text-[11px] font-space font-black px-1.5 py-0.2 rounded-md ${
                        isBig
                          ? 'bg-amber-400/25 text-yellow-300 border border-yellow-400/50'
                          : isSmall
                          ? 'bg-blue-500/25 text-blue-300 border border-blue-400/50'
                          : isRed
                          ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {target}
                    </span>
                  );
                })()}
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {secondsLeft}s
                </span>
              </div>
              <ChevronDown size={14} className="text-emerald-400 flex-shrink-0" />
            </div>
          ) : (
            /* COMPACT FLOATING CARD WHEN EXPANDED */
            <div className="rounded-2xl shadow-2xl overflow-hidden border border-emerald-500/50 bg-slate-950/95 backdrop-blur-xl text-white transition-all duration-300">
              {/* Mini HUD Header */}
              <div
                onClick={() => {
                  sound.playClick();
                  setIsHudMinimized(true);
                }}
                className="flex items-center justify-between gap-1 px-2.5 py-1.5 cursor-pointer bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-b border-emerald-500/30 select-none"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-ping" />
                  <span className="font-space font-black text-[11px] text-[#00e676] tracking-wider truncate">
                    AI HUD
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400/70 truncate">
                    #{(targetPeriod || '').slice(-4) || 'LIVE'}
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (onRefreshPrediction) {
                        sound.playRefresh();
                        vibrate(20);
                        onRefreshPrediction();
                      }
                    }}
                    className="p-0.5 rounded text-emerald-400 hover:text-white transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw size={11} />
                  </button>
                  <button className="text-emerald-400 hover:text-white p-0.5" title="Minimize">
                    <ChevronUp size={13} />
                  </button>
                </div>
              </div>

              {/* Compact HUD Body */}
              <div className="p-2 space-y-1.5 animate-fade-in text-[10px]">
                {/* Timer & Target Badge in 1 Tight Row */}
                {(() => {
                  const target = livePrediction?.focusTarget || livePrediction?.pred || 'BIG';
                  const isRedTarget = target === 'RED';
                  const isGreenTarget = target === 'GREEN';
                  const isBigTarget = target === 'BIG';
                  const isSmallTarget = target === 'SMALL';

                  return (
                    <div className="p-1.5 rounded-xl border border-emerald-500/30 bg-slate-900/90 flex items-center justify-between gap-1 shadow-inner">
                      <div className="flex flex-col text-left">
                        <span className="text-[8.5px] font-mono text-slate-400">
                          {isRedTarget || isGreenTarget ? 'COLOR' : 'SIZE'} TARGET
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                          <Clock size={10} />
                          <span>{secondsLeft}s · {livePrediction?.confidence || 94}%</span>
                        </span>
                      </div>

                      <b
                        className={`text-base font-black px-2.5 py-0.5 rounded-lg shadow-sm font-space ${
                          isBigTarget
                            ? 'bg-amber-400/25 text-yellow-300 border border-yellow-400/60'
                            : isSmallTarget
                            ? 'bg-blue-500/25 text-blue-300 border border-blue-400/60'
                            : isRedTarget
                            ? 'bg-rose-500/25 text-rose-300 border border-rose-500/60'
                            : 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/60'
                        }`}
                      >
                        {target}
                      </b>
                    </div>
                  );
                })()}

                {/* Micro Sub-Signals Row (Size, Color & Lucky Sniper) */}
                <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                  <div className="bg-slate-900/80 p-1 rounded-lg border border-slate-800 flex items-center justify-between px-1.5">
                    <span className="text-slate-400">SIZE:</span>
                    <span className={livePrediction?.pred === 'BIG' ? 'text-rose-400 font-black' : 'text-emerald-400 font-black'}>
                      {livePrediction?.pred || 'BIG'}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-1 rounded-lg border border-slate-800 flex items-center justify-between px-1.5">
                    <span className="text-slate-400">COLOR:</span>
                    <span className={livePrediction?.colorPred === 'RED' ? 'text-rose-400 font-black' : 'text-emerald-400 font-black'}>
                      {livePrediction?.colorPred || (livePrediction?.pred === 'BIG' ? 'RED' : 'GREEN')}
                    </span>
                  </div>
                </div>

                {/* Lucky Digits Snipe */}
                {livePrediction?.nums && livePrediction.nums.length > 0 && (
                  <div className="px-1.5 py-0.5 rounded-lg bg-slate-900/70 border border-emerald-500/20 flex items-center justify-between text-[9px] font-mono">
                    <span className="text-slate-400">LUCKY:</span>
                    <div className="flex items-center gap-1 font-black text-amber-300">
                      {livePrediction.nums.map((n, i) => (
                        <span key={`hud-n-${n}-${i}`} className="bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/40">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Tab Micro Button */}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 text-[9.5px] font-space font-bold flex items-center justify-center gap-1 transition-all text-center"
                >
                  <ExternalLink size={10} />
                  <span>Open in Tab</span>
                </a>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
