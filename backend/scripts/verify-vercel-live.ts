import '../src/config';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { Database } from '../src/db';

const origin = 'https://cookora-rose.vercel.app';
class Client {
  cookies = new Map<string, string>();
  csrf = '';
  async call(path: string, method = 'GET', body?: unknown, csrf = true) {
    const response = await fetch(origin + '/api/v1' + path, {
      method,
      headers: {
        Origin: origin,
        Cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; '),
        ...(method === 'GET' || !csrf ? {} : { 'X-CSRF-Token': this.csrf }),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    for (const cookie of response.headers.getSetCookie()) {
      const [key, ...value] = cookie.split(';')[0].split('=');
      this.cookies.set(key, value.join('='));
    }
    const json = await response.json();
    if (json.data?.csrfToken) this.csrf = json.data.csrfToken;
    return { status: response.status, json, headers: response.headers };
  }
}
async function main() {
  const project = JSON.parse(readFileSync(resolve(__dirname, '../../.vercel/project.json'), 'utf8'));
  if (process.env.VERCEL_SETUP_VERIFY !== 'true' || project.projectId !== 'prj_gh2n7NQKr6r89ZsA4udp0XAu7GO4')
    throw new Error('Verification requires explicit opt-in to the linked Cookora Vercel project.');
  const db = new Database(),
    ids: string[] = [],
    a = new Client(),
    b = new Client();
  try {
    for (const path of ['/', '/co-gi-nau-nay', '/cong-thuc', '/dang-nhap']) {
      const page = await fetch(origin + path);
      assert.equal(page.status, 200, `${path} must render`);
      const html = await page.text();
      assert.match(page.headers.get('content-type') || '', /text\/html/);
      if (path === '/') {
        const asset = html.match(/src="([^\"]+\.js)"/)?.[1];
        assert.ok(asset);
        assert.equal((await fetch(new URL(asset, origin))).status, 200);
      }
    }
    const ready = await a.call('/health/ready');
    assert.equal(ready.status, 200);
    assert.equal(ready.json.data.database, 'PostgreSQL');
    const live = await a.call('/health/live');
    assert.equal(live.json.data.demo, false);
    assert.equal((await a.call('/unknown-acceptance-route')).status, 404);
    assert.equal((await a.call('/auth/me')).status, 401);
    assert.equal((await a.call('/editor/backlog')).status, 401);
    const approvedCount = await db.recipe.count({ where: { contentStatus: 'APPROVED' } });
    const catalog = await a.call('/recipes');
    assert.equal(catalog.status, 200);
    assert.equal(catalog.json.meta.pagination.total, approvedCount);
    assert.ok(catalog.json.data.every((r: { contentStatus: string }) => r.contentStatus === 'APPROVED'));
    const first = catalog.json.data[0];
    if (first) {
      const pages = await Promise.all(
        Array.from({ length: catalog.json.meta.pagination.totalPages - 1 }, (_, index) =>
          a.call(`/recipes?page=${index + 2}`),
        ),
      );
      assert.ok(pages.every((page) => page.status === 200));
      const all = [...catalog.json.data, ...pages.flatMap((page) => page.json.data)];
      assert.equal(new Set(all.map((r) => r.id)).size, approvedCount);
      assert.ok(all.every((r) => r.contentStatus === 'APPROVED'));
      const detail = await a.call(`/recipes/${first.id}`);
      assert.equal(detail.status, 200);
      assert.ok(detail.json.data.ingredients.length > 0 && detail.json.data.steps.length > 0);
      const byName = await a.call(`/recipes?q=${encodeURIComponent(first.title)}`);
      assert.equal(byName.status, 200);
      assert.ok(byName.json.data.some((r: { id: string }) => r.id === first.id));
      const illustrated = all.filter((r) => r.image).slice(0, 3);
      for (const recipe of illustrated) {
        const image = await fetch(new URL(recipe.image, origin), { method: 'HEAD' });
        assert.equal(image.status, 200);
        assert.match(image.headers.get('content-type') || '', /image\//);
      }
      console.log(
        `PASS: ${all.length} unique published recipes across all pages, recipe detail/search and sampled source images.`,
      );
    }
    const csrf = await a.call('/auth/csrf');
    const header = csrf.headers.getSetCookie().join(';');
    assert.match(header, /__Host-cookora_csrf=/);
    assert.match(header, /Secure/);
    assert.match(header, /HttpOnly/);
    assert.equal((await a.call('/recipes/match', 'POST', { items: [] }, false)).status, 403);
    assert.equal((await a.call('/auth/register', 'POST', {}, true)).status, 400);
    console.log(
      `PASS: Vercel HTTPS pages/assets, API routing, Neon readiness, secure CSRF and production content gate (${approvedCount} approved recipes).`,
    );
    // Exercise the real public password flow; remove only these disposable accounts below.
    for (const c of [a, b]) {
      await c.call('/auth/csrf');
      const credentials = {
        email: `vercel-acceptance-${randomUUID()}@example.invalid`,
        displayName: 'Disposable Vercel verification',
        password: randomBytes(24).toString('base64url'),
      };
      const registered = await c.call('/auth/register', 'POST', credentials);
      assert.equal(registered.status, 201);
      const user = registered.json.data.user;
      ids.push(user.id);
      assert.equal(user.role, 'USER');
      assert.equal(user.email, credentials.email);
      assert.equal('passwordHash' in user, false);
      assert.equal((await c.call('/auth/me')).json.data.id, user.id);
      const duplicate = await c.call('/auth/register', 'POST', credentials);
      assert.equal(duplicate.status, 409);
      assert.equal(duplicate.json.error.code, 'EMAIL_UNAVAILABLE');
      assert.equal((await c.call('/auth/logout', 'POST')).status, 201);
      assert.equal((await c.call('/auth/me')).status, 401);
      const loggedIn = await c.call('/auth/login', 'POST', {
        email: credentials.email,
        password: credentials.password,
      });
      assert.equal(loggedIn.status, 201);
      assert.equal((await c.call('/auth/me')).json.data.id, user.id);
    }
    console.log(
      'PASS: public password registration, automatic sign-in, duplicate email rejection and password login.',
    );
    const plan = await a.call('/meal-plans', 'POST', { weekStart: '2031-02-03' });
    assert.equal(plan.status, 201);
    assert.ok(plan.json.data.id);
    assert.equal((await b.call(`/meal-plans/${plan.json.data.id}`)).status, 404);
    assert.equal((await a.call(`/meal-plans/${plan.json.data.id}`)).status, 200);
    assert.equal((await a.call('/favorites')).status, 200);
    if (first) {
      assert.equal((await a.call(`/favorites/${first.id}`, 'PUT')).status, 200);
      assert.equal((await b.call('/favorites')).json.data.length, 0);
      const added = await a.call(`/meal-plans/${plan.json.data.id}/entries`, 'POST', {
        recipeId: first.id,
        date: '2031-02-03',
        mealType: 'DINNER',
        servings: first.baseServings,
        version: plan.json.data.version,
        clientKey: randomUUID(),
      });
      assert.equal(added.status, 201);
      const shopping = await a.call(`/meal-plans/${plan.json.data.id}/shopping`, 'POST', {
        version: added.json.data.version,
      });
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
        (await a.call(`/meal-plans/${plan.json.data.id}/shopping`)).json.data.items.some(
          (i: { purchased: boolean }) => i.purchased,
        ),
      );
      console.log(
        'PASS: published recipe favorite, meal entry, aggregated shopping list and purchased state on Vercel/Neon.',
      );
    }
    assert.equal((await a.call('/auth/logout', 'POST')).status, 201);
    assert.equal((await a.call('/auth/me')).status, 401);
    const google = await b.call('/auth/google/status');
    assert.equal(google.status, 200);
    if (google.json.data.enabled) {
      const start = await b.call('/auth/google/start', 'POST', { returnTo: '/thuc-don' });
      assert.equal(start.status, 201);
      const authorization = new URL(start.json.data.authorizationUrl);
      assert.equal(authorization.hostname, 'accounts.google.com');
      assert.equal(authorization.searchParams.get('redirect_uri'), origin + '/api/v1/auth/google/callback');
      assert.equal(authorization.searchParams.get('code_challenge_method'), 'S256');
      console.log('PASS: public Google OAuth start uses the Vercel callback and PKCE.');
    }
    console.log(
      `PASS: Vercel cookie sessions → Neon, CSRF-protected plan write/read, cross-account denial and logout; Google config enabled=${google.json.data.enabled}.`,
    );
    console.log('Google interactive consent/callback is not tested by fixture sessions.');
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
          await tx.shoppingItem.deleteMany({ where: { listId: { in: lists.map((list) => list.id) } } });
          await tx.shoppingList.deleteMany({ where: { planId: { in: planIds } } });
          await tx.mealEntry.deleteMany({ where: { planId: { in: planIds } } });
          await tx.favorite.deleteMany({ where: { userId } });
          await tx.mealPlan.deleteMany({ where: { userId } });
          await tx.session.deleteMany({ where: { userId } });
          await tx.user.delete({ where: { id: userId } });
        },
        { timeout: 15000 },
      );
    }
    await db.$disconnect();
    console.log("Cleanup: removed only this run's Vercel acceptance fixture accounts/sessions/plans.");
  }
}
main().catch((error: unknown) => {
  // Assertion diagnostics include only route names and numeric statuses, never request/DB secrets.
  console.error(
    error instanceof assert.AssertionError
      ? `Vercel acceptance assertion failed: ${error.message}`
      : 'Vercel acceptance check failed; inspect sanitized deployment/runtime logs.',
  );
  process.exitCode = 1;
});
