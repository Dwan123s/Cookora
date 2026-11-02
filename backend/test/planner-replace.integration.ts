import '../src/config';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { Database } from '../src/db';
const base = 'http://127.0.0.1:3000/api/v1';
class Client {
  jar = new Map<string, string>();
  csrf = '';
  async call(path: string, method = 'GET', body?: unknown) {
    if (method !== 'GET' && !this.csrf) {
      const seed = await this.call('/auth/csrf');
      this.csrf = seed.data.csrfToken;
    }
    const response = await fetch(base + path, {
      method,
      headers: {
        Origin: 'http://localhost:5173',
        Cookie: [...this.jar].map(([name, value]) => `${name}=${value}`).join('; '),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(method !== 'GET' ? { 'X-CSRF-Token': this.csrf } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    for (const cookie of response.headers.getSetCookie()) {
      const [name, ...value] = cookie.split(';')[0].split('=');
      this.jar.set(name, value.join('='));
    }
    const json = await response.json();
    if (json.data?.csrfToken) this.csrf = json.data.csrfToken;
    return { status: response.status, ...json };
  }
}
async function main() {
  if (process.env.NODE_ENV === 'production')
    throw new Error('Planner verification is local non-production only.');
  const created: string[] = [];
  const db = new Database();
  try {
    const a = new Client(),
      b = new Client();
    for (const client of [a, b]) {
      const result = await client.call('/auth/register', 'POST', {
        email: `planner-ui-${randomUUID()}@example.invalid`,
        password: 'UI!' + randomBytes(24).toString('hex'),
        displayName: 'Disposable planner verification',
      });
      assert.ok(result.status < 300, JSON.stringify(result));
      created.push(result.data.user.id);
    }
    const recipes = (await a.call('/recipes?pageSize=2')).data;
    let result = await a.call('/meal-plans', 'POST', { weekStart: '2031-02-03' });
    assert.ok(result.status < 300);
    let plan = result.data;
    result = await a.call(`/meal-plans/${plan.id}/entries`, 'POST', {
      date: plan.weekStart,
      mealType: 'BREAKFAST',
      recipeId: recipes[0].id,
      servings: 2,
      version: plan.version,
      clientKey: randomUUID(),
    });
    assert.ok(result.status < 300);
    plan = result.data;
    const entryId = plan.entries[0].id;
    const stale = plan.version;
    result = await a.call(`/meal-plans/${plan.id}/entries/${entryId}`, 'PATCH', {
      recipeId: recipes[1].id,
      servings: 3,
      version: plan.version,
    });
    assert.equal(result.status, 200);
    plan = result.data;
    assert.equal(plan.entries.length, 1);
    assert.equal(plan.entries[0].id, entryId);
    assert.equal(plan.entries[0].recipe.id, recipes[1].id);
    assert.equal(plan.entries[0].servings, 3);
    assert.equal(
      (
        await a.call(`/meal-plans/${plan.id}/entries/${entryId}`, 'PATCH', {
          recipeId: recipes[0].id,
          servings: 2,
          version: stale,
        })
      ).status,
      412,
    );
    assert.equal(
      (
        await b.call(`/meal-plans/${plan.id}/entries/${entryId}`, 'PATCH', {
          recipeId: recipes[0].id,
          servings: 2,
          version: plan.version,
        })
      ).status,
      404,
    );
    assert.equal(
      (
        await a.call(`/meal-plans/${plan.id}/entries/${randomUUID()}`, 'PATCH', {
          recipeId: recipes[0].id,
          servings: 2,
          version: plan.version,
        })
      ).status,
      404,
    );
    const after = (await a.call(`/meal-plans/${plan.id}`)).data;
    assert.equal(after.version, plan.version);
    assert.equal(after.entries[0].recipe.id, recipes[1].id);
    result = await a.call(`/meal-plans/${plan.id}/shopping`, 'POST', { version: plan.version });
    assert.ok(result.status < 300);
    let shopping = result.data;
    assert.ok(shopping.items.length > 0);
    assert.ok(shopping.items.every((item: any) => !item.purchased));
    const item = shopping.items[0];
    result = await a.call(`/shopping-items/${item.id}`, 'PATCH', {
      purchased: true,
      version: shopping.version,
    });
    assert.equal(result.status, 200);
    shopping = result.data;
    assert.ok(shopping.items.find((row: any) => row.id === item.id).purchased);
    console.log(
      'PASS: replace preserves entry identity and portions; stale versions and cross-account edits blocked; missing-entry update rolls back; shopping generation and purchase tracking work.',
    );
  } finally {
    for (const id of created) {
      await db.$transaction(async (tx) => {
        const plans = await tx.mealPlan.findMany({ where: { userId: id }, select: { id: true } });
        const ids = plans.map((plan) => plan.id);
        const lists = await tx.shoppingList.findMany({
          where: { planId: { in: ids } },
          select: { id: true },
        });
        await tx.shoppingItem.deleteMany({ where: { listId: { in: lists.map((list) => list.id) } } });
        await tx.shoppingList.deleteMany({ where: { planId: { in: ids } } });
        await tx.mealEntry.deleteMany({ where: { planId: { in: ids } } });
        await tx.mealPlan.deleteMany({ where: { userId: id } });
        await tx.favorite.deleteMany({ where: { userId: id } });
        await tx.session.deleteMany({ where: { userId: id } });
        await tx.user.delete({ where: { id } });
      });
    }
    await db.$disconnect();
    console.log('Removed only disposable verification accounts and their records.');
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
