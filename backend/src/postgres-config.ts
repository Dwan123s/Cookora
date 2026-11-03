// Kept independent of dotenv so migration and isolated tests share the same URL validation.
export function postgresUrl(value: string | undefined, production: boolean): string {
  if (!value || value.includes('REPLACE_') || value === 'CHANGE_ME')
    throw new Error('Missing PostgreSQL connection URL');
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Invalid PostgreSQL connection URL');
  }
  if (
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    !url.hostname ||
    !url.username ||
    !url.password ||
    url.pathname.length < 2
  )
    throw new Error('Invalid PostgreSQL connection URL');
  if (production && !['require', 'verify-full'].includes(url.searchParams.get('sslmode') || ''))
    throw new Error('Cloud PostgreSQL requires sslmode=require or verify-full');
  if (
    !production &&
    url.searchParams.get('sslmode') === 'disable' &&
    !['localhost', '127.0.0.1', '[::1]', '::1'].includes(url.hostname)
  )
    throw new Error('Unencrypted PostgreSQL is allowed only on loopback');
  return value;
}

export function postgresPool(value: string | undefined, production: boolean) {
  const url = new URL(postgresUrl(value, production));
  const mode = url.searchParams.get('sslmode');
  const loopback = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(url.hostname);
  const tls = production || ['require', 'verify-full'].includes(mode || '') || !loopback;
  // node-postgres URL options can replace `ssl`; strip them before explicitly enforcing TLS verification.
  for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'ssl', 'uselibpqcompat'])
    url.searchParams.delete(key);
  return {
    connectionString: url.toString(),
    ssl: tls ? { rejectUnauthorized: true } : false,
    enableChannelBinding: true,
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 20000,
  };
}
