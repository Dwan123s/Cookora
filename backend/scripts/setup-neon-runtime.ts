import '../src/config';
import { Pool } from 'pg';
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'dotenv';
import { postgresPool, postgresUrl } from '../src/postgres-config';

// One-off provisioning: owner credentials from `neon deploy` stay separate from runtime app credentials.
async function main() {
  const path = resolve(__dirname, '../../.env');
  const context = JSON.parse(readFileSync(resolve(__dirname, '../../.neon'), 'utf8'));
  const content = readFileSync(path, 'utf8'),
    env = parse(content);
  if (
    context.projectId !== 'polished-bonus-47222343' ||
    context.branch !== 'production' ||
    env.NEON_BRANCH !== 'production'
  )
    throw new Error('Refusing runtime setup outside the explicitly linked production project.');
  const direct = postgresUrl(env.DATABASE_URL_UNPOOLED, true),
    pooled = postgresUrl(env.DATABASE_URL, true);
  const ownerUrl = new URL(direct),
    poolUrl = new URL(pooled);
  if (
    !ownerUrl.hostname.endsWith('.neon.tech') ||
    ownerUrl.hostname.includes('-pooler') ||
    poolUrl.hostname.replace('-pooler.', '.') !== ownerUrl.hostname ||
    poolUrl.pathname !== ownerUrl.pathname
  )
    throw new Error('Neon pooled/direct endpoints do not match.');
  const owner = new Pool(postgresPool(direct, true));
  let runtimeUrl: string;
  try {
    const existing = await owner.query("SELECT 1 FROM pg_roles WHERE rolname = 'cookora_app'");
    if (existing.rowCount) {
      const saved = new URL(postgresUrl(env.NEON_RUNTIME_DATABASE_URL, true));
      if (
        saved.username !== 'cookora_app' ||
        saved.hostname !== poolUrl.hostname ||
        saved.pathname !== poolUrl.pathname
      )
        throw new Error('Existing runtime role needs its matching saved credential; no password was reset.');
      runtimeUrl = saved.toString();
    } else {
      const password = randomBytes(32).toString('base64url');
      await owner.query(`CREATE ROLE cookora_app LOGIN PASSWORD '${password}'`);
      poolUrl.username = 'cookora_app';
      poolUrl.password = password;
      poolUrl.searchParams.set('sslmode', 'verify-full');
      runtimeUrl = poolUrl.toString();
      // Persist immediately so a later grant/network error never loses a newly created password.
      writeFileSync(path, updateEnv(content, 'NEON_RUNTIME_DATABASE_URL', runtimeUrl), { mode: 0o600 });
    }
    const database = decodeURIComponent(ownerUrl.pathname.slice(1)).replace(/"/g, '""');
    await owner.query(`GRANT CONNECT ON DATABASE "${database}" TO cookora_app`);
    await owner.query('GRANT USAGE ON SCHEMA public TO cookora_app');
    await owner.query('REVOKE CREATE ON SCHEMA public FROM PUBLIC');
    await owner.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
      public."User", public."GoogleIdentity", public."Session", public."Ingredient", public."Recipe",
      public."RecipeLine", public."RecipeStep", public."Favorite", public."MealPlan", public."MealEntry",
      public."ShoppingList", public."ShoppingItem" TO cookora_app`);
  } finally {
    await owner.end();
  }
  const app = new Pool(postgresPool(runtimeUrl!, true));
  try {
    const result = await app.query(
      "SELECT current_user, has_schema_privilege(current_user, 'public', 'CREATE') AS can_create",
    );
    if (result.rows[0].current_user !== 'cookora_app' || result.rows[0].can_create)
      throw new Error('Runtime role privilege verification failed.');
  } finally {
    await app.end();
  }
  const latest = readFileSync(path, 'utf8');
  writeFileSync(
    path,
    updateEnv(updateEnv(latest, 'NEON_RUNTIME_DATABASE_URL', runtimeUrl!), 'DATABASE_PROVIDER', 'postgresql'),
    { mode: 0o600 },
  );
  console.log(
    'Neon runtime connected as cookora_app; read/write grants verified; schema CREATE denied. Credentials saved without printing.',
  );
}
function updateEnv(text: string, key: string, value: string) {
  const line = `${key}=${JSON.stringify(value)}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  return pattern.test(text) ? text.replace(pattern, () => line) : `${text.replace(/\s*$/, '')}\n${line}\n`;
}
main().catch(() => {
  console.error(
    'Neon runtime setup failed; check linked project, migrations and saved runtime credential. No secret was printed.',
  );
  process.exitCode = 1;
});
