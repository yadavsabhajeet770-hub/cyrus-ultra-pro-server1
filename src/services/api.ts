import { WingoDrawItem, Analysis100kData, Collector247Stats, WingoMode } from '../types';

export const WINGO_30S_100_API = 'https://sky-predictor-1012593186417.asia-southeast1.run.app/api/wingo-history-30s-100';
export const WINGO_30S_500_API = 'https://sky-predictor-1012593186417.asia-southeast1.run.app/api/wingo-history-30s-500';
export const WINGO_1M_100_API = 'https://sky-predictor-1012593186417.asia-southeast1.run.app/api/wingo-history-1m-100';
export const WINGO_1M_500_API = 'https://sky-predictor-1012593186417.asia-southeast1.run.app/api/wingo-history-1m-500';

export const WINGO_30S_API = WINGO_30S_500_API;
export const PRIMARY_500_API = WINGO_30S_500_API;
export const FALLBACK_API = 'https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json';

// Helper to normalize mode string
export function normalizeModeParam(mode?: string): '30s' | '1m' {
  if (!mode) return '30s';
  const m = mode.toLowerCase();
  if (m === '1min' || m === '1m') return '1m';
  return '30s';
}

// Helper to calculate IST time & period
export function pad(n: number, w: number = 2): string {
  return String(n).padStart(w, '0');
}

export function getISTParts() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 3600000);
  return {
    Y: ist.getFullYear(),
    M: ist.getMonth() + 1,
    D: ist.getDate(),
    h: ist.getHours(),
    m: ist.getMinutes(),
    s: ist.getSeconds(),
    timestamp: ist.getTime(),
  };
}

export function buildIssueFromIST(p = getISTParts(), wingoMode: WingoMode = '30s'): string {
  const ymd = `${p.Y}${pad(p.M)}${pad(p.D)}`;
  const norm = normalizeModeParam(wingoMode);
  if (norm === '30s') {
    const idx = p.h * 120 + p.m * 2 + (p.s >= 30 ? 2 : 1);
    return `${ymd}${pad(idx, 5)}`;
  }
  const idx = p.h * 60 + p.m + 1;
  return `${ymd}${pad(idx, 4)}`;
}

export function getNextPeriodClock(wingoMode: WingoMode = '30s'): string {
  const p = getISTParts();
  const norm = normalizeModeParam(wingoMode);

  if (norm === '30s') {
    let ns = p.s + 30;
    let nm = p.m;
    let nh = p.h;
    const Y = p.Y;
    const M = p.M;
    let D = p.D;
    if (ns >= 60) {
      ns = ns % 60;
      nm++;
    }
    if (nm >= 60) {
      nm = 0;
      nh++;
    }
    if (nh >= 24) {
      nh = 0;
      D += 1;
    }
    const carry = new Date(Date.UTC(Y, M - 1, D, nh, nm, ns));
    const ymd = `${carry.getUTCFullYear()}${pad(carry.getUTCMonth() + 1)}${pad(carry.getUTCDate())}`;
    const idx = nh * 120 + nm * 2 + (ns >= 30 ? 2 : 1);
    return `${ymd}${pad(idx, 5)}`;
  }

  let nm = p.m + 1;
  let nh = p.h;
  const Y = p.Y;
  const M = p.M;
  let D = p.D;
  if (nm >= 60) {
    nh += Math.floor(nm / 60);
    nm = nm % 60;
  }
  if (nh >= 24) {
    nh = nh % 24;
    D += 1;
  }
  const carry = new Date(Date.UTC(Y, M - 1, D, nh, nm, 0));
  const ymd = `${carry.getUTCFullYear()}${pad(carry.getUTCMonth() + 1)}${pad(carry.getUTCDate())}`;
  const idx = nh * 60 + nm + 1;
  return `${ymd}${pad(idx, 4)}`;
}

