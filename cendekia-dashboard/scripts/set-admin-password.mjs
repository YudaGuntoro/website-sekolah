// Explicit operator command; never prints the password or hash.
import assert from 'node:assert/strict';
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { mysql } from './lib/local-mysql.mjs';
const password = process.env.CMS_NEW_ADMIN_PASSWORD;
assert(password && password.length >= 12 && password.length <= 128 && password !== 'admin123', 'Set CMS_NEW_ADMIN_PASSWORD to a unique password of 12-128 characters.');
assert(process.env.ConnectionStrings__DefaultConnection, 'Set ConnectionStrings__DefaultConnection explicitly.');
const username = process.env.CMS_ADMIN_USERNAME || 'admin';
const salt = randomBytes(16);
const hash = 'pbkdf2-sha256$600000$' + pbkdf2Sync(password, salt, 600000, 32, 'sha256').toString('base64');
const literal = text => `_utf8mb4 0x${Buffer.from(text, 'utf8').toString('hex')}`;
const result = mysql(`START TRANSACTION;
UPDATE users SET password_salt=${literal(salt.toString('base64'))},password_hash=${literal(hash)},updated_at=UTC_TIMESTAMP() WHERE username=${literal(username)} AND role='ADMIN';
SELECT ROW_COUNT();
DELETE s FROM auth_sessions s JOIN users u ON u.id=s.UserId WHERE u.username=${literal(username)} AND u.role='ADMIN';
COMMIT;`);
assert.equal(result.status, 0, `Password update failed (MySQL ${result.stderr?.match(/ERROR (\d+)/)?.[1] || 'unavailable'}); check database access and auth_sessions migration.`);
assert.equal(result.stdout.trim(), '1', 'No matching administrator was updated.');
console.log('Administrator password changed; existing sessions revoked.');
