import '../src/config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Database } from '../src/db';
import { seedDocumentCatalog } from '../src/document-catalog';

async function seed() {
  if (process.env.NODE_ENV === 'production') throw new Error('Document seed is forbidden in production.');
  const db = new Database();
  try {
    const catalog = JSON.parse(
      readFileSync(resolve(__dirname, '../../database/seeds/document-recipes.json'), 'utf8'),
    );
    console.log(JSON.stringify(await seedDocumentCatalog(db, catalog)));
  } finally {
    await db.$disconnect();
  }
}
seed().catch((error) => {
  console.error('Seed failed:', error.code || error.message);
  process.exitCode = 1;
});
