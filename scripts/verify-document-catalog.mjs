import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const origin = process.argv[2] || 'http://127.0.0.1:8080';
const imageOrigin = process.argv[3] || origin;
const source = JSON.parse(readFileSync('database/seeds/document-recipes.json', 'utf8'));
const adjustments = JSON.parse(readFileSync('backend/src/catalog-adjustments.json', 'utf8'));
const active = source.recipes
  .filter((recipe) => !adjustments.removedRecipeSlugs.includes(recipe.slug))
  .map((recipe) => ({
    ...recipe,
    totalMinutes: recipe.totalMinutes ?? adjustments.timings[recipe.slug]?.totalMinutes,
  }));
const request = async (path) => {
  const response = await fetch(`${origin}/api/v1${path}`, { signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200, path);
  return response.json();
};
const first = await request('/recipes?pageSize=50&page=1');
const pages = first.meta.pagination.totalPages;
const records = [...first.data];
for (let page = 2; page <= pages; page++)
  records.push(...(await request(`/recipes?pageSize=50&page=${page}`)).data);
assert.equal(records.length, active.length);
assert.equal(first.meta.pagination.total, records.length);
assert.equal(new Set(records.map((recipe) => recipe.id)).size, records.length);
assert.ok(records.every((recipe) => recipe.slug.startsWith('doc-')));
const bySlug = new Map(records.map((recipe) => [recipe.slug, recipe]));
const nameKey = (text) => text.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
for (const recipe of active) {
  const actual = bySlug.get(recipe.slug);
  assert.ok(actual, recipe.slug);
  for (const field of [
    'title',
    'image',
    'imageCredit',
    'baseServings',
    'totalMinutes',
    'cuisine',
    'sourceName',
  ])
    assert.equal(actual[field], recipe[field], `${recipe.slug}:${field}`);
  assert.deepEqual(
    actual.steps.map((step) => step.instruction),
    recipe.steps.map((step) => step.instruction),
  );
  assert.deepEqual(
    actual.ingredients.map((item) => ({
      name: nameKey(item.name),
      quantity: item.quantity,
      unit: item.unit,
      note: item.note,
      role: item.role,
    })),
    recipe.ingredients.map((item) => ({ ...item, name: nameKey(item.name) })),
  );
}
const images = active.flatMap((recipe) => recipe.images);
for (let offset = 0; offset < images.length; offset += 8)
  await Promise.all(
    images.slice(offset, offset + 8).map(async (image) => {
      const response = await fetch(imageOrigin + image.path, { signal: AbortSignal.timeout(20000) });
      assert.equal(response.status, 200, image.path);
      assert.ok(response.headers.get('content-type')?.includes('image/webp'), image.path);
      assert.equal(
        createHash('sha256')
          .update(Buffer.from(await response.arrayBuffer()))
          .digest('hex'),
        image.sha256,
        image.path,
      );
    }),
  );
for (const cuisine of ['VN', 'KR', 'JP', 'CN', 'TH', 'WE', 'IT']) {
  const filtered = await request(`/recipes?cuisine=${cuisine}&pageSize=1`);
  assert.equal(filtered.meta.pagination.total, active.filter((recipe) => recipe.cuisine === cuisine).length);
}
const old = await fetch(`${origin}/api/v1/recipes/dau-hu-sot-ca-chua`);
assert.equal(old.status, 404);
const csrf = await fetch(`${origin}/api/v1/auth/csrf`);
const token = (await csrf.json()).data.csrfToken;
const cookie = csrf.headers
  .getSetCookie()
  .map((value) => value.split(';')[0])
  .join('; ');
const japanese = source.recipes.find((recipe) => recipe.sourceKey === 'nhat');
const portion = await fetch(`${origin}/api/v1/recipes/${japanese.slug}/scale`, {
  method: 'POST',
  signal: AbortSignal.timeout(20000),
  headers: {
    'Content-Type': 'application/json',
    Origin: origin.includes(':3000') ? 'http://localhost:5173' : origin.replace('127.0.0.1', 'localhost'),
    Cookie: cookie,
    'x-csrf-token': token,
  },
  body: JSON.stringify({ servings: 1 }),
});
assert.equal(portion.status, 201);
const scaled = (await portion.json()).data;
assert.equal(scaled.lines[0].exactQuantity, '200');
const report = {
  origin,
  imageOrigin,
  recipes: records.length,
  withImages: images.length,
  missingImages: records.filter((recipe) => !recipe.image).length,
  pages,
  sources: source.sources.map((s) => ({ name: s.name, recipes: s.recipeCount })),
  oldRecipeRemoved: true,
  scaledQuantityVerified: true,
  verifiedAt: new Date().toISOString(),
};
mkdirSync('.review', { recursive: true });
writeFileSync(
  resolve('.review', `live-document-catalog-${new URL(origin).port}.json`),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report));