export function parseWingoItems(rawData: unknown): WingoDrawItem[] {
  if (!rawData) return [];
  let list: unknown[] = [];

  if (Array.isArray(rawData)) {
    list = rawData;
  } else if (typeof rawData === 'object' && rawData !== null) {
    const obj = rawData as Record<string, unknown>;
    if (Array.isArray(obj.list)) {
      list = obj.list;
    } else if (obj.data && typeof obj.data === 'object') {
      const dataObj = obj.data as Record<string, unknown>;
      if (Array.isArray(dataObj.list)) {
        list = dataObj.list;
      } else if (Array.isArray(obj.data)) {
        list = obj.data as unknown[];
      }
    }
  }

  return list.map((item: unknown) => {
    const row = (item && typeof item === 'object') ? (item as Record<string, unknown>) : {};
    const issueNumber = String(row.issueNumber || row.issue || row.period || row.periodNumber || '').trim();
    const numRaw = row.number ?? row.openCode ?? row.num ?? row.drawNumber ?? 0;
    const numParsed = typeof numRaw === 'number' ? numRaw : parseInt(String(numRaw), 10);
    const validNum = isNaN(numParsed) ? 0 : Math.abs(numParsed) % 10;

    // Normalizing colour
    let colour = String(row.colour || row.color || '').toLowerCase().trim();
    if (!colour || colour === 'undefined') {
      if (validNum === 0) colour = 'red-violet';
      else if (validNum === 5) colour = 'green-violet';
      else if (validNum % 2 === 0) colour = 'red';
      else colour = 'green';
    } else {
      colour = colour.replace(',', '-');
    }

    // Normalizing premium (BIG or SMALL)
    let premium = String(row.premium || row.size || '').toLowerCase().trim();
    if (premium !== 'big' && premium !== 'small') {
      premium = validNum >= 5 ? 'big' : 'small';
    }

    const openTime = String(row.openTime || row.time || '');

    return {
      issueNumber,
      number: validNum,
      colour,
      premium,
      openTime,
    };
  }).filter(item => item.issueNumber.length > 0);
}

/**
 * Merge two lists of Wingo items by unique issueNumber, sorted descending
 */
export function mergeWingoItems(
  newItems: WingoDrawItem[],
  existingItems: WingoDrawItem[],
  maxLimit: number = 500
): WingoDrawItem[] {
  const map = new Map<string, WingoDrawItem>();
  for (const item of newItems) {
    if (item && item.issueNumber) {
      map.set(item.issueNumber, item);
    }
  }
  for (const item of existingItems) {
    if (item && item.issueNumber && !map.has(item.issueNumber)) {
      map.set(item.issueNumber, item);
    }
  }
  const merged = Array.from(map.values()).sort((a, b) => {
    if (a.issueNumber.length !== b.issueNumber.length) {
      return b.issueNumber.length - a.issueNumber.length;
    }
    return b.issueNumber.localeCompare(a.issueNumber);
  });
  return merged.slice(0, maxLimit);
}

const clientCacheMap = new Map<WingoMode, { items: WingoDrawItem[]; timestamp: number }>();

/**
 * Primary & Live Wingo History Fetcher supporting 10, 100, and 500 draws across 30s and 1min Modes
 * Ultra-fast response (<10ms) via in-memory server endpoints backed by real upstream APIs
 */
