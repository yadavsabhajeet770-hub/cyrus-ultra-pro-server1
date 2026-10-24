import assert from 'node:assert/strict';
import { calculateTimeCadence, runAdaptiveServer1 } from '../src/services/adaptivePatternEngine';
import type { WingoDrawItem } from '../src/types';

const draws: WingoDrawItem[] = Array.from({ length: 80 }, (_, i) => ({
  issueNumber: String(2026102401000 - i),
  number: (i * 7 + 3) % 10,
}));
const period = '2026102401081';
const cadenceA = calculateTimeCadence(period);
const cadenceB = calculateTimeCadence(period);
assert.deepEqual(cadenceA, cadenceB, 'same period must always produce identical cadence');
const predictionA = runAdaptiveServer1(draws, period, 0);
const predictionB = runAdaptiveServer1(draws, period, 0);
assert.deepEqual(predictionA, predictionB, 'same draws, period and loss state must produce an identical Server 1 prediction');
console.log('Server 1 stability test passed: period cadence and prediction are repeatable.');
