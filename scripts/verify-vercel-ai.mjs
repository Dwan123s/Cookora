import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const origin = 'https://cookora-rose.vercel.app';
const cookies = new Map();
let csrf = '';
async function call(path, body) {
  const start = Date.now();
  const response = await fetch(origin + '/api/v1' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      Origin: origin,
      Cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join('; '),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(175000),
  });
  for (const header of response.headers.getSetCookie()) {
    const [name, ...value] = header.split(';')[0].split('=');
    cookies.set(name, value.join('='));
  }
  const json = await response.json().catch(() => null);
  assert.equal(response.status, body === undefined ? 200 : 201,
    `${path}: HTTP ${response.status}, code=${json?.error?.code || 'unknown'}`);
  return { data: json.data, ms: Date.now() - start };
}
try {
  const project = JSON.parse(readFileSync('.vercel/project.json', 'utf8'));
  assert.equal(process.env.VERCEL_AI_VERIFY, 'true', 'Explicit AI verification opt-in required.');
  assert.equal(project.projectId, 'prj_gh2n7NQKr6r89ZsA4udp0XAu7GO4');
  const ready = await call('/health/ready');
  assert.equal(ready.data.database, 'PostgreSQL');
  csrf = (await call('/auth/csrf')).data.csrfToken;
  assert.ok(csrf);
  const suggestion = await call('/ai/suggest-recipes', {
    prompt: 'Tôi có 4 quả trứng, 2 quả cà chua và hành lá. Gợi ý món cho 2 người, ưu tiên món trong kho và 1 món mới với hướng dẫn đầy đủ.',
    servings: 2,
  });
  assert.ok(suggestion.data.menuOverview?.length > 0);
  assert.ok(suggestion.data.dishes?.length > 0);
  for (const dish of suggestion.data.dishes) {
    assert.ok(dish.steps.length >= 5);
    assert.ok(dish.steps.every((s) => s.instruction.length >= 80));
  }
  for (const item of suggestion.data.catalogDishes || [])
    assert.equal((await call(`/recipes/${item.recipe.id}`)).data.id, item.recipe.id);
  console.log(`PASS: public AI recipes HTTP 201, ${suggestion.data.dishes.length} generated dish(es) with >=5 detailed steps, ${suggestion.data.catalogDishes.length} valid catalog selection(s), ${suggestion.ms}ms.`);

  const budget = await call('/ai/suggest-budget', {
    amount: 150000, mode: 'day', days: 1, people: 2, mealsPerDay: 1,
    region: 'Đà Nẵng', preferences: 'Bữa cơm gia đình đơn giản, ưu tiên món Việt có rau và đạm.',
  });
  assert.equal(budget.data.meals.length, 1);
  assert.equal(budget.data.meals[0].day, 1);
  assert.equal(budget.data.meals[0].meal, 1);
  assert.ok(budget.data.meals[0].dishes.length > 0);
  assert.equal(budget.data.estimatedTotal,
    budget.data.meals.reduce((sum, m) => sum + m.dishes.reduce((n, d) => n + d.estimatedCost, 0), 0));
  assert.ok(budget.data.shoppingList.length > 0);
  assert.ok(budget.data.priceNote.length > 0);
  for (const meal of budget.data.meals)
    for (const dish of meal.dishes)
      assert.equal((await call(`/recipes/${dish.recipe.id}`)).data.id, dish.recipe.id);
  console.log(`PASS: public AI budget HTTP 201, complete meal, real catalog recipes, cost totals and aggregated shopping list, ${budget.ms}ms.`);
  assert.equal((await call('/recipes')).data.length > 0, true);
  console.log('PASS: Vercel → Vertex AI and Neon end to end. No user data was created or modified.');
} catch (error) {
  console.error(error instanceof assert.AssertionError
    ? `AI acceptance failed: ${error.message}` : 'AI acceptance failed; raw provider/network response suppressed.');
  process.exitCode = 1;
}
