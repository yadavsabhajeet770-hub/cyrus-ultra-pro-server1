import confetti from 'canvas-confetti';

let confettiInstance: ((opts?: confetti.Options) => Promise<null> | null) | null = null;

/**
 * Safe, iframe-resilient confetti trigger that does not crash on window resize or in sandboxed web workers.
 */
export function fireConfetti(options?: confetti.Options): void {
  try {
    if (typeof window === 'undefined') return;

    if (!confettiInstance) {
      // useWorker: false prevents the canvas.getBoundingClientRect error during window resize
      confettiInstance = confetti.create(undefined, {
        resize: true,
        useWorker: false,
        disableForReducedMotion: true,
      });
    }

    confettiInstance(options);
  } catch (err) {
    console.warn('Confetti animation suppressed or unsupported:', err);
  }
}
