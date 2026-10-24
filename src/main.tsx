import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Filter benign Firestore offline/slow connection notification from console.error
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function (...args: unknown[]) {
    const msg = args.map(a => (typeof a === 'string' ? a : (a instanceof Error ? a.message : ''))).join(' ');
    if (
      msg.includes('Could not reach Cloud Firestore backend') ||
      msg.includes("Backend didn't respond within 10 seconds") ||
      msg.includes('operate in offline mode until it is able to successfully connect')
    ) {
      console.info('[Firestore] Operating in offline mode until connection is established.');
      return;
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
