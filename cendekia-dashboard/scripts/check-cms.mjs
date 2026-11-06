import assert from 'node:assert/strict';
const api = process.env.CMS_API_URL || 'http://127.0.0.1:5243';
const suffix = Date.now().toString(36);
let token = '', entryId, viewerId;
async function request(path, method = 'GET', body, accessToken = token) {
  const response = await fetch(api + path, { method, headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  return { status: response.status, payload: text ? JSON.parse(text) : null };
}
try {
  assert.equal((await request('/api/cms/dashboard', 'GET', undefined, '')).status, 401);
  const login = await request('/api/auth/login', 'POST', { username: 'admin', password: process.env.CMS_ADMIN_PASSWORD || 'admin123' }, '');
  assert.equal(login.status, 200); token = login.payload.data.access_token;
  assert.ok(token);
  assert.equal((await request('/api/clinic/patients')).status, 404, 'Legacy clinic API must not be registered');
  const dashboard = await request('/api/cms/dashboard');
  assert.equal(dashboard.status, 200);
  assert.ok(dashboard.payload.data.counts.length >= 11);
  const form = { title: 'Verifikasi CMS ' + suffix, slug: 'verifikasi-cms-' + suffix, category: 'Verifikasi', summary: 'Ringkasan pengujian', body: 'Paragraf satu.\n\nParagraf dua.', imageUrl: '', status: 'Draft', publishedAt: null, sortOrder: 99999, version: 0 };
  let response = await request('/api/cms/content/berita', 'POST', form);
  assert.equal(response.status, 201); entryId = response.payload.data.id;
  const adminEntries = await request('/api/cms/content/berita');
  assert.equal(adminEntries.payload.data[0].id, entryId, 'Newest row must come first even with a high sort order');
  const publicEntries = async () => (await request('/api/school/content', 'GET', undefined, '')).payload.data;
  assert.ok(!(await publicEntries()).some(e => e.slug === form.slug), 'Draft leaked to public API');
  assert.equal((await request('/api/cms/content/berita', 'POST', form)).status, 409, 'Duplicate slugs must be rejected');
  form.status = 'Published'; form.version = response.payload.data.version;
  response = await request('/api/cms/content/berita/' + entryId, 'PUT', form);
  assert.equal(response.status, 200);
  assert.ok(response.payload.data.publishedAt.endsWith('Z'), 'CMS dates must include UTC timezone');
  assert.ok((await publicEntries()).some(e => e.slug === form.slug), 'Published entry missing');
  assert.equal((await publicEntries()).find(e => e.collection === 'berita')?.slug, form.slug, 'Latest publication must come first on the website');
  assert.equal((await request('/api/cms/content/berita/' + entryId, 'PUT', form)).status, 409, 'Stale edits must be rejected');
  form.version = response.payload.data.version;
  form.publishedAt = new Date(Date.now() + 86400000).toISOString();
  response = await request('/api/cms/content/berita/' + entryId, 'PUT', form);
  assert.equal(response.status, 200);
  assert.ok(!(await publicEntries()).some(e => e.slug === form.slug), 'Future publication leaked');
  const viewer = await request('/api/users', 'POST', { username: 'verify-' + suffix, full_name: 'Verifikasi Viewer', password: 'Verify-Local-' + suffix, role: 'VIEWER', status: 'ACTIVE' });
  assert.equal(viewer.status, 201); viewerId = viewer.payload.data.id;
  const viewerLogin = await request('/api/auth/login', 'POST', { username: 'verify-' + suffix, password: 'Verify-Local-' + suffix }, '');
  const viewerToken = viewerLogin.payload.data.access_token;
  assert.equal((await request('/api/cms/content/berita', 'GET', undefined, viewerToken)).status, 200);
  assert.equal((await request('/api/cms/content/berita', 'POST', form, viewerToken)).status, 403);
  assert.equal((await request('/api/users', 'GET', undefined, viewerToken)).status, 403);
  assert.equal((await request('/api/cms/content/berita/' + entryId, 'DELETE')).status, 200); entryId = undefined;
  assert.ok(!(await publicEntries()).some(e => e.slug === form.slug), 'Deleted entry returned to public API');
  console.log('PASS: login, authorization, collections, draft/publish/delete, duplicate slugs, concurrent edits, future visibility, viewer restrictions, legacy API disabled.');
} finally {
  if (entryId) await request('/api/cms/content/berita/' + entryId, 'DELETE');
  if (viewerId) await request('/api/users/' + viewerId, 'DELETE');
}
