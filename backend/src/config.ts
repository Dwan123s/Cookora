import { config } from 'dotenv';
import { resolve } from 'node:path';
config({ path: resolve(__dirname, '../../.env.local'), quiet: true });
config({ path: resolve(__dirname, '../../.env'), quiet: true });
config({ quiet: true });
export const production = process.env.NODE_ENV === 'production';
export const databaseProvider = process.env.DATABASE_PROVIDER || 'sqlserver';
if (!['sqlserver', 'postgresql'].includes(databaseProvider)) throw new Error('Unsupported DATABASE_PROVIDER');
export const databaseLabel = databaseProvider === 'postgresql' ? 'PostgreSQL' : 'SQL Server';
export function required(name: string): string {
  const v = process.env[name];
  if (!v || v === 'CHANGE_ME') throw new Error(`Missing configuration: ${name}`);
  return v;
}
export function sqlConfig(admin = false) {
  return {
    server: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 1433),
    database: admin ? 'master' : process.env.DB_NAME || 'Cookora',
    user: admin ? 'sa' : required('DB_USER'),
    password: required(admin ? 'MSSQL_SA_PASSWORD' : 'DB_PASSWORD'),
    options: {
      encrypt: process.env.DB_ENCRYPT !== 'false',
      trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    },
    pool: { min: 0, max: 10 },
    connectionTimeout: 15000,
    requestTimeout: 15000,
  };
}
export const appOrigin = process.env.APP_ORIGIN || 'http://localhost:5173';
export const demoEnabled = !production && process.env.SEED_DEMO === 'true';
