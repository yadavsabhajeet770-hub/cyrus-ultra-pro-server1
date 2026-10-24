import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Flame,
  AlertCircle,
  Sparkles,
  X,
  Target,
  ArrowRight,
} from 'lucide-react';
import { AppNotification } from '../types';
import { sound, vibrate } from '../utils/audio';

interface IPhoneNotificationProps {
  notification: AppNotification | null;
  onDismiss: () => void;
}

export const IPhoneNotification: React.FC<IPhoneNotificationProps> = ({
  notification,
  onDismiss,
}) => {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  // Auto-dismiss after 2.6 seconds (resilient to parent re-renders)
  useEffect(() => {
    if (!notification) return;

    // Trigger subtle haptic on notification popup
    if (notification.type === 'JACKPOT') {
      vibrate([60, 40, 100]);
    } else if (notification.type === 'WIN') {
      vibrate([50, 30, 50]);
    } else if (notification.type === 'SKIP') {
      vibrate([40, 30, 40]);
    } else {
      vibrate(100);
    }

    const timer = setTimeout(() => {
      onDismissRef.current();
    }, 2600);

    return () => clearTimeout(timer);
  }, [notification?.id]); // Only reset when notification ID changes

  const isJackpot = notification?.type === 'JACKPOT';
  const isWin = notification?.type === 'WIN';
  const isLoss = notification?.type === 'LOSS';
  const isSkip = notification?.type === 'SKIP';

  return (
    <div className="fixed top-3 left-0 right-0 z-50 flex justify-center items-start px-3 pointer-events-none">
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ y: -70, opacity: 0, scale: 0.88 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{
              y: -80,
              opacity: 0,
              scale: 0.85,
              transition: { duration: 0.22, ease: 'easeOut' },
            }}
            transition={{ type: 'spring', damping: 24, stiffness: 340 }}
            drag
            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_, info) => {
              // Dismiss if swiped Left, Right, or Upwards
              const isSwipedHorizontally =
                Math.abs(info.offset.x) > 40 || Math.abs(info.velocity.x) > 200;
              const isSwipedUpwards =
                info.offset.y < -30 || info.velocity.y < -200;

              if (isSwipedHorizontally || isSwipedUpwards) {
                sound.playClick();
                vibrate(20);
                onDismissRef.current();
              }
            }}
            className={`pointer-events-auto relative w-full max-w-[390px] rounded-[26px] p-3 cursor-grab active:cursor-grabbing select-none backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] border transition-shadow touch-pan-y ${
              isJackpot
                ? 'bg-slate-950/95 border-amber-400/60 shadow-amber-500/20'
                : isWin
                ? 'bg-slate-950/95 border-emerald-500/60 shadow-emerald-500/20'
                : isSkip
                ? 'bg-slate-950/95 border-amber-500/60 shadow-amber-500/25'
                : 'bg-slate-950/95 border-rose-500/50 shadow-rose-500/15'
            }`}
            id="iphone-dynamic-notification-banner"
          >
            {/* Top Specular Notch Line */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-white/25" />

            {/* Glowing Ambient Top Edge */}
            <div
              className={`absolute top-0 left-6 right-6 h-[2px] rounded-full blur-sm opacity-90 ${
                isJackpot
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500'
                  : isWin
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500'
                  : isSkip
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400'
                  : 'bg-gradient-to-r from-rose-500 via-red-400 to-rose-600'
              }`}
            />

            <div className="flex items-center gap-3 pt-1">
              {/* iOS Left App/Result Icon */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-11 h-11 rounded-2xl p-0.5 flex items-center justify-center shadow-lg ${
                    isJackpot
                      ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-amber-500/40 text-slate-950'
                      : isWin
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-300 shadow-emerald-500/40 text-slate-950'
                      : isSkip
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-400 shadow-amber-500/40 text-slate-950'
                      : 'bg-gradient-to-tr from-rose-600 to-red-400 shadow-rose-500/40 text-white'
                  }`}
                >
                  {isJackpot ? (
                    <Sparkles size={22} className="animate-spin-slow stroke-[2.5]" />
                  ) : isWin ? (
                    <Trophy size={20} className="stroke-[2.5]" />
                  ) : isSkip ? (
                    <Target size={20} className="stroke-[2.5]" />
                  ) : (
                    <AlertCircle size={20} className="stroke-[2.5]" />
                  )}
                </div>

                {/* Mini Pulsing Dot */}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                    isJackpot
                      ? 'bg-amber-400 animate-pulse'
                      : isWin
                      ? 'bg-[#00e676] animate-ping'
                      : isSkip
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
              </div>

              {/* Notification Center Content */}
              <div className="flex-1 min-w-0 pr-1">
                {/* Header Info */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                  <span className="font-bold flex items-center gap-1 uppercase tracking-wider text-slate-300">
                    <span>CYRUS ULTRA PRO</span>
                    <span>·</span>
                    <span className={isSkip ? 'text-amber-400' : 'text-emerald-400'}>
                      #{notification.period.slice(-4)}
                    </span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono flex items-center gap-0.5">
                    <span>Swipe to dismiss</span>
                  </span>
                </div>

                {/* Title / Headline */}
                <div className="flex items-center gap-1.5">
                  <h4
                    className={`text-xs sm:text-sm font-space font-black tracking-tight leading-tight ${
                      isJackpot
                        ? 'text-amber-300'
                        : isWin
                        ? 'text-emerald-300'
                        : isSkip
                        ? 'text-amber-300'
                        : 'text-rose-300'
                    }`}
                  >
                    {notification.title}
                  </h4>
                </div>

                {/* Message Details */}
                <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-slate-200">
                  {isSkip ? (
                    <div className="text-[10px] text-amber-200/90 font-medium truncate">
                      {notification.skipReason || 'Capital Protection: Pass round due to unstable pattern'}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1 font-bold">
                        <span className="text-slate-400">TGT:</span>
                        <span
                          className={`px-1.5 py-0.2 rounded font-black text-[10px] ${
                            notification.target === 'RED' || notification.target === 'BIG'
                              ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {notification.target}
                        </span>
                      </div>

                      <ArrowRight size={10} className="text-slate-400 flex-shrink-0" />

                      <div className="flex items-center gap-1 font-bold">
                        <span className="text-slate-400">OUTCOME:</span>
                        <span className="text-amber-300 font-black">
                          #{notification.actualNum}
                        </span>
                        <span className="text-slate-300 text-[10px]">
                          ({notification.actualSize}/{notification.actualColor})
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right Badge / Dismiss Button */}
              <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    sound.playClick();
                    onDismissRef.current();
                  }}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Dismiss"
                >
                  <X size={14} />
                </button>

                {notification.streak !== undefined && notification.streak > 1 && !isSkip && (
                  <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold shadow-sm">
                    <Flame size={10} className="text-amber-400 fill-amber-400" />
                    <span>{notification.streak}x STREAK</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Progress Bar (Autoclose in 2.6s) */}
            <div className="mt-2 w-full h-[2.5px] rounded-full bg-slate-800/80 overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 2.6, ease: 'linear' }}
                className={`h-full ${
                  isJackpot
                    ? 'bg-amber-400'
                    : isWin
                    ? 'bg-[#00e676]'
                    : isSkip
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
