import '../src/config';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { Database } from '../src/db';
const base = process.env.TEST_API_URL || 'http://127.0.0.1:3000/api/v1';
if (
  process.env.NODE_ENV === 'production' ||
  !/^http:\/\/(localhost|127\.0\.0\.1):(3000|8080)\/api\/v1$/.test(base)
)
  throw new Error('Integration test is local non-production only.');
const origin = new URL(base).port === '8080' ? 'http://localhost:8080' : 'http://localhost:5173';
class Client {
  jar = new Map<string, string>();
  csrf = '';
  async call(path: string, method = 'GET', body?: unknown, csrf = true) {
    if (method !== 'GET' && !this.csrf) {
      const seed = await this.call('/auth/csrf');
      this.csrf = seed.json.data.csrfToken;
    }
    const res = await fetch(base + path, {
      method,
      headers: {
        Origin: origin,
        Cookie: [...this.jar].map(([k, v]) => `${k}=${v}`).join('; '),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(method === 'GET' || !csrf ? {} : { 'X-CSRF-Token': this.csrf }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    for (const cookie of res.headers.getSetCookie()) {
      const [name, ...parts] = cookie.split(';')[0].split('=');
      this.jar.set(name, parts.join('='));
    }
    const json = await res.json();
    if (json.data?.csrfToken) this.csrf = json.data.csrfToken;
    return { status: res.status, json };
  }
}
test('SQL Server end-to-end: auth, ownership, matching, planner and shopping', async (t) => {
  const a = new Client(),
    b = new Client(),
    users: string[] = [],
    password = `Test!${randomBytes(20).toString('hex')}`;
  try {
    await t.test('health uses real SQL Server and development seed is explicit', async () => {
      const health = await a.call('/health/ready');
      assert.equal(health.status, 200);
      assert.equal(health.json.data.database, 'SQL Server');
      const list = await a.call('/recipes');
      assert.equal(list.json.data.length, 7);
      assert.equal(list.json.meta.demo, true);
      assert.ok(list.json.data.every((r: any) => r.contentStatus === 'DRAFT'));
    });
    await t.test('CSRF blocks anonymous mutation without header', async () => {
      const result = await a.call('/recipes/match', 'POST', { items: [{ ingredientId: 'tomato' }] }, false);
      assert.equal(result.status, 403);
      assert.equal(result.json.error.code, 'CSRF_FAILED');
    });
    await t.test('register two isolated users; passwords never returned', async () => {
      for (const c of [a, b]) {
        const res = await c.call('/auth/register', 'POST', {
          email: `smoke-${randomUUID()}@example.invalid`,
          password,
          displayName: 'Disposable integration user',
        });
        assert.equal(res.status, 201);
        users.push(res.json.data.user.id);
        assert.ok(!JSON.stringify(res.json).includes('passwordHash'));
        assert.ok(c.jar.has('cookora_session'));
      }
    });
    const recipes = (await a.call('/recipes')).json.data;
    const recipe = recipes.find((r: any) => r.slug === 'dau-hu-sot-ca-chua');
    let plan: any, list: any;
    await t.test('normalized search, verified-time filter, exact scaling and match', async () => {
      assert.equal((await a.call('/recipes?q=dau%20hu')).json.data.length >= 1, true);
      assert.equal((await a.call('/recipes?maxMinutes=30')).json.data.length, 0);
      const scaled = await a.call(`/recipes/${recipe.id}/scale`, 'POST', { servings: 3 });
      assert.equal(
        scaled.json.data.lines.find((l: any) => l.ingredientId === 'tofu-firm').exactQuantity,
        '450',
      );
      const matched = await a.call('/recipes/match', 'POST', {
        mode: 'quantity',
        servings: 2,
        items: [{ ingredientId: 'tofu-firm', quantity: '0.15', unit: 'kg' }, { ingredientId: 'tomato' }],
      });
      assert.equal(matched.status, 201);
      assert.equal(matched.json.data.find((m: any) => m.recipe.id === recipe.id).canCookConfirmed, false);
      assert.equal((await a.call(`/recipes/${recipe.id}/scale`, 'POST', { servings: 0 })).status, 400);
    });
    await t.test('favorites persist and are private', async () => {
      await a.call(`/favorites/${recipe.id}`, 'PUT');
      await a.call(`/favorites/${recipe.id}`, 'PUT');
      assert.equal((await a.call('/favorites')).json.data.length, 1);
      assert.equal((await b.call('/favorites')).json.data.length, 0);
    });
    await t.test('create plan; foreign user cannot read it', async () => {
      const r = await a.call('/meal-plans', 'POST', { weekStart: '2026-10-26' });
      assert.equal(r.status, 201);
      plan = r.json.data;
      assert.equal((await b.call(`/meal-plans/${plan.id}`)).status, 404);
    });
    await t.test('idempotent entry retry; stale version and date outside week rejected', async () => {
      const input = {
        date: '2026-10-31',
        recipeId: recipe.id,
        servings: 2,
        mealType: 'DINNER',
        version: plan.version,
        clientKey: randomUUID(),
      };
      const res = await a.call(`/meal-plans/${plan.id}/entries`, 'POST', input);
      assert.equal(res.status, 201);
      plan = res.json.data;
      const retry = await a.call(`/meal-plans/${plan.id}/entries`, 'POST', input);
      assert.equal(retry.json.data.entries.length, 1);
      assert.equal(
        (await a.call(`/meal-plans/${plan.id}/entries`, 'POST', { ...input, clientKey: randomUUID() }))
          .status,
        412,
      );
      assert.equal(
        (
          await a.call(`/meal-plans/${plan.id}/entries`, 'POST', {
            ...input,
            date: '2026-11-02',
            version: plan.version,
            clientKey: randomUUID(),
          })
        ).status,
        400,
      );
      const second = await a.call(`/meal-plans/${plan.id}/entries`, 'POST', {
        ...input,
        servings: 1,
        version: plan.version,
        clientKey: randomUUID(),
      });
      assert.equal(second.status, 201);
      plan = second.json.data;
    });
    await t.test('shopping sums exact quantities, dedupes regeneration and isolates ownership', async () => {
      const res = await a.call(`/meal-plans/${plan.id}/shopping`, 'POST', { version: plan.version });
      assert.equal(res.status, 201);
      list = res.json.data;
      assert.equal(list.items.find((i: any) => i.ingredientId === 'tofu-firm').quantity, '450');
      assert.equal(
        (await a.call(`/meal-plans/${plan.id}/shopping`, 'POST', { version: plan.version })).json.data.id,
        list.id,
      );
      assert.equal((await b.call(`/meal-plans/${plan.id}/shopping`)).status, 404);
      assert.equal(
        (
          await b.call(`/shopping-items/${list.items[0].id}`, 'PATCH', {
            purchased: true,
            version: list.version,
          })
        ).status,
        404,
      );
    });
    await t.test(
      'purchased state survives reload; unsafe regenerate after plan change is blocked',
      async () => {
        const tick = await a.call(`/shopping-items/${list.items[0].id}`, 'PATCH', {
          purchased: true,
          version: list.version,
        });
        assert.equal(tick.status, 200);
        list = tick.json.data;
        assert.equal(list.items.find((i: any) => i.purchased)?.id !== undefined, true);
        const changed = await a.call(`/meal-plans/${plan.id}/entries`, 'POST', {
          date: '2026-11-01',
          recipeId: recipe.id,
          servings: 1,
          mealType: 'LUNCH',
          version: plan.version,
          clientKey: randomUUID(),
        });
        plan = changed.json.data;
        assert.equal((await a.call(`/meal-plans/${plan.id}/shopping`)).json.data.stale, true);
        const blocked = await a.call(`/meal-plans/${plan.id}/shopping`, 'POST', { version: plan.version });
        assert.equal(blocked.status, 409);
        assert.equal(blocked.json.error.code, 'PURCHASE_REVIEW_REQUIRED');
      },
    );
    await t.test('editor endpoint is forbidden to ordinary user', async () => {
      assert.equal((await a.call('/editor/backlog')).status, 403);
    });
    await t.test('login validates password, issues a new session and returns only safe fields', async () => {
      const email = (await a.call('/auth/me')).json.data.email;
      const c = new Client();
      assert.equal(
        (await c.call('/auth/login', 'POST', { email, password: 'not-the-correct-password' })).status,
        401,
      );
      const login = await c.call('/auth/login', 'POST', { email, password });
      assert.equal(login.status, 201);
      assert.equal(login.json.data.user.id, users[0]);
      assert.equal((await c.call('/auth/me')).status, 200);
      assert.ok(!JSON.stringify(login.json).includes('passwordHash'));
      await c.call('/auth/logout', 'POST');
    });
    await t.test('editor can page and filter the real 300-item backlog', async () => {
      const db = new Database();
      try {
        await db.user.update({ where: { id: users[0] }, data: { role: 'EDITOR' } });
      } finally {
        await db.$disconnect();
      }
      const result = await a.call('/editor/backlog');
      assert.equal(result.status, 200);
      assert.equal(result.json.meta.pagination.total, 300);
      assert.equal(result.json.meta.pagination.totalPages, 15);
      assert.deepEqual(result.json.meta.counts, {
        total: 300,
        idea: 293,
        draft: 7,
        kitchen_tested: 0,
        published: 0,
      });
      assert.equal(result.json.data.length, 20);
      const filtered = await a.call('/editor/backlog?cuisine=VN&status=IDEA');
      assert.equal(filtered.json.meta.pagination.total, 149);
      const vietnamese = await a.call('/editor/backlog?cuisine=VN');
      assert.equal(vietnamese.json.meta.pagination.total, 150);
      for (const cuisine of ['KR', 'JP', 'CN', 'TH', 'IT', 'WE']) {
        const foreign = await a.call(`/editor/backlog?cuisine=${cuisine}`);
        assert.equal(foreign.json.meta.pagination.total, 25, cuisine);
      }
      const added = await a.call('/editor/backlog?q=VN150');
      assert.equal(added.json.meta.pagination.total, 1);
      assert.equal(added.json.data[0].id, 'VN150');
      assert.equal(added.json.data[0].milestone, 'M2');
      const lastPage = await a.call('/editor/backlog?page=15');
      assert.equal(lastPage.json.data.length, 20);
      assert.ok(
        lastPage.json.data.every((r: { milestone: string }) => ['M0', 'M1', 'M2'].includes(r.milestone)),
      );
      const beyondScope = await a.call('/editor/backlog?page=16');
      assert.equal(beyondScope.json.data.length, 0);
      const removed = await a.call('/editor/backlog?q=VN151');
      assert.equal(removed.json.meta.pagination.total, 0);
    });
    await t.test('logout revokes server session', async () => {
      const session = a.jar.get('cookora_session');
      assert.equal((await a.call('/auth/logout', 'POST')).status, 201);
      a.jar.set('cookora_session', session!);
      assert.equal((await a.call('/auth/me')).status, 401);
    });
  } finally {
    // Only UUIDs created above by this disposable workflow; never remove other users.
    const db = new Database();
    try {
      for (const id of users)
        await db.$transaction(async (tx) => {
          const plans = await tx.mealPlan.findMany({ where: { userId: id }, select: { id: true } });
          const ids = plans.map((p) => p.id);
          const lists = await tx.shoppingList.findMany({
            where: { planId: { in: ids } },
            select: { id: true },
          });
          await tx.shoppingItem.deleteMany({ where: { listId: { in: lists.map((l) => l.id) } } });
          await tx.shoppingList.deleteMany({ where: { planId: { in: ids } } });
          await tx.mealEntry.deleteMany({ where: { planId: { in: ids } } });
          await tx.mealPlan.deleteMany({ where: { userId: id } });
          await tx.favorite.deleteMany({ where: { userId: id } });
          await tx.session.deleteMany({ where: { userId: id } });
          await tx.user.delete({ where: { id } });
        });
    } finally {
      await db.$disconnect();
    }
  }
});
