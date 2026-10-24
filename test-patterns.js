require('ts-node').register();
const { WINGO_MASTER_PATTERNS } = require('./src/services/wingoPatternEngine.ts');
console.log(WINGO_MASTER_PATTERNS.length);
