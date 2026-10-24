import React from 'react';
import { Sparkles, BarChart3, History, Gamepad2, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { sound, vibrate } from '../utils/audio';
import { ThemeDef } from '../utils/theme';

export type NavTab = 'predictor' | 'analytics' | 'history' | 'game' | 'settings';

interface FloatingNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isDarkTheme?: boolean;
  theme?: ThemeDef;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  currentTab,
  onTabChange,
  isDarkTheme = false,
  theme,
}) => {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ size: number; className?: string }> }> = [
    { id: 'predictor', label: 'Predict', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
    { id: 'game', label: 'Game', icon: Gamepad2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.nav
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28, delay: 0.1 }}
      aria-label="Main Navigation"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-3 pointer-events-auto"
    >
      <div
        className={`relative rounded-full ${
          isDarkTheme ? 'liquid-glass-dark' : 'liquid-glass'
        } p-1.5 flex items-center justify-around shadow-2xl border backdrop-blur-3xl overflow-hidden`}
        style={{
          borderColor: theme ? `${theme.primary}45` : undefined,
          boxShadow: theme ? `0 20px 50px -10px ${theme.glowColor}` : undefined,
        }}
      >
        {/* Top iOS Specular Glass Sheen */}
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/25 to-transparent pointer-events-none" />
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                vibrate(15);
                onTabChange(tab.id);
              }}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.04 }}
              className={`relative px-3 py-2 rounded-full text-xs font-bold transition-colors duration-200 flex flex-col sm:flex-row items-center gap-1 min-w-[58px] justify-center select-none ${
                isActive
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeFloatingNavIndicator"
                  className="absolute inset-0 rounded-full border border-white/25 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${theme?.primary || 'var(--theme-primary, #00e676)'}, ${theme?.secondary || 'var(--theme-secondary, #00b84a)'})`,
                    boxShadow: `0 6px 20px -2px ${theme?.glowColor || 'var(--theme-glow, rgba(0, 230, 118, 0.4))'}`,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 480,
                    damping: 34,
                    mass: 0.75,
                  }}
                />
              )}
              <motion.div
                animate={isActive ? { scale: [1, 1.18, 1], rotate: [0, -3, 3, 0] } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative z-10 flex items-center justify-center"
              >
                <Icon size={16} className={`relative z-10 ${isActive ? 'stroke-[2.5]' : ''}`} />
              </motion.div>
              <span className="relative z-10 text-[10px] sm:text-xs font-space tracking-tight">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

