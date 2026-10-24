export interface ThemeDef {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgBase: string;
  isDark: boolean;
  bgGradient: string;
  cardBg: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
  textMuted: string;
  badgeBg: string;
  previewGradient: string;
  tag?: string;
  auroraGradient?: string;
}

export const THEMES: ThemeDef[] = [
  {
    id: 'ocean',
    name: 'Ocean Liquid',
    primary: '#0284c7',
    secondary: '#0369a1',
    accent: '#38bdf8',
    bgBase: '#f0f9ff',
    isDark: false,
    bgGradient: 'from-[#f0f9ff] via-[#e0f2fe] to-[#f0f9ff]',
    cardBg: 'bg-white/75 backdrop-blur-2xl',
    borderColor: 'border-sky-500/25',
    glowColor: 'rgba(2, 132, 199, 0.2)',
    textColor: 'text-[#0c2d48]',
    textMuted: 'text-[#164e63]',
    badgeBg: 'bg-sky-500/10 text-[#0369a1] border-sky-500/25',
    previewGradient: 'from-sky-400 to-blue-700',
  },
  {
    id: 'futuristic-blue',
    name: 'Futuristic Dark Blue',
    primary: '#2563eb',
    secondary: '#1d4ed8',
    accent: '#60a5fa',
    bgBase: '#071426',
    isDark: true,
    bgGradient: 'from-[#06101f] via-[#0b1f3a] to-[#06101f]',
    cardBg: 'bg-[#0d1b2e]/85 backdrop-blur-2xl',
    borderColor: 'border-blue-500/30',
    glowColor: 'rgba(37, 99, 235, 0.28)',
    textColor: 'text-[#e8f1ff]',
    textMuted: 'text-[#9bb5d5]',
    badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    previewGradient: 'from-blue-400 via-blue-700 to-slate-950',
  },
{
    id: 'auto',
    name: 'Auto (Follow Mobile Dark Mode)',
    primary: '#0284c7',
    secondary: '#0369a1',
    accent: '#38bdf8',
    bgBase: '#071426',
    isDark: true,
    bgGradient: 'from-[#06101f] via-[#0b1f3a] to-[#06101f]',
    cardBg: 'bg-[#0d1b2e]/85 backdrop-blur-2xl',
    borderColor: 'border-blue-500/30',
    glowColor: 'rgba(37, 99, 235, 0.28)',
    textColor: 'text-[#e8f1ff]',
    textMuted: 'text-[#9bb5d5]',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-blue-500/30',
    previewGradient: 'from-blue-400 via-blue-700 to-slate-950',
  },
{
    id: 'dark',
    name: 'Obsidian Blue Dark',
    primary: '#0284c7',
    secondary: '#1d4ed8',
    accent: '#38bdf8',
    bgBase: '#071426',
    isDark: true,
    bgGradient: 'from-[#06101f] via-[#0b1f3a] to-[#06101f]',
    cardBg: 'bg-[#0d1b2e]/85 backdrop-blur-2xl',
    borderColor: 'border-blue-500/30',
    glowColor: 'rgba(37, 99, 235, 0.28)',
    textColor: 'text-[#e8f1ff]',
    textMuted: 'text-[#9bb5d5]',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-blue-500/30',
    previewGradient: 'from-blue-400 to-zinc-950',
  },
{
    id: 'rose',
    name: 'Liquid Rose',
    primary: '#e11d48',
    secondary: '#be123c',
    accent: '#fb7185',
    bgBase: '#fff1f2',
    isDark: false,
    bgGradient: 'from-[#fff1f2] via-[#ffe4e6] to-[#fff1f2]',
    cardBg: 'bg-white/75 backdrop-blur-2xl',
    borderColor: 'border-rose-500/25',
    glowColor: 'rgba(225, 29, 72, 0.2)',
    textColor: 'text-[#4c0519]',
    textMuted: 'text-[#9f1239]',
    badgeBg: 'bg-rose-500/10 text-[#9f1239] border-rose-500/25',
    previewGradient: 'from-rose-400 to-pink-700',
  },
{
    id: 'purple',
    name: 'Astral Purple Glass',
    primary: '#7c3aed',
    secondary: '#6d28d9',
    accent: '#a78bfa',
    bgBase: '#f5f3ff',
    isDark: false,
    bgGradient: 'from-[#f5f3ff] via-[#ede9fe] to-[#f5f3ff]',
    cardBg: 'bg-white/75 backdrop-blur-2xl',
    borderColor: 'border-purple-500/25',
    glowColor: 'rgba(124, 58, 237, 0.2)',
    textColor: 'text-[#1e0a4c]',
    textMuted: 'text-[#4c1d95]',
    badgeBg: 'bg-purple-500/10 text-[#5b21b6] border-purple-500/25',
    previewGradient: 'from-purple-400 to-indigo-700',
  },
{
    id: 'amber',
    name: 'Liquid Gold',
    primary: '#d97706',
    secondary: '#b45309',
    accent: '#fbbf24',
    bgBase: '#fffbeb',
    isDark: false,
    bgGradient: 'from-[#fffbeb] via-[#fef3c7] to-[#fffbeb]',
    cardBg: 'bg-white/75 backdrop-blur-2xl',
    borderColor: 'border-amber-500/25',
    glowColor: 'rgba(217, 119, 6, 0.2)',
    textColor: 'text-[#451a03]',
    textMuted: 'text-[#78350f]',
    badgeBg: 'bg-amber-500/10 text-[#92400e] border-amber-500/25',
    previewGradient: 'from-amber-400 to-yellow-700',
  },
{
    id: 'teal',
    name: 'Matrix Mint',
    primary: '#0d9488',
    secondary: '#0f766e',
    accent: '#2dd4bf',
    bgBase: '#f0fdfa',
    isDark: false,
    bgGradient: 'from-[#f0fdfa] via-[#ccfbf1] to-[#f0fdfa]',
    cardBg: 'bg-white/75 backdrop-blur-2xl',
    borderColor: 'border-teal-500/25',
    glowColor: 'rgba(13, 148, 136, 0.2)',
    textColor: 'text-[#042f2e]',
    textMuted: 'text-[#115e59]',
    badgeBg: 'bg-teal-500/10 text-[#0f766e] border-teal-500/25',
    previewGradient: 'from-teal-400 to-emerald-700',
  },
{
    id: 'sunset',
    name: 'Liquid Sunset',
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fb923c',
    bgBase: '#fff7ed',
    isDark: false,
    bgGradient: 'from-[#fff7ed] via-[#ffedd5] to-[#fff7ed]',
    cardBg: 'bg-white/75 backdrop-blur-2xl',
    borderColor: 'border-orange-500/25',
    glowColor: 'rgba(249, 115, 22, 0.2)',
    textColor: 'text-[#431407]',
    textMuted: 'text-[#9a3412]',
    badgeBg: 'bg-orange-500/10 text-[#c2410c] border-orange-500/25',
    previewGradient: 'from-orange-400 to-red-700',
  },
{
    id: 'midnight',
    name: 'Midnight Electric',
    primary: '#3b82f6',
    secondary: '#2563eb',
    accent: '#60a5fa',
    bgBase: '#eff6ff',
    isDark: false,
    bgGradient: 'from-[#eff6ff] via-[#dbeafe] to-[#eff6ff]',
    cardBg: 'bg-white/75 backdrop-blur-2xl',
    borderColor: 'border-blue-500/25',
    glowColor: 'rgba(59, 130, 246, 0.2)',
    textColor: 'text-[#0c1e3d]',
    textMuted: 'text-[#1e3a8a]',
    badgeBg: 'bg-blue-500/10 text-[#1d4ed8] border-blue-500/25',
    previewGradient: 'from-blue-400 to-indigo-800',
  },
{
    id: 'magenta',
    name: 'Liquid Magenta',
    primary: '#db2777',
    secondary: '#be185d',
    accent: '#f472b6',
    bgBase: '#fdf2f8',
    isDark: false,
    bgGradient: 'from-[#fdf2f8] via-[#fce7f3] to-[#fdf2f8]',
    cardBg: 'bg-white/75 backdrop-blur-2xl',
    borderColor: 'border-pink-500/25',
    glowColor: 'rgba(219, 39, 119, 0.2)',
    textColor: 'text-[#500724]',
    textMuted: 'text-[#9d174d]',
    badgeBg: 'bg-pink-500/10 text-[#be185d] border-pink-500/25',
    previewGradient: 'from-pink-400 to-rose-700',
  },
{
    id: 'graphite',
    name: 'Titanium Graphite',
    primary: '#475569',
    secondary: '#334155',
    accent: '#94a3b8',
    bgBase: '#f8fafc',
    isDark: false,
    bgGradient: 'from-[#f8fafc] via-[#e2e8f0] to-[#f8fafc]',
    cardBg: 'bg-white/75 backdrop-blur-2xl',
    borderColor: 'border-slate-400/25',
    glowColor: 'rgba(71, 85, 105, 0.2)',
    textColor: 'text-[#0f172a]',
    textMuted: 'text-[#334155]',
    badgeBg: 'bg-slate-500/10 text-[#334155] border-slate-400/25',
    previewGradient: 'from-slate-400 to-slate-800',
  },
{
    id: 'cyberpunk',
    name: 'Cyberpunk Neon 2077 VIP',
    primary: '#00f0ff',
    secondary: '#ff007f',
    accent: '#ffe600',
    bgBase: '#050811',
    isDark: true,
    bgGradient: 'from-[#050811] via-[#0d091f] to-[#04060e]',
    cardBg: 'bg-[#0b1021]/80 backdrop-blur-2xl',
    borderColor: 'border-cyan-500/35',
    glowColor: 'rgba(0, 240, 255, 0.35)',
    textColor: 'text-[#e0f7ff]',
    textMuted: 'text-[#709bb0]',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    previewGradient: 'from-[#00f0ff] via-[#ff007f] to-[#ffe600]',
    tag: 'VIP Cyber',
    auroraGradient: 'from-cyan-500/30 via-pink-500/25 to-yellow-500/20',
  },
{
    id: 'royal_ruby',
    name: 'Royal Imperial Ruby VIP',
    primary: '#ff1744',
    secondary: '#990024',
    accent: '#ff80ab',
    bgBase: '#120307',
    isDark: true,
    bgGradient: 'from-[#120307] via-[#21060e] to-[#0d0205]',
    cardBg: 'bg-[#20070e]/80 backdrop-blur-2xl',
    borderColor: 'border-rose-500/35',
    glowColor: 'rgba(255, 23, 68, 0.35)',
    textColor: 'text-[#ffebee]',
    textMuted: 'text-[#b07280]',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    previewGradient: 'from-[#ff1744] via-[#be123c] to-[#4c0519]',
    tag: 'VIP Royal',
    auroraGradient: 'from-rose-500/35 via-pink-600/25 to-red-900/30',
  },
{
    id: 'aurora_borealis',
    name: 'Nordic Aurora Borealis VIP',
    primary: '#00ff87',
    secondary: '#60efff',
    accent: '#7b2ff7',
    bgBase: '#030a14',
    isDark: true,
    bgGradient: 'from-[#030a14] via-[#071924] to-[#0a051d]',
    cardBg: 'bg-[#071626]/80 backdrop-blur-2xl',
    borderColor: 'border-teal-400/35',
    glowColor: 'rgba(0, 255, 135, 0.35)',
    textColor: 'text-[#e0fffa]',
    textMuted: 'text-[#6aa89d]',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    previewGradient: 'from-[#00ff87] via-[#60efff] to-[#7b2ff7]',
    tag: 'VIP Aurora',
    auroraGradient: 'from-emerald-400/35 via-cyan-400/30 to-purple-600/25',
  },
{
    id: 'solaris_gold',
    name: 'Solaris 24K Luxury Gold VIP',
    primary: '#ffd700',
    secondary: '#b8860b',
    accent: '#fff176',
    bgBase: '#0e0c05',
    isDark: true,
    bgGradient: 'from-[#0e0c05] via-[#1c1808] to-[#0a0904]',
    cardBg: 'bg-[#1f1b0a]/80 backdrop-blur-2xl',
    borderColor: 'border-amber-400/35',
    glowColor: 'rgba(255, 215, 0, 0.35)',
    textColor: 'text-[#fffde7]',
    textMuted: 'text-[#b8a66b]',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    previewGradient: 'from-[#ffd700] via-[#d97706] to-[#78350f]',
    tag: 'VIP Gold',
    auroraGradient: 'from-amber-400/35 via-yellow-500/30 to-orange-700/25',
  },
{
    id: 'sapphire_ice',
    name: 'Arctic Sapphire Diamond VIP',
    primary: '#0284c7',
    secondary: '#0369a1',
    accent: '#06b6d4',
    bgBase: '#f0fdfd',
    isDark: false,
    bgGradient: 'from-[#f0fdfd] via-[#e0f7fa] to-[#e8f4f8]',
    cardBg: 'bg-white/80 backdrop-blur-2xl',
    borderColor: 'border-cyan-500/30',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    textColor: 'text-[#083344]',
    textMuted: 'text-[#155e75]',
    badgeBg: 'bg-cyan-500/15 text-[#0e7490] border-cyan-500/30',
    previewGradient: 'from-[#38bdf8] via-[#0284c7] to-[#1e3a8a]',
    tag: 'VIP Diamond',
    auroraGradient: 'from-cyan-400/30 via-sky-400/25 to-blue-600/20',
  },
{
    id: 'cosmic_nebula',
    name: 'Cosmic Nebula Deep Space VIP',
    primary: '#a855f7',
    secondary: '#ec4899',
    accent: '#38bdf8',
    bgBase: '#090514',
    isDark: true,
    bgGradient: 'from-[#090514] via-[#160b29] to-[#06030e]',
    cardBg: 'bg-[#180d2e]/80 backdrop-blur-2xl',
    borderColor: 'border-purple-500/35',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    textColor: 'text-[#f5f3ff]',
    textMuted: 'text-[#9d8bb8]',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    previewGradient: 'from-[#a855f7] via-[#ec4899] to-[#38bdf8]',
    tag: 'VIP Galaxy',
    auroraGradient: 'from-purple-500/35 via-pink-500/30 to-cyan-500/25',
  },
{
    id: 'emerald_matrix_pro',
    name: 'Quantum Matrix Phosphor VIP',
    primary: '#22c55e',
    secondary: '#15803d',
    accent: '#4ade80',
    bgBase: '#020a04',
    isDark: true,
    bgGradient: 'from-[#020a04] via-[#05170a] to-[#010602]',
    cardBg: 'bg-[#071c0c]/80 backdrop-blur-2xl',
    borderColor: 'border-green-500/35',
    glowColor: 'rgba(34, 197, 94, 0.35)',
    textColor: 'text-[#dcfce7]',
    textMuted: 'text-[#6da87b]',
    badgeBg: 'bg-green-500/20 text-green-300 border-green-400/40',
    previewGradient: 'from-[#22c55e] via-[#15803d] to-[#052e16]',
    tag: 'VIP Quantum',
    auroraGradient: 'from-emerald-400/35 via-green-500/30 to-teal-700/25',
  },
{
    id: 'champagne_blush',
    name: 'Parisian Champagne Blush VIP',
    primary: '#f43f5e',
    secondary: '#e11d48',
    accent: '#fbbf24',
    bgBase: '#fff5f5',
    isDark: false,
    bgGradient: 'from-[#fff5f5] via-[#ffe8ec] to-[#fff0f3]',
    cardBg: 'bg-white/80 backdrop-blur-2xl',
    borderColor: 'border-rose-400/30',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    textColor: 'text-[#4c0519]',
    textMuted: 'text-[#9f1239]',
    badgeBg: 'bg-rose-500/15 text-[#be185d] border-rose-400/30',
    previewGradient: 'from-[#fb7185] via-[#f43f5e] to-[#fbbf24]',
    tag: 'VIP Luxe',
    auroraGradient: 'from-rose-400/30 via-pink-400/25 to-amber-300/20',
  }
];

