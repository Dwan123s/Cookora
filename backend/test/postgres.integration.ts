import '../src/config';
import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Database } from '../src/db';
import { databaseProvider, production } from '../src/config';
import { seedDocumentCatalog } from '../src/document-catalog';
import { GoogleAuth } from '../src/google-auth';
import { databaseFailure } from '../src/database-errors';

const base = 'http://127.0.0.1:3001/api/v1';
const url = new URL(process.env.DATABASE_URL || 'http://invalid');
if (
  production ||
  databaseProvider !== 'postgresql' ||
  url.hostname !== '127.0.0.1' ||
  url.port !== '15432' ||
  url.pathname !== '/cookora_check'
)
  throw new Error(
    'Postgres integration requires the disposable loopback cookora_check database on port 15432.',
  );

class Client {
  jar = new Map<string, string>();
  csrf = '';
  async call(path: string, method = 'GET', body?: unknown, withCsrf = true) {
    if (method !== 'GET' && !this.csrf) this.csrf = (await this.call('/auth/csrf')).json.data.csrfToken;
    const response = await fetch(base + path, {
      method,
      headers: {
        Origin: 'http://localhost:5173',
        Cookie: [...this.jar].map(([k, v]) => `${k}=${v}`).join('; '),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(method === 'GET' || !withCsrf ? {} : { 'X-CSRF-Token': this.csrf }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    for (const line of response.headers.getSetCookie()) {
      const [name, ...value] = line.split(';')[0].split('=');
      this.jar.set(name, value.join('='));
    }
    const json = await response.json();
    if (json.data?.csrfToken) this.csrf = json.data.csrfToken;
    return { status: response.status, json };
  }
}

test('PostgreSQL end-to-end with real catalog, constraints, identity and private planner', async (t) => {
  const db = new Database(),
    a = new Client(),
    b = new Client(),
    users: string[] = [];
  const password = `Fixture!${randomBytes(24).toString('hex')}`;
  let plan: any, shopping: any, recipe: any;
  try {
    await t.test('migrations and exact source catalog seed work idempotently', async () => {
      const source = JSON.parse(
        readFileSync(resolve(__dirname, '../../database/seeds/document-recipes.json'), 'utf8'),
      );
      await seedDocumentCatalog(db, source);
      assert.deepEqual(await seedDocumentCatalog(db, source), { created: 0, preserved: 419 });
      assert.equal(await db.recipe.count(), 419);
      assert.equal(await db.recipe.count({ where: { contentStatus: 'APPROVED' } }), 0);
      assert.equal(await db.googleIdentity.count(), 0);
    });
    await t.test('PostgreSQL errors use the same sanitized handler and CHECK constraints apply', async () => {
      let caught: unknown;
      try {
        await db.$queryRawUnsafe('SELECT * FROM "MissingFixtureTable"');
      } catch (error) {
        caught = error;
      }
      assert.ok(caught);
      // Raw-query failures are not misreported as connectivity outages.
      assert.equal(databaseFailure(caught), undefined);
      await assert.rejects(() =>
        db.user.create({
          data: {
            email: `invalid-${randomUUID()}@example.invalid`,
            displayName: 'Fixture',
            role: 'OWNER',
          },
        }),
      );
    });
    await t.test('HTTP health and all pages come from the PostgreSQL catalog', async () => {
      const ready = await a.call('/health/ready');
      assert.equal(ready.status, 200);
      assert.equal(ready.json.data.database, 'PostgreSQL');
      const result = await a.call('/recipes?pageSize=100');
      assert.equal(result.json.meta.pagination.total, 419);
      recipe = result.json.data.find((r: any) => r.ingredients.some((l: any) => l.quantity));
      assert.ok(recipe);
      const detail = await a.call(`/recipes/${recipe.id}`);
      assert.equal(detail.status, 200);
      assert.equal(detail.json.data.id, recipe.id);
      const search = await a.call(`/recipes?q=${encodeURIComponent(recipe.title)}`);
      assert.ok(search.json.data.some((r: any) => r.id === recipe.id));
    });
    await t.test('CSRF and two distinct registered accounts work on PostgreSQL', async () => {
      assert.equal((await a.call('/recipes/match', 'POST', { items: [] }, false)).status, 403);
      for (const client of [a, b]) {
        const response = await client.call('/auth/register', 'POST', {
          email: `pg-${randomUUID()}@example.invalid`,
          displayName: 'Postgres fixture',
          password,
        });
        assert.equal(response.status, 201);
        users.push(response.json.data.user.id);
        assert.ok(!JSON.stringify(response.json.data).includes('passwordHash'));
      }
    });
    await t.test('Decimal portion scaling and quantity matching remain exact', async () => {
      const servings = recipe.baseServings === 20 ? 10 : recipe.baseServings * 2;
      const scaled = await a.call(`/recipes/${recipe.id}/scale`, 'POST', { servings });
      assert.equal(scaled.status, 201);
      assert.ok(scaled.json.data.lines.some((l: any) => l.exactQuantity !== null));
      const line = recipe.ingredients.find((l: any) => l.quantity);
      const matching = await a.call('/recipes/match', 'POST', {
        mode: 'quantity',
        servings: recipe.baseServings,
        items: [{ ingredientId: line.ingredientId, quantity: line.quantity, unit: line.unit }],
      });
      assert.equal(matching.status, 201);
      assert.ok(Array.isArray(matching.json.data));
    });
    await t.test(
      'favorites are private and plan retries/version conflicts survive provider change',
      async () => {
        assert.equal((await a.call(`/favorites/${recipe.id}`, 'PUT')).status, 200);
        assert.equal((await b.call('/favorites')).json.data.length, 0);
        plan = (await a.call('/meal-plans', 'POST', { weekStart: '2031-02-03' })).json.data;
        assert.equal((await b.call(`/meal-plans/${plan.id}`)).status, 404);
        const input = {
          recipeId: recipe.id,
          date: '2031-02-03',
          mealType: 'DINNER',
          servings: recipe.baseServings,
          clientKey: randomUUID(),
          version: plan.version,
        };
        const added = await a.call(`/meal-plans/${plan.id}/entries`, 'POST', input);
        assert.equal(added.status, 201);
        plan = added.json.data;
        assert.equal(
          (await a.call(`/meal-plans/${plan.id}/entries`, 'POST', input)).json.data.entries.length,
          1,
        );
        assert.equal(
          (await a.call(`/meal-plans/${plan.id}/entries`, 'POST', { ...input, clientKey: randomUUID() }))
            .status,
          412,
        );
      },
    );
    await t.test(
      'serializable shopping aggregation, bought state and ownership work on PostgreSQL',
      async () => {
        const created = await a.call(`/meal-plans/${plan.id}/shopping`, 'POST', { version: plan.version });
        assert.equal(created.status, 201);
        shopping = created.json.data;
        assert.ok(shopping.items.length > 0);
        assert.equal(
          (await a.call(`/meal-plans/${plan.id}/shopping`, 'POST', { version: plan.version })).json.data.id,
          shopping.id,
        );
        assert.equal((await b.call(`/meal-plans/${plan.id}/shopping`)).status, 404);
        assert.equal(
          (
            await b.call(`/shopping-items/${shopping.items[0].id}`, 'PATCH', {
              purchased: true,
              version: shopping.version,
            })
          ).status,
          404,
        );
        const updated = await a.call(`/shopping-items/${shopping.items[0].id}`, 'PATCH', {
          purchased: true,
          version: shopping.version,
        });
        assert.equal(updated.status, 200);
        assert.ok(
          (await a.call(`/meal-plans/${plan.id}/shopping`)).json.data.items.some((i: any) => i.purchased),
        );
      },
    );
    await t.test(
      'Google identity persistence and account resolution work without calling Google',
      async () => {
        const google = new GoogleAuth(db);
        const profile = {
          subject: `pg-${randomUUID()}`,
          email: `pg-google-${randomUUID()}@example.invalid`,
          displayName: 'Google fixture',
          authoritative: false,
        };
        const first = await google.resolveUser(profile);
        users.push(first.id);
        assert.equal(first.passwordHash, null);
        assert.equal((await google.resolveUser(profile)).id, first.id);
      },
    );
    await t.test(
      'ordinary users cannot open editor; login and logout persist/revoke SQL sessions',
      async () => {
        assert.equal((await a.call('/editor/backlog')).status, 403);
        const email = (await a.call('/auth/me')).json.data.email;
        assert.equal((await b.call('/auth/login', 'POST', { email, password: 'wrong-fixture' })).status, 401);
        const c = new Client();
        assert.equal((await c.call('/auth/login', 'POST', { email, password })).status, 201);
        const token = c.jar.get('cookora_session');
        assert.equal((await c.call('/auth/logout', 'POST')).status, 201);
        c.jar.set('cookora_session', token!);
        assert.equal((await c.call('/auth/me')).status, 401);
      },
    );
  } finally {
    for (const userId of users) {
      const plans = await db.mealPlan.findMany({ where: { userId }, select: { id: true } });
      const ids = plans.map((p) => p.id);
      const lists = await db.shoppingList.findMany({ where: { planId: { in: ids } }, select: { id: true } });
      await db.$transaction(async (tx) => {
        await tx.shoppingItem.deleteMany({ where: { listId: { in: lists.map((l) => l.id) } } });
        await tx.shoppingList.deleteMany({ where: { planId: { in: ids } } });
        await tx.mealEntry.deleteMany({ where: { planId: { in: ids } } });
        await tx.mealPlan.deleteMany({ where: { userId } });
        await tx.favorite.deleteMany({ where: { userId } });
        await tx.session.deleteMany({ where: { userId } });
        await tx.googleIdentity.deleteMany({ where: { userId } });
        await tx.user.delete({ where: { id: userId } });
      });
    }
    await db.$disconnect();
  }
});
