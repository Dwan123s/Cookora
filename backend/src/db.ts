import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { sqlConfig } from './config';
@Injectable()
export class Database extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({ adapter: new PrismaMssql(sqlConfig()) });
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
