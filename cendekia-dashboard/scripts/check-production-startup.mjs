import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const project = resolve('Backend/Cendekia.WebAPI');
const dll = resolve(project, 'bin/Debug/net8.0/Cendekia.WebAPI.dll');
const valid = {
  ASPNETCORE_ENVIRONMENT: 'Production',
  Jwt__SigningKey: randomBytes(48).toString('base64'),
  AllowedHosts: 'localhost;127.0.0.1',
  ConnectionStrings__DefaultConnection: 'Server=127.0.0.1;Port=33316;User ID=cms_test;Password=test-only;Database=cendekia_cms;',
  Security__DataProtectionKeyPath: resolve('.verify-cms/security-keys'),
};
for (const [override, expected] of [
  [{ Jwt__SigningKey: '' }, /JWT requires/],
  [{ Jwt__SigningKey: 'Cendekia-Local-Development-Jwt-Signing-Key-2026-Change-Me' }, /private production JWT/],
  [{ Jwt__SigningKey: 'a'.repeat(64) }, /private production JWT/],
  [{ AllowedHosts: '*' }, /explicit AllowedHosts/],
  [{ ConnectionStrings__DefaultConnection: 'Server=127.0.0.1;User ID=root;Password=test-only;Database=cendekia_cms;' }, /dedicated database account/],
  [{ Security__DataProtectionKeyPath: '' }, /persistent Security:DataProtectionKeyPath/],
  [{ Cors__AllowedOrigins__0: '*' }, /CORS origins must be explicit/],
  [{ Cors__AllowedOrigins__0: 'http://example.invalid' }, /CORS origins must be explicit/],
]) {
  const result = spawnSync('dotnet', [dll], { cwd: project, env: { ...process.env, ...valid, ...override }, timeout: 15000, encoding: 'utf8', windowsHide: true });
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, expected);
}
console.log('PASS: Production refuses missing/default/weak JWT secrets, wildcard hosts/CORS, HTTP CORS, root database account, and missing persistent CSRF keys.');
