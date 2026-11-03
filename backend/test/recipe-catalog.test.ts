import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Recipe } from '@cookora/contracts';
import { discoveryRecipe, loadRecipeCatalog } from '../../frontend/src/recipe-catalog';

test('SQL catalog loads every page, including recipes past the first fifty', async () => {
  const records = Array.from({ length: 107 }, (_, index) => ({
    id: `recipe-${index}`,
    cuisine: index < 50 ? 'TH' : 'VN',
  })) as Recipe[];
  const paths: string[] = [];
  const result = await loadRecipeCatalog(async (path) => {
    paths.push(path);
    const url = new URL(path, 'http://test');
    assert.equal(url.searchParams.get('pageSize'), '50');
    const page = Number(url.searchParams.get('page'));
    return {
      data: records.slice((page - 1) * 50, page * 50),
      meta: { requestId: 'test', pagination: { totalPages: 3 } },
    };
  });
  assert.equal(paths.length, 3);
  assert.deepEqual(result, records);
  assert.equal(result.filter((recipe) => recipe.cuisine === 'TH').length, 50);
});

test('empty SQL catalogs and failed pages never substitute the static 50-recipe list', async () => {
  assert.deepEqual(
    await loadRecipeCatalog(async () => ({
      data: [],
      meta: { requestId: 'empty', pagination: { totalPages: 0 } },
    })),
    [],
  );
  await assert.rejects(
    loadRecipeCatalog(async () => {
      throw new Error('API offline');
    }),
    /API offline/,
  );
  await assert.rejects(
    loadRecipeCatalog(async (path) => {
      if (path.endsWith('page=2')) throw new Error('Second page failed');
      return {
        data: [{ id: 'first' }] as Recipe[],
        meta: { requestId: 'first', pagination: { totalPages: 2 } },
      };
    }),
    /Second page failed/,
  );
});

test('discovery mapping reflects refreshed SQL data and retains unknown source values', () => {
  const stored = {
    id: 'actual-id',
    slug: 'actual-slug',
    title: 'Món SQL',
    cuisine: 'TH',
    image: '',
    baseServings: 1,
    totalMinutes: null,
    difficulty: 'Chưa đánh giá',
    contentStatus: 'DRAFT',
  } as Recipe;
  const first = [stored].map(discoveryRecipe);
  const refreshed = [stored, { ...stored, id: 'new-id' }].map(discoveryRecipe);
  assert.equal(first.length, 1);
  assert.equal(refreshed.length, 2);
  assert.equal(first[0].time, null);
  assert.equal(first[0].image, '');
  assert.equal(first[0].isDraft, true);
  assert.equal(first[0].cuisineName, 'Thái Lan');
});