export function isSystemDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getTheme(id: string, prefersDark?: boolean): ThemeDef {
  const isDark = prefersDark !== undefined ? prefersDark : isSystemDark();
  if (id === 'auto') {
    const matched = THEMES.find(t => t.id === (isDark ? 'dark' : 'green'));
    return matched || THEMES[1];
  }
  const found = THEMES.find(t => t.id === id);
  if (found) return found;
  return isDark ? (THEMES.find(t => t.id === 'dark') || THEMES[1]) : THEMES[1];
}

/**
 * Dynamically applies theme colors to document root so ALL UI elements,
 * Tailwind colors, buttons, glows, badges, and chart variables adapt instantly.
 */
export function applyThemeToDocument(theme: ThemeDef): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // 1. Core Dynamic Theme CSS Variables
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-secondary', theme.secondary);
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-glow', theme.glowColor);
  root.style.setProperty('--theme-bg-base', theme.bgBase);
  root.style.setProperty('--theme-border', `${theme.primary}45`);
  root.style.setProperty('--theme-border-subtle', `${theme.primary}25`);
  root.style.setProperty('--theme-badge-bg', `${theme.primary}20`);
  root.style.setProperty('--theme-badge-text', theme.isDark ? theme.accent : theme.secondary);
  root.style.setProperty('--theme-text-accent', theme.isDark ? theme.accent : theme.secondary);

  // 2. Legacy Accent Bindings
  root.style.setProperty('--accent', theme.primary);
  root.style.setProperty('--accent-emerald', theme.secondary);
  root.style.setProperty('--accent-glow', theme.glowColor);

  // 3. Dynamic Tailwind CSS v4 Color Overrides for Emerald & Green
  // This causes all existing text-emerald-*, bg-emerald-*, border-emerald-* to take the theme color!
  root.style.setProperty('--color-emerald-50', `${theme.primary}12`);
  root.style.setProperty('--color-emerald-100', `${theme.primary}22`);
  root.style.setProperty('--color-emerald-200', `${theme.primary}38`);
  root.style.setProperty('--color-emerald-300', theme.accent);
  root.style.setProperty('--color-emerald-400', theme.accent);
  root.style.setProperty('--color-emerald-500', theme.primary);
  root.style.setProperty('--color-emerald-600', theme.secondary);
  root.style.setProperty('--color-emerald-700', theme.secondary);
  root.style.setProperty('--color-emerald-800', theme.isDark ? '#0b1610' : '#032612');
  root.style.setProperty('--color-emerald-900', theme.isDark ? '#050c08' : '#01150a');

  // Green palette overrides
  root.style.setProperty('--color-green-300', theme.accent);
  root.style.setProperty('--color-green-400', theme.accent);
  root.style.setProperty('--color-green-500', theme.primary);
  root.style.setProperty('--color-green-600', theme.secondary);
}
