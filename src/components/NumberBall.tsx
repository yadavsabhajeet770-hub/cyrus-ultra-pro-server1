import React, { useState } from 'react';
import { motion } from 'motion/react';

export const NUMBER_BALL_IMAGES: Record<number, string> = {
  0: 'https://i.postimg.cc/ncD8Fw3w/num0-1.png',
  1: 'https://i.postimg.cc/qRRY9mt5/num0-2.png',
  2: 'https://i.postimg.cc/MXkFfq9t/num0-3.png',
  3: 'https://i.postimg.cc/65n9j3x2/num0-4.png',
  4: 'https://i.postimg.cc/fb2ZtSmj/num0-5.png',
  5: 'https://i.postimg.cc/90TjnxSP/num0-6.png',
  6: 'https://i.postimg.cc/KvP27Htk/num0-7.png',
  7: 'https://i.postimg.cc/6Q3xX6gM/num0-8.png',
  8: 'https://i.postimg.cc/pT5NmG2h/num0-9.png',
  9: 'https://i.postimg.cc/8Cs9YKfd/num0-10.png',
};

export interface NumberBallProps {
  num: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  isWinning?: boolean;
  isSelected?: boolean;
  className?: string;
  animate?: boolean;
  delay?: number;
  showLabel?: boolean;
  label?: string;
  onClick?: () => void;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 min-w-[24px]',
  sm: 'w-8 h-8 min-w-[32px]',
  md: 'w-10 h-10 min-w-[40px]',
  lg: 'w-12 h-12 min-w-[48px]',
  xl: 'w-14 h-14 min-w-[56px]',
  hero: 'w-16 h-16 sm:w-20 sm:h-20 min-w-[64px] sm:min-w-[80px]',
};

export const NumberBall: React.FC<NumberBallProps> = ({
  num,
  size = 'md',
  isWinning = false,
  isSelected = false,
  className = '',
  animate = true,
  delay = 0,
  showLabel = false,
  label,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const safeNum = Math.abs(Number.isFinite(num) ? Math.floor(num) % 10 : 0);
  const imageUrl = NUMBER_BALL_IMAGES[safeNum] || NUMBER_BALL_IMAGES[0];

  const isBig = safeNum >= 5;
  const isViolet = safeNum === 0 || safeNum === 5;
  const isRed = safeNum % 2 === 0;

  const fallbackBg = isViolet
    ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-800 text-white'
    : isRed
    ? 'bg-gradient-to-tr from-rose-500 via-red-500 to-rose-700 text-white'
    : 'bg-gradient-to-tr from-emerald-500 via-green-500 to-emerald-700 text-white';

  const content = (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center group ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div
        className={`relative rounded-full flex items-center justify-center transition-all duration-300 ${
          SIZE_CLASSES[size]
        } ${
          isWinning
            ? 'ring-4 ring-[#00ffaa] shadow-[0_0_30px_rgba(0,255,170,0.85)] scale-110'
            : isSelected
            ? 'ring-3 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.65)] hover:scale-110'
            : 'shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95'
        }`}
      >
        {!imageError ? (
          <img
            src={imageUrl}
            alt={`Ball ${safeNum}`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] pointer-events-none select-none rounded-full"
            loading="eager"
          />
        ) : (
          <div
            className={`w-full h-full rounded-full flex items-center justify-center font-space font-black text-sm sm:text-base border border-white/30 shadow-inner ${fallbackBg}`}
          >
            {safeNum}
          </div>
        )}

        {/* Win Glow Ripple */}
        {isWinning && (
          <span className="absolute -inset-1 rounded-full border-2 border-[#00ffaa] animate-ping opacity-75 pointer-events-none" />
        )}
      </div>

      {showLabel && (
        <span className="mt-1 text-[10px] font-mono font-black text-slate-300 uppercase tracking-wider">
          {label || (isBig ? 'BIG' : 'SMALL')}
        </span>
      )}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ scale: 0.1, rotate: -30, opacity: 0, y: -10 }}
      animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 20,
        delay,
      }}
      className="inline-flex items-center justify-center"
    >
      {content}
    </motion.div>
  );
};
