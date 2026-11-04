import '../src/config';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Database } from '../src/db';
import { DocumentCatalogSchema } from '../src/document-catalog';
import { applySupplementaryImages } from '../src/document-images';

async function main() {
  const root = resolve(__dirname, '../..');
  const catalog = DocumentCatalogSchema.parse(
    JSON.parse(readFileSync(resolve(root, 'database/seeds/document-recipes.json'), 'utf8')),
  );
  for (const recipe of catalog.recipes) {
    for (const image of recipe.images.filter((image) => image.sourceDocument)) {
      const bytes = readFileSync(resolve(root, 'frontend/public', `.${image.path}`));
      if (createHash('sha256').update(bytes).digest('hex') !== image.sha256)
        throw new Error(`Image checksum mismatch: ${recipe.slug}`);
    }
  }
  const db = new Database();
  try {
    const result = await applySupplementaryImages(db, catalog, async (rows) => {
      const directory = resolve(root, '.review/thai-images');
      mkdirSync(directory, { recursive: true });
      const filename = `database-images-before-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      writeFileSync(resolve(directory, filename), JSON.stringify(rows, null, 2), { flag: 'wx' });
    });
    console.log(JSON.stringify(result));
  } finally {
    await db.$disconnect();
  }
}
main().catch(() => {
  console.error(
    'Image import stopped; verify image files, matching recipes and database access. No credentials logged.',
  );
  process.exitCode = 1;
});
