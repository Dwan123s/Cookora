import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { databaseProvider, production, sqlConfig } from './config';
import { postgresPool } from './postgres-config';
// The two generated clients have identical application models and separate native SQL mappings/history.
// Keep SQL Server's existing API types while selecting the matching runtime engine explicitly.
const RuntimeClient: typeof PrismaClient =
  databaseProvider === 'postgresql' ? require('../generated/postgres').PrismaClient : PrismaClient;
function adapter() {
  if (databaseProvider !== 'postgresql') return new PrismaMssql(sqlConfig());
  const pool = new Pool(
    postgresPool(process.env.NEON_RUNTIME_DATABASE_URL || process.env.DATABASE_URL, production),
  );
  if (process.env.VERCEL) attachDatabasePool(pool);
  return new PrismaPg(pool, { disposeExternalPool: true });
}
@Injectable()
export class Database extends RuntimeClient implements OnModuleDestroy {
  constructor() {
    super({ adapter: adapter() });
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
