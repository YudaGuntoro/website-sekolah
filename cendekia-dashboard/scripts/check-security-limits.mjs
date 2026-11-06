// Run against a separate local API configured with LoginPerMinute=2 and RegistrationsPerMinute=2.
import assert from 'node:assert/strict';
const base = process.env.SECURITY_LIMITS_API_URL || 'http://127.0.0.1:5245';
for (const path of ['/api/auth/login', '/api/spmb/applications']) {
  const statuses = [];
  for (let i = 0; i < 3; i++) {
    const lmp = i === 2 && path.includes('/spmb/');
    const response = await fetch(base + (lmp ? '/api/lmp/applications' : path), { method: 'POST', headers: lmp ? {} : { 'Content-Type': 'application/json' }, body: lmp ? new FormData() : '{}' });
    statuses.push(response.status);
    if (i === 2) {
      assert.equal(response.status, 429, path);
      assert.ok(response.headers.get('retry-after'));
      assert.equal((await response.json()).statusCode, 429);
    }
  }
  assert.notEqual(statuses[0], 429, path);
}
console.log('PASS: login and both registration endpoints return HTTP 429 with Retry-After when limits are reached.');
