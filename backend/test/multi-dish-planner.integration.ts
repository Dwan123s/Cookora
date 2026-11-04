import '../src/config';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import type { MealPlan, Recipe, ShoppingList } from '@cookora/contracts';
import { Database } from '../src/db';
import { aggregate } from '../src/domain';

const base = 'http://localhost:8080/api/v1';
if (process.env.NODE_ENV === 'production' || process.env.DATABASE_PROVIDER === 'postgresql')
  throw new Error('This disposable integration test is for local SQL Server only.');

test('local API saves a main, soup and vegetables in one meal, reloads, edits, removes and totals all ingredients', async () => {
  const jar = new Map<string, string>();
  let csrf = '',
    userId = '';
  const db = new Database();
  async function call(path: string, method = 'GET', body?: unknown) {
    const res = await fetch(base + path, {
      method,
      headers: {
        Origin: 'http://localhost:8080',
        Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; '),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(method === 'GET' ? {} : { 'X-CSRF-Token': csrf }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    for (const cookie of res.headers.getSetCookie()) {
      const [name, ...value] = cookie.split(';')[0].split('=');
      jar.set(name, value.join('='));
    }
    const data = await res.json();
    if (data.data?.csrfToken) csrf = data.data.csrfToken;
    assert.ok(res.ok, `${method} ${path}: ${res.status} ${data.error?.code || ''}`);
    return data.data;
  }
  try {
    await call('/auth/csrf');
    const registered = await call('/auth/register', 'POST', {
      email: `multi-dish-${randomUUID()}@example.invalid`,
      password: `Test!${randomBytes(18).toString('hex')}`,
      displayName: 'Disposable multi dish test',
    });
    userId = registered.user.id;
    const recipes: Recipe[] = [];
    for (let page = 1; page <= 6; page++) {
      const result = await call(`/recipes?pageSize=100&page=${page}`);
      recipes.push(...result);
      if (result.length < 100) break;
    }
    const main = recipes.find((r) => /cá kho/i.test(r.title))!;
    const soup = recipes.find((r) => /^canh /i.test(r.title))!;
    const veg = recipes.find((r) => /rau muống xào/i.test(r.title))!;
    assert.ok(main && soup && veg, 'Catalog must include main, soup and vegetables');
    let plan: MealPlan = await call('/meal-plans', 'POST', { weekStart: '2026-11-02' });
    const inputs = [main, soup, veg].map((r, index) => ({
      date: '2026-11-04',
      mealType: 'LUNCH',
      recipeId: r.id,
      servings: index + 2,
      clientKey: randomUUID(),
    }));
    for (const input of inputs)
      plan = await call(`/meal-plans/${plan.id}/entries`, 'POST', { ...input, version: plan.version });
    assert.equal(plan.entries.length, 3);
    const version = plan.version;
    plan = await call(`/meal-plans/${plan.id}/entries`, 'POST', { ...inputs[2], version: 1 });
    assert.equal(plan.entries.length, 3, 'retry is idempotent even with an older version');
    assert.equal(plan.version, version);
    plan = await call('/meal-plans?week=2026-11-02');
    assert.equal(plan.entries.filter((e) => e.date === '2026-11-04' && e.mealType === 'LUNCH').length, 3);
    const soupEntry = plan.entries.find((e) => e.recipe.id === soup.id)!;
    plan = await call(`/meal-plans/${plan.id}/entries/${soupEntry.id}`, 'PATCH', {
      recipeId: soup.id,
      servings: 5,
      version: plan.version,
    });
    assert.equal(plan.entries.find((e) => e.recipe.id === soup.id)?.servings, 5);
    assert.equal(plan.entries.find((e) => e.recipe.id === main.id)?.servings, 2);
    const shopping: ShoppingList = await call(`/meal-plans/${plan.id}/shopping`, 'POST', {
      version: plan.version,
    });
    const expected = aggregate(plan.entries);
    assert.equal(shopping.items.length, expected.length);
    for (const row of expected) {
      const item = shopping.items.find((i) => i.ingredientId === row.ingredientId && i.unit === row.unit)!;
      assert.ok(item, row.name);
      assert.equal(item.quantity, row.quantity, row.name);
    }
    plan = await call(`/meal-plans/${plan.id}/entries/${soupEntry.id}`, 'DELETE', { version: plan.version });
    assert.deepEqual(new Set(plan.entries.map((e) => e.recipe.id)), new Set([main.id, veg.id]));
    const stale: ShoppingList = await call(`/meal-plans/${plan.id}/shopping`);
    assert.equal(stale.stale, true);
  } finally {
    // Remove only the disposable account created by this test, including its test plan.
    if (userId)
      await db.$transaction(async (tx) => {
        const plans = await tx.mealPlan.findMany({ where: { userId }, select: { id: true } });
        const planIds = plans.map((p) => p.id);
        const lists = await tx.shoppingList.findMany({
          where: { planId: { in: planIds } },
          select: { id: true },
        });
        await tx.shoppingItem.deleteMany({ where: { listId: { in: lists.map((l) => l.id) } } });
        await tx.shoppingList.deleteMany({ where: { planId: { in: planIds } } });
        await tx.mealEntry.deleteMany({ where: { planId: { in: planIds } } });
        await tx.mealPlan.deleteMany({ where: { userId } });
        await tx.favorite.deleteMany({ where: { userId } });
        await tx.session.deleteMany({ where: { userId } });
        await tx.user.delete({ where: { id: userId } });
      });
    await db.$disconnect();
  }
});
