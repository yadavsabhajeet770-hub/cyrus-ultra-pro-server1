import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import {
  initializeFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  getDocFromServer,
  onSnapshot,
  Firestore,
  setLogLevel,
} from 'firebase/firestore';
import config from '../../firebase-applet-config.json';
import { AppSettings, WingoHistoryRecord } from '../types';

// Silence verbose internal connection timeout warnings from Firestore when running offline or in restricted networks
try {
  setLogLevel('silent');
} catch {}

const app = !getApps().length ? initializeApp(config) : getApp();
export const auth = getAuth(app);
export const db: Firestore = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  config.firestoreDatabaseId || undefined
);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Info:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial connection test to test Firestore reachability safely
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const testRef = doc(db, 'test', 'connection');
    await Promise.race([
      getDocFromServer(testRef),
      new Promise((_, reject) => setTimeout(() => reject(new Error('the client is offline')), 4000)),
    ]);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.info('Firestore client operating with local cache fallback.');
    }
    return false;
  }
}
testFirestoreConnection().catch(() => {});

// Save user profile and settings to cloud database
export async function syncUserSettingsToCloud(userId: string, settings: Partial<AppSettings>): Promise<void> {
  if (!userId || !auth.currentUser) return;
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        userId,
        userName: settings.userName || 'CYRUS VIP Player',
        userAvatar: settings.userAvatar || '',
        userTitle: settings.userTitle || 'VIP ELITE',
        theme: settings.theme || 'green',
        sound: settings.sound ?? true,
        vibrate: settings.vibrate ?? true,
        particles: settings.particles ?? true,
        autoRefresh: settings.autoRefresh ?? true,
        refreshInterval: settings.refreshInterval ?? 2,
        recovery: settings.recovery ?? true,
        showNums: settings.showNums ?? true,
        server: settings.server ?? 1,
        proxyUrl: settings.proxyUrl || '',
        aiProxyUrl: settings.aiProxyUrl || '',
        activeKey: settings.activeKey || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // Fallback silently to preserve local state
    }
  }
}

// Fetch user settings from cloud database
export async function fetchUserSettingsFromCloud(userId: string): Promise<Partial<AppSettings> | null> {
  if (!userId) return null;
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as Partial<AppSettings>;
    }
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.GET, path);
    } catch {
      return null;
    }
  }
  return null;
}

// Save history record to cloud database
export async function syncHistoryRecordToCloud(userId: string, record: WingoHistoryRecord): Promise<void> {
  if (!userId || !auth.currentUser) return;
  const sanitizedPeriod = (record.period || String(Date.now())).replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `users/${userId}/history/${sanitizedPeriod}`;
  try {
    const histDocRef = doc(db, 'users', userId, 'history', sanitizedPeriod);
    await setDoc(
      histDocRef,
      {
        userId,
        period: record.period,
        predicted: record.predicted,
        focusTarget: record.focusTarget || record.predicted,
        targetCategory: record.targetCategory || 'SIZE',
        suggestedNums: record.suggestedNums || [],
        actualNum: record.actualNum ?? null,
        actualSize: record.actualSize || null,
        actualColor: record.actualColor || null,
        result: record.result || 'LOSS',
        isSkip: Boolean(record.isSkip),
        isHedgeActive: Boolean(record.isHedgeActive),
        skipReason: record.skipReason || '',
        engine: record.engine || 'CYRUS AI Quantum',
        confidence: record.confidence || 85,
        timestamp: record.timestamp || new Date().toLocaleTimeString(),
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // Fallback silently
    }
  }
}

// Fetch recent history records from cloud
export async function fetchUserHistoryFromCloud(userId: string): Promise<WingoHistoryRecord[]> {
  if (!userId) return [];
  const path = `users/${userId}/history`;
  try {
    const q = query(collection(db, 'users', userId, 'history'), orderBy('createdAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);
    const results: WingoHistoryRecord[] = [];
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      results.push({
        period: data.period || '',
        predicted: data.predicted || 'BIG',
        focusTarget: data.focusTarget || data.predicted || 'BIG',
        targetCategory: data.targetCategory || 'SIZE',
        suggestedNums: Array.isArray(data.suggestedNums) ? data.suggestedNums : [],
        actualNum: data.actualNum !== null ? data.actualNum : undefined,
        actualSize: data.actualSize || undefined,
        actualColor: data.actualColor || undefined,
        result: data.result || undefined,
        isSkip: data.isSkip,
        isHedgeActive: data.isHedgeActive,
        skipReason: data.skipReason,
        engine: data.engine || 'CYRUS AI Quantum',
        confidence: data.confidence || 85,
        timestamp: data.timestamp || '',
      });
    });
    return results;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.LIST, path);
    } catch {
      return [];
    }
  }
  return [];
}

// Save global shared prediction signal
export async function syncGlobalSignalToCloud(signal: {
  period: string;
  prediction: 'BIG' | 'SMALL';
  focusTarget: string;
  targetCategory: string;
  luckyDigits: number[];
  isHedgeActive?: boolean;
  confidence: number;
  engine: string;
  trendHealth?: number;
}): Promise<void> {
  if (!auth.currentUser) return;
  const sanitized = signal.period.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `global_signals/${sanitized}`;
  try {
    const signalRef = doc(db, 'global_signals', sanitized);
    await setDoc(
      signalRef,
      {
        ...signal,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // Ignored for resilience
    }
  }
}

export async function publishGlobalPredictionSignal(
  period: string,
  pred: {
    pred: 'BIG' | 'SMALL';
    focusTarget?: string;
    targetCategory?: string;
    nums?: number[];
    isHedgeActive?: boolean;
    confidence: number;
    mode?: string;
    trendHealth?: number;
  }
): Promise<void> {
  if (!period || !pred) return;
  return syncGlobalSignalToCloud({
    period,
    prediction: pred.pred,
    focusTarget: pred.focusTarget || pred.pred,
    targetCategory: pred.targetCategory || 'SIZE',
    luckyDigits: Array.isArray(pred.nums) ? pred.nums : [],
    isHedgeActive: pred.isHedgeActive,
    confidence: pred.confidence,
    engine: pred.mode || 'CYRUS AI Quantum',
    trendHealth: pred.trendHealth,
  });
}

export {
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  onSnapshot,
  type User,
};
