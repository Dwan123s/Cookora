import '../src/config';
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Response } from 'express';
import { Database } from '../src/db';
import { databaseProvider, production, appOrigin } from '../src/config';
import { Sessions } from '../src/security';

// Explicit one-off acceptance check: creates only random @example.invalid fixture accounts,
// tests the running local UI/API against the linked Neon DB, and cleans up its own IDs.
const base = 'http://127.0.0.1:5173';
class Client {
  jar = new Map<string, string>();
  csrf = '';
  async call(path: string, method = 'GET', body?: unknown) {
    const response = await fetch(base + '/api/v1' + path, {
      method,
      headers: {
        Origin: appOrigin,
        Cookie: [...this.jar].map(([k, v]) => `${k}=${v}`).join('; '),
        ...(method === 'GET' ? {} : { 'X-CSRF-Token': this.csrf }),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    for (const cookie of response.headers.getSetCookie()) {
      const [name, ...value] = cookie.split(';')[0].split('=');
      this.jar.set(name, value.join('='));
    }
    const json = await response.json();
    if (json.data?.csrfToken) this.csrf = json.data.csrfToken;
    return { status: response.status, json };
  }
}

async function main() {
  const context = JSON.parse(readFileSync(resolve(__dirname, '../../.neon'), 'utf8'));
  if (
    process.env.NEON_SETUP_VERIFY !== 'true' ||
    databaseProvider !== 'postgresql' ||
    context.projectId !== 'polished-bonus-47222343' ||
    context.branch !== 'production' ||
    process.env.NEON_BRANCH !== 'production' ||
    production
  )
    throw new Error(
      'Refusing verification outside the acknowledged linked project and local development server.',
    );
  const db = new Database(),
    ids: string[] = [],
    a = new Client(),
    b = new Client();
  try {
    const role = await db.$queryRaw<Array<{ role: string; can_create: boolean }>>`
      SELECT current_user AS role, has_schema_privilege(current_user, 'public', 'CREATE') AS can_create`;
    assert.equal(role[0].role, 'cookora_app');
    assert.equal(role[0].can_create, false);
    const ready = await a.call('/health/ready');
    assert.equal(ready.status, 200);
    assert.equal(ready.json.data.database, 'PostgreSQL');
    const catalog = await a.call('/recipes?pageSize=1');
    assert.equal(catalog.status, 200);
    assert.equal(catalog.json.meta.pagination.total, 419);
    const recipe = catalog.json.data[0];
    const page = await fetch(base + '/co-gi-nau-nay');
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-type') || '', /text\/html/);
    console.log(
      'PASS: running frontend → Vite /api proxy → NestJS → Neon production; 419 source recipes; app role has no DDL.',
    );
    for (const client of [a, b]) {
      const user = await db.user.create({
        data: {
          email: `neon-acceptance-${randomUUID()}@example.invalid`,
          displayName: 'Disposable Neon verification',
          passwordHash: null,
        },
      });
      ids.push(user.id);
      await new Sessions(db).create(user.id, {
        cookie(name: string, value: string) {
          client.jar.set(name, value);
        },
      } as Response);
      assert.equal((await client.call('/auth/me')).status, 200);
      await client.call('/auth/csrf');
    }
    assert.equal((await a.call(`/favorites/${recipe.id}`, 'PUT')).status, 200);
    assert.equal((await b.call('/favorites')).json.data.length, 0);
    let plan = (await a.call('/meal-plans', 'POST', { weekStart: '2031-02-03' })).json.data;
    assert.ok(plan.id);
    const added = await a.call(`/meal-plans/${plan.id}/entries`, 'POST', {
      recipeId: recipe.id,
      date: '2031-02-03',
      mealType: 'DINNER',
      servings: recipe.baseServings,
      version: plan.version,
      clientKey: randomUUID(),
    });
    assert.equal(added.status, 201);
    plan = added.json.data;
    assert.equal((await b.call(`/meal-plans/${plan.id}`)).status, 404);
    const shopping = await a.call(`/meal-plans/${plan.id}/shopping`, 'POST', { version: plan.version });
    assert.equal(shopping.status, 201);
    assert.ok(shopping.json.data.items.length > 0);
    const item = shopping.json.data.items[0];
    assert.equal(
      (
        await a.call(`/shopping-items/${item.id}`, 'PATCH', {
          purchased: true,
          version: shopping.json.data.version,
        })
      ).status,
      200,
    );
    assert.ok(
      (await a.call(`/meal-plans/${plan.id}/shopping`)).json.data.items.some(
        (i: { purchased: boolean }) => i.purchased,
      ),
    );
    assert.equal((await a.call('/auth/logout', 'POST')).status, 201);
    assert.equal((await a.call('/auth/me')).status, 401);
    console.log(
      'PASS: Neon-backed sessions, private favorites, meal entry, shopping persistence and logout through the running app.',
    );
  } finally {
    for (const userId of ids) {
      const plans = await db.mealPlan.findMany({ where: { userId }, select: { id: true } });
      const planIds = plans.map((p) => p.id);
      const lists = await db.shoppingList.findMany({
        where: { planId: { in: planIds } },
        select: { id: true },
      });
      await db.$transaction(
        async (tx) => {
          await tx.shoppingItem.deleteMany({ where: { listId: { in: lists.map((l) => l.id) } } });
          await tx.shoppingList.deleteMany({ where: { planId: { in: planIds } } });
          await tx.mealEntry.deleteMany({ where: { planId: { in: planIds } } });
          await tx.mealPlan.deleteMany({ where: { userId } });
          await tx.favorite.deleteMany({ where: { userId } });
          await tx.session.deleteMany({ where: { userId } });
          await tx.user.delete({ where: { id: userId } });
        },
        { timeout: 15000 },
      );
    }
    await db.$disconnect();
    console.log("Cleanup: only this verification run's fixture accounts/rows removed.");
  }
}
main().catch(() => {
  console.error(
    'Neon live verification failed; see sanitized API logs. Credentials and account details are not printed.',
  );
  process.exitCode = 1;
});
