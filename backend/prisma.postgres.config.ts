import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma-postgres/schema.prisma',
  migrations: { path: 'prisma-postgres/migrations' },
  datasource: {
    // DIRECT_URL is migration-only; runtime uses DATABASE_URL (pooled endpoint on Neon).
    url:
      process.env.DIRECT_URL ||
      process.env.DATABASE_URL ||
      'postgresql://unused:unused@localhost:5432/unused',
  },
});
