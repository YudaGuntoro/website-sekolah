// Read-only staging smoke load. Explicit opt-in avoids accidental production traffic.
import assert from 'node:assert/strict';
assert.equal(process.env.ALLOW_LOAD_CHECK, '1', 'Set ALLOW_LOAD_CHECK=1 against an approved staging target.');
const base = process.env.CMS_API_URL || 'http://127.0.0.1:5243';
const times = [];
await Promise.all(Array.from({ length: 10 }, async () => {
  for (let i = 0; i < 10; i++) {
    const start = performance.now();
    const response = await fetch(base + '/api/school/contact', { signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 200);
    await response.arrayBuffer(); times.push(performance.now() - start);
  }
}));
times.sort((a, b) => a - b);
console.log(`PASS: 100 read requests, concurrency 10, p95 ${Math.round(times[94])}ms, max ${Math.round(times.at(-1))}ms. This is a staging smoke test, not a capacity guarantee.`);
