import assert from 'node:assert/strict';
import { getServer2Prediction } from '../src/services/server2AdvancedEngine';

const expected = [
  ['BIG', 1], ['SMALL', 7], ['SMALL', 6], ['BIG', 3], ['SMALL', 8],
  ['BIG', 1], ['BIG', 2], ['SMALL', 9], ['SMALL', 8], ['BIG', 2],
] as const;
for (let digit = 0; digit < 10; digit += 1) {
  assert.deepEqual(getServer2Prediction(digit), { size: expected[digit][0], number: expected[digit][1] });
}
assert.throws(() => getServer2Prediction(undefined), /Invalid Server 2 result digit/);
assert.throws(() => getServer2Prediction(10), /Invalid Server 2 result digit/);
console.log('Server 2 mapping tests passed: all 10 digits and invalid input cases.');
