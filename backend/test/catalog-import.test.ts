import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Database } from '../src/db';
import { importThaiCatalog, thaiIngredient, ThaiCatalogSchema } from '../src/thai-catalog-import';
import { importUserMenu, UserMenuSchema } from '../src/user-menu-import';

const thai = JSON.parse(readFileSync(resolve(__dirname, '../../database/seeds/thai-recipes.json'), 'utf8'));
const menu = JSON.parse(
  readFileSync(resolve(__dirname, '../../database/seeds/user-menu-recipes.json'), 'utf8'),
);

function fixture() {
  const recipes = new Map<string, any>();
  const tx = {
    recipe: {
      findUnique: async ({ where }: any) => recipes.get(where.slug) || null,
      create: async ({ data }: any) => {
        recipes.set(data.slug, data);
        return data;
      },
    },
    ingredient: { upsert: async () => {} },
  };
  return {
    recipes,
    db: { $transaction: async (fn: (value: unknown) => unknown) => fn(tx) } as unknown as Database,
  };
}

test('Thai import is repeatable, preserves prior recipes and does not auto-publish untested material', async () => {
  const { recipes, db } = fixture();
  const existing = { id: 'existing', slug: thai[0].slug, title: 'User-edited title' };
  recipes.set(existing.slug, existing);
  const first = await importThaiCatalog(db, thai);
  assert.equal(first.created.length, 49);
  assert.equal(first.preserved.length, 1);
  assert.equal(recipes.get(existing.slug), existing);
  for (const record of [...recipes.values()].slice(1)) {
    assert.equal(record.contentStatus, 'DRAFT');
    assert.equal(record.timingStatus, 'ESTIMATED');
    assert.ok(record.lines.create.length);
    assert.equal(record.steps.create.length, 5);
  }
  const second = await importThaiCatalog(db, thai);
  assert.equal(second.created.length, 0);
  assert.equal(second.preserved.length, 50);
});

test('Thai quantities preserve fractions and dimensions rather than rounding spoons or kilograms', () => {
  assert.equal(thaiIngredient('Đường', '0.25', 'thìa cà phê').quantity, '1.25');
  assert.equal(thaiIngredient('Dầu', '0.5', 'thìa canh').quantity, '7.5');
  assert.equal(thaiIngredient('Thịt', '0.2', 'kg').quantity, '200');
  assert.equal(thaiIngredient('Nước', '0.5', 'l').quantity, '500');
  assert.equal(thaiIngredient('Đường', '0.25', 'thìa cà phê').unit, 'ml');
  assert.notEqual(thaiIngredient('Tỏi', '2', 'tép').id, thaiIngredient('Tỏi', '10', 'g').id);
});

test('source document menu imports fifty recipes and retains unknown quantities and exact instructions', async () => {
  const { recipes, db } = fixture();
  assert.equal(UserMenuSchema.parse(menu).recipes.length, 50);
  const imported = await importUserMenu(db, menu);
  assert.equal(imported.created.length, 50);
  for (const source of menu.recipes) {
    const actual = recipes.get(source.slug);
    assert.deepEqual(actual.steps.create, source.steps);
    assert.equal(actual.sourceName, 'Menu món.docx');
    assert.equal(actual.contentStatus, 'DRAFT');
    assert.equal(actual.totalMinutes, source.totalMinutes);
    assert.deepEqual(
      actual.lines.create.map((line: any) => line.quantity),
      source.ingredients.map((line: any) => line.quantity),
    );
  }
  assert.ok(
    [...recipes.values()].some((recipe) => recipe.lines.create.some((line: any) => line.quantity === null)),
  );
  assert.equal((await importUserMenu(db, menu)).created.length, 0);
  assert.equal(recipes.size, 50);
});

test('source catalogs reject duplicate slugs and missing source items before database mutations', () => {
  assert.equal(ThaiCatalogSchema.safeParse(thai.slice(0, 49)).success, false);
  assert.equal(ThaiCatalogSchema.safeParse([...thai.slice(0, 49), thai[0]]).success, false);
  assert.equal(UserMenuSchema.safeParse({ ...menu, recipes: menu.recipes.slice(0, 49) }).success, false);
});
