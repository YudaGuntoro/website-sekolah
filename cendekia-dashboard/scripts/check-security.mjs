// Local integration checks. Creates and removes only its own synthetic account.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const base = process.env.CMS_API_URL || 'http://127.0.0.1:5243';
const jar = new Map();
let admin, userId;
async function request(path, { method = 'GET', body, token, cookies = true, csrf } = {}) {
  const response = await fetch(base + path, {
    method, headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookies && jar.size ? { Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; ') } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
    }, body: body ? JSON.stringify(body) : undefined,
  });
  for (const cookie of response.headers.getSetCookie()) {
    const [key, ...value] = cookie.split(';')[0].split('=');
    if (value.join('=')) jar.set(key, value.join('=')); else jar.delete(key);
  }
  const payload = await response.json().catch(() => null);
  return { response, status: response.status, data: payload?.data, payload };
}
const credentials = { username: 'admin', password: process.env.CMS_ADMIN_PASSWORD || 'admin123' };
try {
  assert.equal((await request('/health/live')).status, 200);
  assert.equal((await request('/health/ready')).status, 200);
  const origin = await fetch(base + '/api/school/contact', { headers: { Origin: 'https://untrusted.example' } });
  assert.equal(origin.headers.get('access-control-allow-origin'), null);
  assert.equal(origin.headers.get('x-content-type-options'), 'nosniff');
  assert.equal((await request('/api/auth/session', { method: 'POST', body: credentials })).status, 403);
  const anonCsrf = (await request('/api/auth/csrf')).data.token;
  const login = await request('/api/auth/session', { method: 'POST', body: credentials, csrf: anonCsrf });
  assert.equal(login.status, 200);
  assert.equal(login.data.access_token, undefined, 'Browser login must never return a bearer token');
  const authCookie = login.response.headers.getSetCookie().find(x => x.startsWith('cendekia_session='));
  assert.match(authCookie, /httponly/i); assert.match(authCookie, /samesite=strict/i); assert.match(authCookie, /path=\/api/i);
  assert.equal((await request('/api/auth/session')).data.user.username, 'admin');
  const replay = jar.get('cendekia_session');
  assert.equal((await request('/api/auth/logout', { method: 'POST' })).status, 403);
  assert.equal((await request('/api/auth/logout', { method: 'POST', csrf: 'invalid' })).status, 403);
  const csrf = (await request('/api/auth/csrf')).data.token;
  assert.equal((await request('/api/auth/logout', { method: 'POST', csrf })).status, 200);
  assert.equal((await request('/api/cms/dashboard', { token: replay, cookies: false })).status, 401, 'Revoked session replay succeeded');
  assert.equal((await request('/api/auth/session')).status, 401);
  const bad = await request('/api/auth/login', { method: 'POST', cookies: false, body: { username: 'does-not-exist', password: 'invalid' } });
  assert.equal(bad.status, 401); assert(!JSON.stringify(bad.payload).includes('Exception'));
  const bearer = await request('/api/auth/login', { method: 'POST', cookies: false, body: credentials });
  assert.equal(bearer.status, 200); admin = bearer.data.access_token;
  const name = 'SECURITY-' + randomUUID();
  const form = { username: name, full_name: name, password: randomUUID(), role: 'VIEWER', status: 'ACTIVE' };
  const created = await request('/api/users', { method: 'POST', token: admin, cookies: false, body: form });
  assert.equal(created.status, 201); userId = created.data.id;
  const user = await request('/api/auth/login', { method: 'POST', cookies: false, body: { username: name, password: form.password } });
  assert.equal(user.status, 200);
  assert.equal((await request('/api/cms/dashboard', { token: user.data.access_token, cookies: false })).status, 200);
  assert.equal((await request('/api/users/' + userId, { method: 'PUT', token: admin, cookies: false, body: { ...form, status: 'INACTIVE' } })).status, 200);
  assert.equal((await request('/api/cms/dashboard', { token: user.data.access_token, cookies: false })).status, 401);
  assert.equal((await request('/api/users/' + userId, { method: 'PUT', token: admin, cookies: false, body: form })).status, 200);
  assert.equal((await request('/api/cms/dashboard', { token: user.data.access_token, cookies: false })).status, 401, 'Reactivating a user must not revive a revoked token');
  console.log('PASS: HttpOnly browser session, no token in login JSON, CSRF, logout replay rejection, account/session revocation, denied CORS, health endpoints and security headers.');
} finally {
  if (userId && admin) assert.equal((await request('/api/users/' + userId, { method: 'DELETE', token: admin, cookies: false })).status, 200);
  if (admin) await request('/api/auth/logout', { method: 'POST', token: admin, cookies: false });
}
