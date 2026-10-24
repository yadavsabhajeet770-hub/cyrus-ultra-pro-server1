import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff
} from 'lucide-react';
import { sound, vibrate } from '../utils/audio';
import { auth, googleProvider, signInWithPopup, signInAnonymously } from '../services/firebase';

interface LoginScreenProps {
  onLoginSuccess: (name: string, email?: string, photoURL?: string) => void;
  isDarkTheme?: boolean;
}

// Master VIP Passcode
const MASTER_VIP_PASSCODE = 'CYRUS2.0';
const VIDEO_SOURCE_URL = 'https://www.image2url.com/r2/default/videos/1787838063195-3e5f3909-821f-4b7e-a69c-ac85a8c32e05.mp4';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Video playback & audio state
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize and ensure video autoplays safely
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoLoaded(true);
          })
          .catch(err => {
            console.log('Autoplay restriction handled:', err);
          });
      }
    }
  }, []);

  // Toggle Video Sound
  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    sound.playClick();
    vibrate(20);

    if (isMuted) {
      video.muted = false;
      video.volume = 0.7;
      video.play().then(() => {
        setIsMuted(false);
      }).catch(err => {
        console.warn('Audio unmute blocked by browser policy:', err);
        video.muted = true;
        setIsMuted(true);
      });
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  // Google Login via Firebase
  const handleGoogleLogin = async () => {
    sound.playClick();
    vibrate(30);
    setIsGoogleLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      sound.playWin();
      vibrate([40, 60, 40]);
      const displayName = user.displayName || user.email?.split('@')[0] || 'CYRUS VIP Member';
      onLoginSuccess(displayName, user.email || undefined, user.photoURL || undefined);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Google Auth connecting. Enter VIP Password CYRUS2.0 below.');
      } else {
        setError(err.message || 'Google Auth error. Unlock with VIP Password below.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  /**
   * Dedicated authentication handler
   */
  const authenticateUser = async (inputPassword: string): Promise<{ success: boolean; message?: string }> => {
    const trimmed = inputPassword.trim();
    
    if (!trimmed) {
      return { success: false, message: 'Please enter your VIP Password' };
    }

    if (trimmed === MASTER_VIP_PASSCODE) {
      try {
        await signInAnonymously(auth);
      } catch (authError) {
        console.info('Anonymous session initialized locally:', authError);
      }
      return { success: true };
    }

    return { 
      success: false, 
      message: 'Incorrect password. Please try again.' 
    };
  };

  // Password Unlock Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    vibrate(30);

    setError('');
    const result = await authenticateUser(passcode);

    if (!result.success) {
      setError(result.message || 'Authentication failed');
      vibrate([100, 50, 100]);
      sound.playLoss();
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      sound.playWin();
      vibrate([50, 50, 80]);
      onLoginSuccess('CYRUS VIP Member');
      setIsAuthenticating(false);
    }, 450);
  };

  return (
    <div 
      id="ny-login-root"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto min-h-[100dvh] w-full select-none"
    >
      {/* ========================================================= */}
      {/* 1. CINEMATIC FULLSCREEN MP4 VIDEO BACKGROUND */}
      {/* ========================================================= */}
      <video
        ref={videoRef}
        src={VIDEO_SOURCE_URL}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={() => setIsVideoLoaded(true)}
        onCanPlay={() => setIsVideoLoaded(true)}
        onPlaying={() => setIsVideoLoaded(true)}
        onError={() => {
          console.warn('Video stream error, falling back to gradient');
          setHasVideoError(true);
          setIsVideoLoaded(true);
        }}
        className={`fixed inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ease-out z-0 ${
          isVideoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* Fallback Background if video fails */}
      {hasVideoError && (
        <div className="fixed inset-0 bg-gradient-to-b from-[#0a1811] via-[#102a1c] to-[#040d07] z-0" />
      )}

      {/* ========================================================= */}
      {/* 2. CRYSTAL-CLEAR ULTRA-LIGHT ATMOSPHERIC TINT */}
      {/* ========================================================= */}
      {/* Very light subtle gradient to ensure crystal clarity of the video */}
      <div 
        className="fixed inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45 pointer-events-none z-[1]" 
      />

      {/* Subtle vignette around screen borders */}
      <div 
        className="fixed inset-0 pointer-events-none z-[2]"
        style={{
          background: 'radial-gradient(circle at center, transparent 60%, rgba(0, 0, 0, 0.45) 100%)',
        }}
      />

      {/* ========================================================= */}
      {/* 3. SOUND BUTTON (TOP RIGHT CIRCULAR GLASS PILL) */}
      {/* ========================================================= */}
      <button
        id="video-sound-toggle-btn"
        type="button"
        onClick={toggleSound}
        aria-label={isMuted ? 'Unmute Video' : 'Mute Video'}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-400/25 hover:bg-emerald-400/40 active:scale-95 border border-emerald-400/60 text-emerald-300 backdrop-blur-md shadow-[0_4px_20px_rgba(0,230,118,0.35)] flex items-center justify-center transition-all duration-200 cursor-pointer"
      >
        {isMuted ? (
          <VolumeX size={20} className="text-emerald-300" />
        ) : (
          <Volume2 size={20} className="text-emerald-200 animate-pulse" />
        )}
      </button>

      {/* ========================================================= */}
      {/* 4. PRELOADER INITIALIZATION OVERLAY */}
      {/* ========================================================= */}
      <AnimatePresence>
        {!isVideoLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#051109] text-white"
          >
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_35px_rgba(0,230,118,0.5)] mb-4 animate-pulse">
              <span className="font-space font-black text-2xl text-emerald-600">CYRUS</span>
            </div>
            <p className="font-mono text-xs text-emerald-400 font-bold tracking-widest uppercase">
              INITIALIZING EXPERIENCE...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 5. FLOATING LOGIN UI (EXACT SCREENSHOT LAYOUT) */}
      {/* ========================================================= */}
      <div className="w-full max-w-[390px] mx-auto relative z-10 flex flex-col items-center my-auto py-6">
        
        {/* A. CYRUS LOGO (White rounded square with emerald CYRUS text) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.75, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="mb-3.5 relative"
        >
          <div className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-[22px] bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_20px_rgba(0,230,118,0.4)] border border-white/80 flex items-center justify-center">
            <img src="/assets/cyrus-ultra-pro-logo.jpg" alt="Cyrus Ultra Pro" className="w-full h-full object-cover rounded-[22px]" />
          </div>
        </motion.div>

        {/* B. TITLE: CYRUS ULTRA PRO */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="font-space font-black text-[28px] sm:text-[32px] text-white tracking-tight text-center leading-none drop-shadow-[0_3px_10px_rgba(0,0,0,0.85)]"
        >
          CYRUS ULTRA PRO
        </motion.h1>

        {/* C. SUBTITLE: ✦ VIP SECURE LOGIN */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4 }}
          className="mt-2.5 mb-7 flex items-center justify-center gap-1.5"
        >
          <span className="inline-flex items-center gap-1.5 text-emerald-300 font-space font-black text-xs sm:text-[13px] tracking-widest uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            <Sparkles size={14} className="text-emerald-400 animate-pulse fill-emerald-400" />
            <span>VIP SECURE LOGIN</span>
          </span>
        </motion.div>

        {/* D. GOOGLE LOGIN BUTTON (Large white rounded button) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.55 }}
          className="w-full mb-6"
        >
          <button
            id="google-login-btn"
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isAuthenticating}
            className="w-full h-[54px] sm:h-[58px] px-5 rounded-[26px] bg-white/95 hover:bg-white text-slate-900 font-space font-extrabold text-[13px] sm:text-[14px] tracking-wider uppercase flex items-center justify-center gap-3 shadow-[0_8px_25px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer border border-white"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isGoogleLoading ? 'Connecting Google...' : 'CONTINUE WITH GOOGLE'}</span>
          </button>
        </motion.div>

        {/* E. DIVIDER: OR UNLOCK WITH PASSWORD */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.7 }}
          className="w-full flex items-center gap-3 mb-5 px-1"
        >
          <div className="flex-1 h-[1px] bg-white/40 shadow-sm" />
          <span className="text-[11px] font-mono font-bold text-white/90 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            OR UNLOCK WITH PASSWORD
          </span>
          <div className="flex-1 h-[1px] bg-white/40 shadow-sm" />
        </motion.div>

        {/* F. FORM: VIP PASSWORD & UNLOCK */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          
          {/* Label: VIP UNLOCK PASSWORD */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.85 }}
          >
            <label className="block text-xs font-mono font-bold text-emerald-300 uppercase mb-2 flex items-center gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <KeyRound size={15} className="text-emerald-400" />
              <span className="tracking-wider">VIP UNLOCK PASSWORD</span>
            </label>
            
            {/* Input Box */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <Lock size={18} />
              </div>

              <input
                id="vip-passcode-input"
                type={showPassword ? 'text' : 'password'}
                value={passcode}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onChange={e => {
                  setPasscode(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter VIP Password"
                className="w-full h-[54px] sm:h-[58px] pl-12 pr-12 rounded-[26px] bg-white/90 backdrop-blur-md text-sm sm:text-base font-mono font-bold text-slate-900 placeholder:text-slate-500 placeholder:font-mono border border-white/80 focus:bg-white focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/30 shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-all duration-200"
              />

              {/* Show / Hide password button */}
              <button
                type="button"
                onClick={() => {
                  setShowPassword(!showPassword);
                  vibrate(15);
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-3 rounded-2xl bg-rose-950/80 text-rose-200 text-xs font-semibold border border-rose-500/50 flex items-center gap-2 backdrop-blur-md shadow-lg"
              >
                <AlertCircle size={15} className="text-rose-400 flex-shrink-0" />
                <span className="flex-1">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* G. MAIN BUTTON: UNLOCK CYRUS AI DASHBOARD → */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 1.0 }}
            className="pt-1"
          >
            <button
              id="vip-unlock-submit-btn"
              type="submit"
              disabled={isAuthenticating || isGoogleLoading}
              className="w-full h-[54px] sm:h-[58px] rounded-[26px] bg-gradient-to-r from-[#00e676] via-[#00c853] to-[#00b04a] hover:brightness-105 active:scale-[0.98] text-white font-space font-black text-sm sm:text-[15px] tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-[0_10px_28px_rgba(0,200,83,0.55)] border border-emerald-300/60 transition-all duration-200 group cursor-pointer"
            >
              {isAuthenticating ? (
                <span className="flex items-center gap-2 text-white">
                  <ShieldCheck size={20} className="animate-spin text-white" />
                  <span>VERIFYING ACCESS...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                  <span>UNLOCK CYRUS AI DASHBOARD</span>
                  <ArrowRight size={19} className="transition-transform duration-200 group-hover:translate-x-1.5 text-white" />
                </span>
              )}
            </button>
          </motion.div>
        </form>

        {/* H. FOOTER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 1.15 }}
          className="mt-8 text-center"
        >
          <a
            href="https://t.me/Always_king_NY"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] sm:text-xs font-mono font-medium text-white/80 hover:text-emerald-300 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
          >
            Secure Cyrus Ultra Pro access
          </a>
        </motion.div>
      </div>
    </div>
  );
};
