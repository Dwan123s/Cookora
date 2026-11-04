import '../src/config';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Database } from '../src/db';
import {
  activeDocumentRecipes,
  DocumentCatalogSchema,
  replaceDocumentCatalog,
  snapshotCatalog,
} from '../src/document-catalog';
import { recipeInclude } from '../src/catalog';

async function run() {
  if (process.env.NODE_ENV === 'production')
    throw new Error('This replacement is for the local database only.');
  const root = resolve(__dirname, '../..');
  const manifestBytes = readFileSync(resolve(root, 'database/seeds/document-recipes.json'));
  const source = DocumentCatalogSchema.parse(JSON.parse(manifestBytes.toString('utf8')));
  const active = activeDocumentRecipes(source);
  for (const recipe of active)
    for (const image of recipe.images) {
      const imageFile = resolve(root, 'frontend/public', `.${image.path}`);
      assert.ok(existsSync(imageFile), `Missing image: ${image.path}`);
      assert.equal(createHash('sha256').update(readFileSync(imageFile)).digest('hex'), image.sha256);
    }
  const db = new Database();
  try {
    const before = await snapshotCatalog(db);
    const apply = process.argv.includes('--apply');
    console.log(
      JSON.stringify({
        mode: apply ? 'replace' : 'preview',
        oldRecipes: before.recipes.length,
        newRecipes: active.length,
        sources: source.sources.map((s) => ({
          name: s.name,
          recipes: s.recipeCount,
          missingImages: s.missingImages.length,
        })),
        oldFavorites: before.favorites.length,
        oldMealEntries: before.entries.length,
        oldShoppingLists: before.shoppingLists.length,
      }),
    );
    if (!apply) return;
    const directory = resolve(root, '.review/catalog-backups');
    mkdirSync(directory, { recursive: true });
    const backup = resolve(
      directory,
      `before-document-replacement-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
    );
    const usersBefore = await db.user.count();
    const result = await replaceDocumentCatalog(db, source, async (snapshot) => {
      const contents = JSON.stringify(
        {
          version: 1,
          createdAt: new Date().toISOString(),
          replacementSha256: createHash('sha256').update(manifestBytes).digest('hex'),
          ...snapshot,
        },
        null,
        2,
      );
      writeFileSync(backup, contents, { encoding: 'utf8', flag: 'wx' });
      assert.equal(readFileSync(backup, 'utf8'), contents, 'Backup verification failed');
      writeFileSync(backup + '.sha256', createHash('sha256').update(contents).digest('hex') + '\n', {
        flag: 'wx',
      });
    });
    const actual = await db.recipe.findMany({ include: recipeInclude });
    assert.equal(actual.length, active.length);
    const bySlug = new Map(actual.map((recipe) => [recipe.slug, recipe]));
    for (const recipe of active) {
      const stored = bySlug.get(recipe.slug)!;
      assert.ok(stored, recipe.slug);
      assert.equal(stored.title, recipe.title);
      assert.equal(stored.image, recipe.image);
      assert.equal(stored.baseServings, recipe.baseServings);
      assert.equal(stored.cuisine, recipe.cuisine);
      assert.deepEqual(
        stored.steps.map((step) => step.instruction),
        recipe.steps.map((step) => step.instruction),
      );
      assert.deepEqual(
        stored.lines.map((line) => ({
          name: line.ingredient.name.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim(),
          quantity: line.quantity?.toString() ?? null,
          unit: line.unit,
          note: line.note,
          role: line.role,
        })),
        recipe.ingredients.map((item) => ({
          ...item,
          name: item.name.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim(),
        })),
      );
    }
    assert.equal(await db.user.count(), usersBefore, 'User accounts must be preserved');
    assert.equal(actual.filter((recipe) => !recipe.slug.startsWith('doc-')).length, 0);
    const report = {
      ...result,
      backup,
      accountsPreserved: usersBefore,
      verified: true,
      withImages: active.filter((recipe) => recipe.image).length,
      verifiedAt: new Date().toISOString(),
    };
    writeFileSync(
      resolve(root, '.review/document-catalog-verification.json'),
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify(report));
  } finally {
    await db.$disconnect();
  }
}
run().catch((error) => {
  console.error('Document catalog replacement failed:', error instanceof Error ? error.message : 'unknown');
  process.exitCode = 1;
});