export async function fetch500WingoHistory(
  customProxy?: string,
  forceLatest: boolean = false,
  wingoMode: WingoMode = '30s',
  desiredLimit: number = 500
): Promise<WingoDrawItem[]> {
  const ts = Date.now();
  const cached = clientCacheMap.get(wingoMode);
  const normMode = normalizeModeParam(wingoMode);

  // High-Speed Local Express API endpoints (<2ms response)
  const server500 = `/api/wingo-500?mode=${normMode}&t=${ts}${forceLatest ? '&force=1' : ''}`;
  const server100 = `/api/wingo-100?mode=${normMode}&t=${ts}${forceLatest ? '&force=1' : ''}`;
  const serverHistory = `/api/wingo-history?mode=${normMode}&limit=${desiredLimit}&t=${ts}${forceLatest ? '&force=1' : ''}`;
  const serverFast = `/api/wingo-fast?mode=${normMode}&t=${ts}${forceLatest ? '&force=1' : ''}`;
  const serverModeEndpoint = `/api/wingo-${normMode}?limit=${desiredLimit}&t=${ts}${forceLatest ? '&force=1' : ''}`;

  // Direct external endpoints for fallback
  const direct500 = normMode === '1m' ? `${WINGO_1M_500_API}?t=${ts}` : `${WINGO_30S_500_API}?t=${ts}`;
  const direct100 = normMode === '1m' ? `${WINGO_1M_100_API}?t=${ts}` : `${WINGO_30S_100_API}?t=${ts}`;

  const fetchStrategy = async (url: string, timeout: number, isProxy: boolean = false): Promise<WingoDrawItem[]> => {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeout),
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    let json = await res.json();
    if (isProxy) {
      if (typeof json === 'string') json = JSON.parse(json);
      if (json?.contents && typeof json.contents === 'string') json = JSON.parse(json.contents);
    }
    const parsed = parseWingoItems(json);
    if (parsed.length > 0) return parsed;
    throw new Error('Empty or invalid data');
  };

  const tasks: Promise<WingoDrawItem[]>[] = [];
  const timeout = forceLatest ? 1200 : 2500;

  // Ultra-fast priority: Always race internal endpoints first (<2ms latency)
  if (forceLatest || desiredLimit <= 10) {
    tasks.push(fetchStrategy(serverFast, timeout));
    tasks.push(fetchStrategy(serverModeEndpoint, timeout));
    tasks.push(fetchStrategy(serverHistory, timeout));
    tasks.push(fetchStrategy(direct100, timeout + 500));
  } else if (desiredLimit <= 100) {
    tasks.push(fetchStrategy(server100, timeout));
    tasks.push(fetchStrategy(serverHistory, timeout));
    tasks.push(fetchStrategy(serverModeEndpoint, timeout));
    tasks.push(fetchStrategy(direct100, timeout + 500));
  } else {
    tasks.push(fetchStrategy(server500, timeout));
    tasks.push(fetchStrategy(serverHistory, timeout));
    tasks.push(fetchStrategy(serverModeEndpoint, timeout));
    tasks.push(fetchStrategy(direct500, timeout + 500));
  }

  if (customProxy) {
    const target = desiredLimit <= 100 ? direct100 : direct500;
    const url = customProxy.includes('?') 
      ? `${customProxy}&url=${encodeURIComponent(target)}`
      : `${customProxy}${encodeURIComponent(target)}`;
    tasks.push(fetchStrategy(url, timeout + 800, true));
  }

  try {
    const fetched = await Promise.any(tasks);

    // Merge fetched with existing cached items to prevent losing historical 100/500 depth!
    const existing = cached?.items || [];
    const targetCap = desiredLimit > 100 ? 500 : Math.max(100, desiredLimit);
    const merged = mergeWingoItems(fetched, existing, targetCap);

    clientCacheMap.set(wingoMode, { items: merged, timestamp: Date.now() });
    return merged;
  } catch (err) {
    if (cached && cached.items.length > 0) {
      return cached.items;
    }
    return [];
  }
}

/**
 * Explicit 100 Draw History Fetcher
 */
export async function fetch100WingoHistory(
  customProxy?: string,
  wingoMode: WingoMode = '30s'
): Promise<WingoDrawItem[]> {
  return fetch500WingoHistory(customProxy, false, wingoMode, 100);
}

// Alias for compatibility
export const fetch100kWingoHistory = fetch500WingoHistory;

export async function fetchServerPrediction() {
  try {
    const res = await fetch('/api/predict-live', {
      signal: AbortSignal.timeout(2000),
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return null;
}

export async function fetchServerAnalytics() {
  try {
    const res = await fetch('/api/analytics-500', {
      signal: AbortSignal.timeout(2000),
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return null;
}

export async function fetch100kWingoAnalytics(proxyUrl?: string): Promise<Analysis100kData | null> {
  try {
    const endpoint = proxyUrl ? `${proxyUrl.replace(/\/$/, '')}/api/wingo-100k-analytics` : '/api/wingo-100k-analytics';
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return null;
}

export async function fetch100kWingoDraws(limit = 5000, offset = 0) {
  try {
    const res = await fetch(`/api/wingo-100k-draws?limit=${limit}&offset=${offset}`, {
      signal: AbortSignal.timeout(3000),
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return null;
}

// -------------------------------------------------------------
// 24/7 REAL-TIME BACKGROUND DATA COLLECTOR API
// -------------------------------------------------------------
export async function fetch247CollectorStats(proxyUrl?: string): Promise<Collector247Stats | null> {
  try {
    const endpoint = proxyUrl ? `${proxyUrl.replace(/\/$/, '')}/api/collector/stats` : '/api/collector/stats';
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(3000),
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return null;
}

export async function fetch247CollectorDraws(limit = 500, offset = 0, proxyUrl?: string) {
  try {
    const endpoint = proxyUrl ? `${proxyUrl.replace(/\/$/, '')}/api/collector/draws` : '/api/collector/draws';
    const res = await fetch(`${endpoint}?limit=${limit}&offset=${offset}`, {
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return null;
}

export async function triggerCollectorSync(proxyUrl?: string): Promise<boolean> {
  try {
    const endpoint = proxyUrl ? `${proxyUrl.replace(/\/$/, '')}/api/collector/sync` : '/api/collector/sync';
    const res = await fetch(endpoint, {
      method: 'POST',
      signal: AbortSignal.timeout(6000),
    });
    return res.ok;
  } catch {
    return false;
  }
}


