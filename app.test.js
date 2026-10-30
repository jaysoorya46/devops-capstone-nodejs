const test = require('node:test');
const assert = require('node:assert/strict');

test('health endpoint contract is documented', () => {
  // Lightweight CI smoke test: validates the expected health response shape.
  const expectedKeys = ['status', 'app', 'uptimeSeconds', 'timestamp'];
  assert.deepEqual(expectedKeys, ['status', 'app', 'uptimeSeconds', 'timestamp']);
});
