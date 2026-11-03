import '../src/config';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Database } from '../src/db';
import { production, databaseProvider } from '../src/config';
import { postgresUrl } from '../src/postgres-config';
import { seedDocumentCatalog } from '../src/document-catalog';

async function main() {
  if (databaseProvider !== 'postgresql') throw new Error('Set DATABASE_PROVIDER=postgresql explicitly.');
  const action = process.argv[2];
  if (!['migrate', 'seed', 'status'].includes(action || ''))
    throw new Error('Choose migrate, seed or status.');
  const connection = postgresUrl(
    action === 'migrate' ? process.env.DIRECT_URL : process.env.DATABASE_URL,
    true,
  );
  const host = new URL(connection).hostname;
  if (!host.endsWith('.neon.tech') || (action === 'migrate' && host.includes('-pooler.')))
    throw new Error('Use a Neon direct endpoint for migration and a Neon endpoint for seed/status.');
  if (action === 'migrate') {
    const cli = resolve(__dirname, '../../node_modules/prisma/build/index.js');
    const result = spawnSync(
      process.execPath,
      [cli, 'migrate', 'deploy', '--config', 'prisma.postgres.config.ts'],
      {
        cwd: resolve(__dirname, '..'),
        env: { ...process.env, DIRECT_URL: connection },
        stdio: 'pipe',
        encoding: 'utf8',
      },
    );
    if (result.error || result.status !== 0) {
      const code = `${result.stdout || ''}\n${result.stderr || ''}`.match(/\bP\d{4}\b/)?.[0];
      throw new Error(
        `Neon migration failed${code ? ` (${code})` : ''}; check direct URL, permissions and migration history.`,
      );
    }
    console.log('PostgreSQL migrations applied. SQL Server history and data were not changed.');
    return;
  }
  const db = new Database();
  try {
    if (action === 'seed') {
      if (!production || process.env.ALLOW_CATALOG_IMPORT !== 'true')
        throw new Error('One-off cloud import requires NODE_ENV=production and ALLOW_CATALOG_IMPORT=true.');
      const catalog = JSON.parse(
        readFileSync(resolve(__dirname, '../../database/seeds/document-recipes.json'), 'utf8'),
      );
      console.log(JSON.stringify(await seedDocumentCatalog(db, catalog)));
    } else {
      await db.$queryRaw`SELECT 1 AS ok`;
      console.log(
        JSON.stringify({
          database: 'PostgreSQL',
          totalRecipes: await db.recipe.count(),
          approvedRecipes: await db.recipe.count({ where: { contentStatus: 'APPROVED' } }),
        }),
      );
    }
  } finally {
    await db.$disconnect();
  }
}
main().catch((error: unknown) => {
  // Never print database Error.message: it may contain credentials or SQL.
  const safe =
    error instanceof Error &&
    !('code' in error) &&
    !error.name.startsWith('Prisma') &&
    /^(Set DATABASE_PROVIDER|Choose migrate|Use a Neon|Neon migration failed|Missing PostgreSQL|Invalid PostgreSQL|Cloud PostgreSQL|One-off cloud import)/.test(
      error.message,
    );
  console.error(
    safe
      ? error.message
      : 'Neon database operation failed; check connection, privileges and schema. Credentials are not logged.',
  );
  process.exitCode = 1;
});
