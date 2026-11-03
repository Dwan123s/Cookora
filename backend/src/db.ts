import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaPg } from '@prisma/adapter-pg';
import { databaseProvider, production, sqlConfig } from './config';
import { postgresPool } from './postgres-config';
// The two generated clients have identical application models and separate native SQL mappings/history.
// Keep SQL Server's existing API types while selecting the matching runtime engine explicitly.
const RuntimeClient: typeof PrismaClient =
  databaseProvider === 'postgresql' ? require('../generated/postgres').PrismaClient : PrismaClient;
@Injectable()
export class Database extends RuntimeClient implements OnModuleDestroy {
  constructor() {
    super({
      adapter:
        databaseProvider === 'postgresql'
          ? new PrismaPg(postgresPool(process.env.DATABASE_URL, production))
          : new PrismaMssql(sqlConfig()),
    });
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
