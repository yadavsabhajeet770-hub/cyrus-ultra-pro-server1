import React from 'react';
import { motion } from 'motion/react';
import { Bot, Sparkles } from 'lucide-react';
import { sound, vibrate } from '../utils/audio';
import { ThemeDef } from '../utils/theme';

interface FloatingAIChatWidgetProps {
  onOpen: () => void;
  currentPrediction?: string;
  confidence?: number;
  isDarkTheme?: boolean;
  theme?: ThemeDef;
}

export const FloatingAIChatWidget: React.FC<FloatingAIChatWidgetProps> = ({
  onOpen,
  currentPrediction,
  confidence = 88,
  isDarkTheme = false,
  theme,
}) => {
  const handleClick = () => {
    sound.playClick();
    vibrate(35);
    onOpen();
  };

  return (
    <aside
      aria-label="CYRUS AI Quantum Assistant"
      className="fixed bottom-24 right-3.5 sm:right-6 z-40 flex flex-col items-end pointer-events-auto select-none"
    >
      {/* Mini notification chip */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', damping: 20 }}
        onClick={handleClick}
        className={`mb-2 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl cursor-pointer shadow-lg backdrop-blur-xl border ${
          isDarkTheme ? 'bg-slate-900/90 text-white' : 'bg-white/95 text-slate-800'
        } text-[11px] font-bold`}
        style={{
          borderColor: theme ? `${theme.primary}40` : 'rgba(16, 185, 129, 0.3)',
        }}
      >
        <Sparkles size={12} className="animate-pulse" style={{ color: theme?.primary || '#00e676' }} />
        <span className="font-space font-black">AI Live:</span>
        <span className="font-mono">{currentPrediction || 'READY'}</span>
        <span
          className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold"
          style={{
            backgroundColor: theme ? `${theme.primary}20` : 'rgba(16, 185, 129, 0.2)',
            color: theme?.primary || '#00b84a',
          }}
        >
          {confidence}%
        </span>
      </motion.div>

      {/* Main Corner Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
        whileTap={{ scale: 0.92 }}
        onClick={handleClick}
        className="relative group p-3.5 sm:p-4 rounded-3xl text-white shadow-2xl border-2 flex items-center justify-center cursor-pointer transition-all duration-300"
        style={{
          background: theme
            ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
            : 'linear-gradient(135deg, #00e676, #00b84a, #004d1e)',
          boxShadow: theme
            ? `0 10px 28px ${theme.glowColor}`
            : '0 10px 25px rgba(0, 230, 118, 0.4)',
          borderColor: theme ? `${theme.accent || '#ffffff'}60` : 'rgba(255, 255, 255, 0.4)',
        }}
        title="Open CYRUS AI Gemini Assistant"
        id="floating-ai-chatbot-widget"
      >
        {/* Animated Radar Pulse Ring */}
        <span
          className="absolute -inset-1 rounded-3xl animate-ping pointer-events-none opacity-70"
          style={{
            backgroundColor: theme ? `${theme.primary}50` : 'rgba(0, 230, 118, 0.3)',
          }}
        />

        {/* Specular sheen */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="w-full h-full bg-gradient-to-t from-transparent via-white/20 to-transparent transform -translate-y-full group-hover:translate-y-full transition-transform duration-700" />
        </div>

        {/* Icon & Online Badge */}
        <div className="relative flex items-center justify-center">
          <Bot size={24} className="stroke-[2.2] animate-bounce text-white drop-shadow-md" />
          <span
            className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border-2 animate-pulse shadow-sm"
            style={{
              backgroundColor: theme?.accent || '#69f0ae',
              borderColor: theme?.secondary || '#004d1e',
            }}
          />
        </div>

        {/* Label Tag for mobile & desktop */}
        <span className="ml-2 font-space font-black text-xs uppercase tracking-wider hidden xs:inline pr-1">
          CYRUS AI
        </span>
      </motion.button>
    </aside>
  );
};
