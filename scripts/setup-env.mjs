import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
const path = resolve('.env');
if (existsSync(path)) {
  console.log('Existing .env retained.');
  process.exit(0);
}
let text = readFileSync('.env.example', 'utf8');
for (const key of ['DB_PASSWORD', 'MSSQL_SA_PASSWORD', 'CSRF_SECRET']) {
  const value =
    key === 'CSRF_SECRET' ? randomBytes(32).toString('hex') : `Ck!${randomBytes(24).toString('hex')}a9`;
  text = text.replace(`${key}=CHANGE_ME`, `${key}=${value}`);
}
writeFileSync(path, text, { mode: 0o600 });
console.log('Local .env created with random secrets; no credentials printed.');
