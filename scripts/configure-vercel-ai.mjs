import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse } from 'dotenv';

// Send only the existing Vertex configuration to the explicitly linked production project.
// Never log key material, put it in CLI arguments, or prefix it with VITE_.
try {
  const project = JSON.parse(readFileSync('.vercel/project.json', 'utf8'));
  if (project.projectId !== 'prj_gh2n7NQKr6r89ZsA4udp0XAu7GO4' ||
      project.orgId !== 'team_BwCBnSD4EgG9dYj6rTmKMiIS')
    throw new Error('Unexpected linked Vercel project.');
  const env = {
    ...parse(readFileSync('.env')),
    ...(existsSync('.env.local') ? parse(readFileSync('.env.local')) : {}),
  };
  const key = env.VERTEX_API_KEY?.trim();
  const model = env.VERTEX_MODEL?.trim();
  if (!key || !model || !/^[a-zA-Z0-9._-]+$/.test(model))
    throw new Error('Existing Vertex API key and model are required.');

  // Verify the existing credentials before changing cloud environment variables.
  const response = await fetch(
    `https://aiplatform.googleapis.com/v1/publishers/google/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      signal: AbortSignal.timeout(45000),
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Reply with only OK.' }] }],
        generationConfig: { maxOutputTokens: 1024 },
      }),
    },
  );
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Vertex credential/model probe failed (HTTP ${response.status}); no cloud keys changed.`);
  }
  const data = await response.json();
  if (!data.candidates?.some((c) => c.content?.parts?.some((p) => !p.thought && p.text)))
    throw new Error('Vertex returned no text; no cloud keys changed.');
  console.log(`PASS: existing Vertex credentials and ${model} return generated text (HTTP 200).`);

  const cache = join(process.env.LOCALAPPDATA, 'npm-cache', '_npx');
  const cli = readdirSync(cache)
    .map((d) => join(cache, d, 'node_modules/vercel/dist/index.js'))
    .find((p) => existsSync(p));
  if (!cli) throw new Error('Installed Vercel CLI not found.');
  for (const [name, value] of Object.entries({
    VERTEX_API_KEY: key,
    VERTEX_MODEL: model,
    VERTEX_LOCATION: env.VERTEX_LOCATION?.trim() || 'global',
  })) {
    const result = spawnSync(process.execPath, [
      cli, 'env', 'add', name, '--environment', 'production', '--sensitive',
      '--yes', '--force', '--scope', 'dwans-projects-53613816',
    ], { cwd: resolve('.'), input: value, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    if (result.status !== 0 || result.error)
      throw new Error(`Failed to configure ${name}; raw output suppressed to protect secrets.`);
    console.log(`Configured production ${name} (value hidden).`);
  }
  console.log('Existing database, session, OAuth and CSRF environment values were not changed. Redeploy to activate AI.');
} catch (error) {
  // Network/SDK error details may contain request metadata; print only known diagnostics.
  const message = error instanceof Error ? error.message : '';
  console.error(/^(Unexpected|Existing|Vertex|Installed|Failed to configure)/.test(message)
    ? message : 'AI configuration failed; credentials and provider response suppressed.');
  process.exitCode = 1;
}
