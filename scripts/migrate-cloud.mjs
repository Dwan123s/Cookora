import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Run explicitly with --env-file=.env.azure-migrate; never bootstrap a database or use local SA.
function required(name) {
  const value = process.env[name];
  if (!value || value.includes('CHANGE_ME') || value.includes('REPLACE_')) throw new Error(`Missing ${name}`);
  return value;
}

try {
  const host = required('MIGRATION_DB_HOST');
  const database = required('MIGRATION_DB_NAME');
  const user = required('MIGRATION_DB_USER');
  const password = required('MIGRATION_DB_PASSWORD');
  if (!/^[a-z0-9-]+\.database\.windows\.net$/i.test(host))
    throw new Error('Expected the Azure SQL logical-server FQDN.');
  if (!/^[A-Za-z][A-Za-z0-9_]{0,60}$/.test(database) || !/^[A-Za-z][A-Za-z0-9_]{0,60}$/.test(user))
    throw new Error('Invalid database or contained-user name.');
  if (/[{}\r\n]/.test(password) || password.length < 32)
    throw new Error('Use a random password of at least 32 characters without braces or line breaks.');
  const root = fileURLToPath(new URL('../', import.meta.url));
  const cli = fileURLToPath(new URL('../node_modules/prisma/build/index.js', import.meta.url));
  const url = `sqlserver://${host}:1433;database=${database};user=${user};password={${password}};encrypt=true;trustServerCertificate=false;connectTimeout=60`;
  const result = spawnSync(
    process.execPath,
    [cli, 'migrate', 'deploy', '--config', 'backend/prisma.config.ts'],
    {
      cwd: root,
      env: { ...process.env, DATABASE_URL: url },
      stdio: 'pipe',
      encoding: 'utf8',
    },
  );
  // Prisma may include a connection string in diagnostics. Do not echo raw subprocess output.
  if (result.error || result.status !== 0) {
    const code = `${result.stdout || ''}\n${result.stderr || ''}`.match(/\bP\d{4}\b/)?.[0];
    throw new Error(
      `Cloud migration failed${code ? ` (${code})` : ''}; check firewall, TLS, permissions and migration history.`,
    );
  }
  console.log('Committed Prisma migrations applied to the configured Azure SQL database.');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Cloud migration failed.');
  process.exitCode = 1;
}
