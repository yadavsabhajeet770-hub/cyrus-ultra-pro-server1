const fs = require('fs');
const file = 'src/components/SettingsPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "name: 'Server 1: NY ULTRA™'",
  "name: 'Server 1: EAGLE 30S'"
).replace(
  "desc: 'Dual Size & Color Matrix (BIG / SMALL / RED / GREEN) + Max-1 Loss Shield + Dual Sure Numbers'",
  "desc: 'Offline Resilient & Fast Sync Engine + Max-1 Loss Shield + Dual Sure Numbers'"
).replace(
  "tag: 'NY ULTRA™ HYBRID MATRIX'",
  "tag: 'OTC V1-HACK EAGLE'"
).replace(
  "name: 'Server 2: NY POWER™'",
  "name: 'Server 2: EAGLE HASH™'"
).replace(
  "desc: 'High-Precision Draw Digit Matrix + Dynamic E2 Anti-Loss Protection'",
  "desc: 'Advanced Hash-Secured Eagle Engine + Enhanced Volatility Protection'"
).replace(
  "tag: 'NY POWER™ MATRIX'",
  "tag: 'EAGLE PRO HASH'"
);

fs.writeFileSync(file, code);
