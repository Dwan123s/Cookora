import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import type { Database } from '../src/db';
import {
  catalogRows,
  DocumentCatalogSchema,
  replaceDocumentCatalog,
  seedDocumentCatalog,
} from '../src/document-catalog';

const root = resolve(__dirname, '../..');
const raw = JSON.parse(readFileSync(resolve(root, 'database/seeds/document-recipes.json'), 'utf8'));
const source = DocumentCatalogSchema.parse(raw);

test('419 document recipes retain 365 original images and 50 supplementary Thai photos', () => {
  assert.deepEqual(
    source.sources.map((s) => [s.key, s.recipeCount, s.missingImages.length]),
    [
      ['viet', 169, 0],
      ['han', 50, 2],
      ['nhat', 37, 1],
      ['trung', 63, 0],
      ['thai', 50, 0],
      ['menu', 50, 1],
    ],
  );
  assert.equal(source.recipes.length, 419);
  assert.equal(source.recipes.filter((r) => r.image).length, 415);
  assert.equal(source.recipes.flatMap((r) => r.images).filter((image) => !image.sourceDocument).length, 365);
  for (const recipe of source.recipes) {
    const original = raw.recipes.find((r: any) => r.slug === recipe.slug);
    for (const image of recipe.images) {
      if (image.sourceDocument) {
        assert.equal(recipe.sourceKey, 'thai');
        assert.equal(image.sourceSlide, recipe.sourceOrdinal);
        assert.ok(image.sourceAsset.startsWith('ppt/media/'));
        assert.ok(source.imageSupplements?.some((item) => item.name === image.sourceDocument));
      } else
        assert.ok(
          original.sourceParagraphs.some((p: any) => p.images.length),
          recipe.slug,
        );
      const file = readFileSync(resolve(root, 'frontend/public', `.${image.path}`));
      assert.equal(createHash('sha256').update(file).digest('hex'), image.sha256, recipe.slug);
    }
    for (const step of recipe.steps) {
      assert.ok(
        original.sourceParagraphs.some((p: any) => p.text.includes(step.instruction)),
        recipe.slug,
      );
      assert.ok(!/^(Từ các món tiếp theo|làm thêm 50|T sẽ bổ sung|Các món được chia)/.test(step.instruction));
    }
    assert.ok(
      recipe.ingredients.every((i) => recipe.rawIngredients.includes(i.note)),
      recipe.slug,
    );
  }
  const curry = source.recipes.find((r) => r.title.includes('Cơm cà ri Nhật Bản'))!;
  assert.equal(curry.baseServings, 2);
  assert.ok(curry.image.includes('doc-nhat-004-'));
  assert.ok(
    source.recipes.filter((r) => r.sourceKey === 'thai').every((r) => r.image && r.totalMinutes === null),
  );
});

test('document ingredient rows preserve exact decimals, ranges as unknown, and source instructions', () => {
  const rows = catalogRows(source);
  const butter = source.recipes.find((r) => r.slug.startsWith('doc-menu-001-'))!;
  assert.equal(butter.ingredients.find((i) => i.name === 'bơ')?.quantity, '0.5');
  const thai = source.recipes.find((r) => r.sourceKey === 'thai')!;
  assert.equal(thai.ingredients.find((i) => i.name === 'ớt')?.quantity, null);
  assert.equal(thai.ingredients.find((i) => i.name === 'dầu hào')?.quantity, '7.5');
  assert.equal(rows.recipes.length, 419);
  assert.ok(rows.recipes.every((r) => r.contentStatus === 'DRAFT' && r.timingStatus === 'ESTIMATED'));
  assert.ok(rows.lines.every((line) => line.quantity === null || Number(line.quantity) > 0));
  const ids = new Set(rows.recipes.map((recipe) => recipe.id));
  assert.ok(rows.steps.every((step) => ids.has(step.recipeId)));
  assert.equal(
    rows.steps.length,
    source.recipes.reduce((sum, recipe) => sum + recipe.steps.length, 0),
  );
});

function fakeDatabase() {
  const calls: string[] = [];
  const records: Record<string, any[]> = {
    recipe: [{ id: 'old-recipe', slug: 'old-recipe' }],
    ingredient: [{ id: 'old-ingredient' }],
    recipeLine: [],
    recipeStep: [],
    favorite: [],
    mealEntry: [{ planId: 'existing-plan' }],
    mealPlan: [{ id: 'existing-plan', version: 2 }],
    shoppingList: [],
    shoppingItem: [],
  };
  const tx: any = {};
  for (const name of Object.keys(records))
    tx[name] = {
      findMany: async () => records[name],
      deleteMany: async () => {
        calls.push(`delete:${name}`);
        records[name] = [];
      },
      createMany: async ({ data }: { data: any[] }) => {
        calls.push(`create:${name}`);
        records[name].push(...data);
      },
      count: async () => records[name].length,
      updateMany: async () => {
        calls.push(`update:${name}`);
      },
    };
  return {
    db: {
      $transaction: async (fn: (tx: any) => Promise<unknown>, options: any) => {
        assert.equal(options.isolationLevel, 'Serializable');
        return fn(tx);
      },
    } as unknown as Database,
    calls,
    records,
  };
}

test('replacement refuses invalid input or a failed backup before touching the old catalog', async () => {
  const { db, calls } = fakeDatabase();
  const invalid = structuredClone(source);
  invalid.recipes[1].slug = invalid.recipes[0].slug;
  await assert.rejects(replaceDocumentCatalog(db, invalid, async () => {}));
  assert.deepEqual(calls, []);
  await assert.rejects(
    replaceDocumentCatalog(db, source, async (snapshot) => {
      assert.equal(snapshot.recipes[0].slug, 'old-recipe');
      throw new Error('Backup write failed');
    }),
    /Backup write failed/,
  );
  assert.deepEqual(calls, []);
});

test('replacement clears old recipe links in FK order and repeated seeds never resurrect legacy data', async () => {
  const { db, calls, records } = fakeDatabase();
  const result = await replaceDocumentCatalog(db, source, async () => {
    calls.push('backup');
  });
  assert.equal(result.removed, 1);
  assert.equal(result.created, 419);
  assert.deepEqual(calls.slice(0, 9), [
    'backup',
    'delete:shoppingItem',
    'delete:shoppingList',
    'delete:mealEntry',
    'delete:favorite',
    'delete:recipeStep',
    'delete:recipeLine',
    'delete:recipe',
    'delete:ingredient',
  ]);
  assert.ok(calls.includes('update:mealPlan'));
  assert.ok(records.recipe.every((recipe) => recipe.slug.startsWith('doc-')));
  const count = calls.length;
  assert.deepEqual(await seedDocumentCatalog(db, source), { created: 0, preserved: 419 });
  assert.equal(calls.length, count);
});
