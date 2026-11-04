import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Database } from '../src/db';
import { applySupplementaryImages } from '../src/document-images';

const catalog = JSON.parse(
  readFileSync(resolve(__dirname, '../../database/seeds/document-recipes.json'), 'utf8'),
);
const thai = catalog.recipes.filter((recipe: any) => recipe.sourceKey === 'thai');
function fixture() {
  const rows = thai.map((recipe: any, i: number) => ({
    id: `recipe-${i}`,
    slug: recipe.slug,
    title: recipe.title,
    cuisine: recipe.cuisine,
    image: '',
    imageCredit: 'No photo',
    instructions: 'Keep original cooking steps',
  }));
  const writes: any[] = [];
  const tx = {
    recipe: {
      findMany: async () => rows,
      updateMany: async ({ where, data }: any) => {
        const row = rows.find((item: any) => item.id === where.id);
        assert.deepEqual(Object.keys(data).sort(), ['image', 'imageCredit']);
        if (!row || row.image !== where.image || row.imageCredit !== where.imageCredit) return { count: 0 };
        Object.assign(row, data);
        writes.push(data);
        return { count: 1 };
      },
    },
  };
  const db = { $transaction: (fn: (value: typeof tx) => unknown) => fn(tx) } as unknown as Database;
  return { rows, writes, db };
}
test('photo import updates only image fields after backup and is repeatable without changing recipe identity', async () => {
  const { rows, writes, db } = fixture();
  let backups = 0;
  const result = await applySupplementaryImages(db, catalog, async (before) => {
    assert.equal(writes.length, 0);
    assert.equal((before as unknown[]).length, 50);
    backups++;
  });
  assert.equal(result.updated, 50);
  assert.equal(backups, 1);
  assert.equal(writes.length, 50);
  assert.ok(
    rows.every(
      (row: any, i: number) => row.id === `recipe-${i}` && row.instructions === 'Keep original cooking steps',
    ),
  );
  const again = await applySupplementaryImages(db, catalog, async () => {
    throw new Error('No backup needed');
  });
  assert.equal(again.updated, 0);
  assert.equal(again.preserved, 50);
});
test('missing matches, existing custom photos or failed backups stop before any database write', async () => {
  for (const condition of ['missing', 'custom', 'backup']) {
    const { rows, writes, db } = fixture();
    if (condition === 'missing') rows.pop();
    if (condition === 'custom') rows[0].image = '/existing-user-photo.webp';
    await assert.rejects(() =>
      applySupplementaryImages(db, catalog, async () => {
        if (condition === 'backup') throw new Error('No backup storage');
      }),
    );
    assert.equal(writes.length, 0);
  }
});
