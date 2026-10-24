import fs from 'fs';

// We will read raw prompt patterns
const rawText = fs.readFileSync('raw_patterns.txt', 'utf8');

// Regex to find all "KEY":"VALUE" or "KEY": "VALUE"
const regex = /"([B|S]+)"\s*:\s*"([12])"/g;
let match;
const patternMap = new Map();
let totalMatches = 0;
let conflictCount = 0;

while ((match = regex.exec(rawText)) !== null) {
  totalMatches++;
  const key = match[1];
  const val = match[2];
  if (patternMap.has(key)) {
    const existing = patternMap.get(key);
    if (existing !== val) {
      conflictCount++;
    }
  }
  patternMap.set(key, val);
}

console.log('Total matches found:', totalMatches);
console.log('Unique patterns count:', patternMap.size);
console.log('Conflicts count:', conflictCount);

const byLength = {};
for (const [k, v] of patternMap.entries()) {
  byLength[k.length] = (byLength[k.length] || 0) + 1;
}
console.log('Patterns by length:', byLength);
