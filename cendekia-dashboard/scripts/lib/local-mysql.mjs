import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
export function mysql(sql) {
  const connection = process.env.ConnectionStrings__DefaultConnection || JSON.parse(readFileSync('Backend/Cendekia.WebAPI/appsettings.Development.json', 'utf8')).ConnectionStrings.DefaultConnection;
  const parts = Object.fromEntries(connection.split(';').filter(Boolean).map(s => { const i = s.indexOf('='); return [s.slice(0, i), s.slice(i+1)]; }));
  if (parts.Database !== 'cendekia_cms') throw new Error('Local checks only support cendekia_cms.');
  return spawnSync(process.env.MYSQL_EXE || 'C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe', [
    `--host=${parts.Server}`, `--port=${parts.Port}`, `--user=${parts['User ID']}`, '--default-character-set=utf8mb4', '--batch', '--skip-column-names', '--database=cendekia_cms'
  ], { input: sql, env: { ...process.env, MYSQL_PWD: parts.Password, CMS_NEW_ADMIN_PASSWORD: '' }, encoding: 'utf8', windowsHide: true });
}
