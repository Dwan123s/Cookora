import assert from 'node:assert/strict';
const origin = process.argv[2] || 'https://cookora-rose.vercel.app';
const catalogResponse = await fetch(`${origin}/api/v1/recipes?pageSize=2`);
assert.equal(catalogResponse.status, 200);
const recipes = (await catalogResponse.json()).data;
assert.equal(recipes.length, 2);
const seed = await fetch(`${origin}/api/v1/auth/csrf`);
assert.equal(seed.status, 200);
const token = (await seed.json()).data.csrfToken;
const entries = [
  { recipeId: recipes[0].id, servings: 2 },
  { recipeId: recipes[0].id, servings: 2 },
  { recipeId: recipes[1].id, servings: 4 },
];
const started = Date.now();
const response = await fetch(`${origin}/api/v1/ai/estimate-week`, {
  method: 'POST',
  headers: {
    Origin: origin,
    'Content-Type': 'application/json',
    'X-CSRF-Token': token,
    Cookie: seed.headers
      .getSetCookie()
      .map((value) => value.split(';')[0])
      .join('; '),
  },
  body: JSON.stringify({ entries, region: 'Việt Nam' }),
  signal: AbortSignal.timeout(120000),
});
const json = await response.json();
assert.equal(response.status, 201, `Weekly AI HTTP ${response.status}: ${json.error?.code || 'unknown'}`);
const result = json.data;
assert.equal(result.dishes.length, 2);
assert.equal(result.dishes[0].recipeId, entries[0].recipeId);
assert.equal(result.dishes[0].servings, 2);
assert.equal(result.dishes[0].occurrences, 2);
assert.equal(result.dishes[1].recipeId, entries[2].recipeId);
assert.equal(result.dishes[1].servings, 4);
assert.equal(
  result.estimatedTotal,
  result.dishes.reduce((sum, dish) => sum + dish.estimatedCost * dish.occurrences, 0),
);
assert.ok(result.estimatedTotal > 0);
assert.ok(result.priceNote.includes('ước tính'));
assert.ok(result.explanation.length > 0);
console.log(
  JSON.stringify({
    pass: true,
    origin,
    selectedMeals: 3,
    pricedDishes: result.dishes.length,
    estimatedTotal: result.estimatedTotal,
    elapsedMs: Date.now() - started,
  }),
);
