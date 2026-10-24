const fs = require('fs');
const file = 'src/services/api.ts';
let code = fs.readFileSync(file, 'utf8');

const replacement = `export async function fetch500WingoHistory(
  customProxy?: string,
  forceLatest: boolean = false,
  wingoMode: WingoMode = '30s'
): Promise<WingoDrawItem[]> {
  const ts = Date.now();
  
  // Fast APIs (10 data) for immediate result fetching (forceLatest)
  const fast30sUrl = \`https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=\${ts}\`;
  const fast1mUrl = \`https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?ts=\${ts}\`;
  
  // Deep APIs (100 / 500 data) for full analysis
  const direct30sUrl = \`\${WINGO_30S_API}?t=\${ts}\`;
  const direct1mUrl = \`\${PRIMARY_500_API}?t=\${ts}\`;
  
  // Choose target URL based on whether we need fast top results or deep history
  const targetUrl = forceLatest 
    ? (wingoMode === '30s' ? fast30sUrl : fast1mUrl)
    : (wingoMode === '30s' ? direct30sUrl : direct1mUrl);

  const serverUrl = wingoMode === '30s'
    ? (forceLatest ? \`/api/wingo-30s?force=1&t=\${ts}\` : \`/api/wingo-30s?t=\${ts}\`)
    : (forceLatest ? \`/api/wingo-500?force=1&t=\${ts}\` : \`/api/wingo-500?t=\${ts}\`);
    
  const fallbackTarget = wingoMode === '30s' 
    ? (forceLatest ? fast30sUrl : direct30sUrl) 
    : (forceLatest ? fast1mUrl : direct1mUrl);

  const fetchStrategy = async (url: string, timeout: number, isProxy: boolean = false): Promise<WingoDrawItem[]> => {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeout),
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Fetch failed');
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
  const baseTimeout = forceLatest ? 1800 : 2500;
  
  tasks.push(fetchStrategy(targetUrl, baseTimeout));
  tasks.push(fetchStrategy(serverUrl, baseTimeout));
  
  if (customProxy) {
    const url = customProxy.includes('?') 
      ? \`\${customProxy}&url=\${encodeURIComponent(targetUrl)}\`
      : \`\${customProxy}\${encodeURIComponent(targetUrl)}\`;
    tasks.push(fetchStrategy(url, baseTimeout + 500, true));
  }
  
  tasks.push(fetchStrategy(\`https://api.allorigins.win/raw?url=\${encodeURIComponent(targetUrl)}\`, baseTimeout, true));
  tasks.push(fetchStrategy(\`https://corsproxy.io/?url=\${encodeURIComponent(targetUrl)}\`, baseTimeout, true));
  tasks.push(fetchStrategy(fallbackTarget, baseTimeout));

  try {
    const parsed = await Promise.any(tasks);
    
    // For deep mode, if we accidentally get small arrays, we still accept them, 
    // but caching helps us combine or fallback safely.
    clientCacheMap.set(wingoMode, { items: parsed, timestamp: Date.now() });
    return parsed;
  } catch (err) {
    const cached = clientCacheMap.get(wingoMode);
    if (cached && cached.items.length > 0) return cached.items;
    return [];
  }
}`;

code = code.replace(/export async function fetch500WingoHistory\([\s\S]*?return \[\];\n  \}\n\}/, replacement);
fs.writeFileSync(file, code);
