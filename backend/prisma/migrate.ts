import '../src/config';
import sql from 'mssql';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { required, sqlConfig } from '../src/config';
async function main() {
  const name = process.env.DB_NAME || 'Cookora';
  const user = required('DB_USER');
  if (!/^[A-Za-z][A-Za-z0-9_]{0,60}$/.test(name) || !/^[A-Za-z][A-Za-z0-9_]{0,60}$/.test(user))
    throw new Error('Invalid database/login identifier');
  const pool = await sql.connect(sqlConfig(true));
  try {
    await pool.request().query(`IF DB_ID(N'${name}') IS NULL CREATE DATABASE [${name}];`);
    const password = required('DB_PASSWORD').replace(/'/g, "''");
    await pool
      .request()
      .query(
        `IF NOT EXISTS(SELECT 1 FROM sys.sql_logins WHERE name = N'${user}') CREATE LOGIN [${user}] WITH PASSWORD = N'${password}', CHECK_POLICY = ON;`,
      );
    await pool
      .request()
      .query(
        `USE [${name}]; IF NOT EXISTS(SELECT 1 FROM sys.database_principals WHERE name = N'${user}') CREATE USER [${user}] FOR LOGIN [${user}]; ALTER ROLE db_datareader ADD MEMBER [${user}]; ALTER ROLE db_datawriter ADD MEMBER [${user}];`,
      );
  } finally {
    await pool.close();
  }
  const c = sqlConfig(true);
  const url = `sqlserver://${c.server}:${c.port};database=${name};user=sa;password={${required('MSSQL_SA_PASSWORD')}};encrypt=${c.options.encrypt};trustServerCertificate=${c.options.trustServerCertificate}`;
  const result = spawnSync(
    process.execPath,
    [resolve(__dirname, '../../node_modules/prisma/build/index.js'), 'migrate', 'deploy'],
    { cwd: resolve(__dirname, '..'), env: { ...process.env, DATABASE_URL: url }, stdio: 'inherit' },
  );
  if (result.status !== 0) throw new Error('Migration failed');
}
main().catch(() => {
  console.error(
    'Database initialization/migration failed. Check Docker health and local configuration. Credentials are not logged.',
  );
  process.exitCode = 1;
});
