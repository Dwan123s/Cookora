import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { parse } from 'dotenv';

// Auth is provided by the user's Vercel CLI profile. Values travel over stdin only.
try {
  const project = JSON.parse(readFileSync('.vercel/project.json', 'utf8'));
  if (
    project.projectId !== 'prj_gh2n7NQKr6r89ZsA4udp0XAu7GO4' ||
    project.orgId !== 'team_BwCBnSD4EgG9dYj6rTmKMiIS'
  )
    throw new Error('Unexpected linked Vercel project.');
  const domains = JSON.parse(readFileSync('.review/vercel-project-domains.json', 'utf8')).domains;
  const domain = domains.find((d) => d.name === 'cookora-rose.vercel.app' && d.verified);
  if (!domain) throw new Error('Expected verified production domain.');
  const env = {
    ...parse(readFileSync('.env')),
    ...(existsSync('.env.local') ? parse(readFileSync('.env.local')) : {}),
  };
  const databaseUrl = env.NEON_RUNTIME_DATABASE_URL;
  if (!databaseUrl || new URL(databaseUrl).username !== 'cookora_app' || env.NEON_BRANCH !== 'production')
    throw new Error('Verified production app-role connection is required.');
  const root = join(process.env.LOCALAPPDATA, 'npm-cache', '_npx');
  const cli = readdirSync(root)
    .map((d) => join(root, d, 'node_modules/vercel/dist/index.js'))
    .find((p) => existsSync(p));
  if (!cli) throw new Error('Vercel CLI not available.');
  const origin = `https://${domain.name}`;
  const values = {
    NODE_ENV: 'production',
    DATABASE_PROVIDER: 'postgresql',
    DATABASE_URL: databaseUrl,
    APP_ORIGIN: origin,
    CSRF_SECRET: randomBytes(32).toString('hex'),
    SEED_DEMO: 'false',
    SERVE_FRONTEND: 'false',
    TRUST_PROXY_HOPS: '1',
  };
  if (env.GOOGLE_CLIENT_ID?.trim() && env.GOOGLE_CLIENT_SECRET?.trim()) {
    values.GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
    values.GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
    values.GOOGLE_REDIRECT_URI = `${origin}/api/v1/auth/google/callback`;
  }
  for (const [key, value] of Object.entries(values)) {
    const result = spawnSync(
      process.execPath,
      [
        cli,
        'env',
        'add',
        key,
        '--environment',
        'production',
        '--sensitive',
        '--yes',
        '--force',
        '--scope',
        'dwans-projects-53613816',
      ],
      {
        cwd: resolve('.'),
        input: value,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    );
    if (result.status !== 0 || result.error)
      throw new Error(`Failed to configure ${key}; raw output suppressed to protect secrets.`);
    console.log(`Configured production ${key} (value hidden).`);
  }
  console.log(
    'Only app-role DB/auth configuration sent. Owner URL, migration credentials and paid AI keys were not uploaded.',
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Vercel environment setup failed.');
  process.exitCode = 1;
}
