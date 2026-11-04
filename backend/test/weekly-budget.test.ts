import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Request } from 'express';
import type { Recipe, WeeklyBudgetEstimateInput } from '@cookora/contracts';
import { Catalog } from '../src/catalog';
import {
  WeeklyBudgetController,
  WeeklyBudgetService,
  WeeklyBudgetInputSchema,
  buildWeeklyBudgetEstimate,
} from '../src/weekly-budget';

const input: WeeklyBudgetEstimateInput = {
  region: 'Đà Nẵng',
  entries: [
    { recipeId: 'rice', servings: 2 },
    { recipeId: 'rice', servings: 2 },
    { recipeId: 'rice', servings: 4 },
    { recipeId: 'tofu', servings: 1 },
  ],
};
const output = () => ({
  dishes: [
    { recipeId: 'rice', servings: 2, estimatedCost: 30000 },
    { recipeId: 'rice', servings: 4, estimatedCost: 60000 },
    { recipeId: 'tofu', servings: 1, estimatedCost: 15000 },
  ],
  explanation: 'Ước tính theo lượng nguyên liệu dùng, có tính gia vị.',
  tips: ['Mua chung nguyên liệu cho các bữa.'],
});
const recipes = ['rice', 'tofu'].map(
  (id) =>
    ({
      id,
      title: id,
      baseServings: 2,
      ingredients: [
        { name: 'Gạo', quantity: '200', unit: 'g', optional: false, role: 'MAIN' },
        { name: 'Muối', quantity: null, unit: 'g', note: 'Một nhúm', optional: false, role: 'SEASONING' },
        { name: 'Hành thêm', quantity: '5', unit: 'g', optional: true, role: 'SEASONING' },
      ],
    }) as Recipe,
);

test('weekly AI costs cover each serving size and repeated meal exactly; model totals are ignored', () => {
  const result = buildWeeklyBudgetEstimate(input, { ...output(), estimatedTotal: 1 });
  assert.equal(result.estimatedTotal, 135000);
  assert.deepEqual(
    result.dishes.map((dish) => [dish.recipeId, dish.servings, dish.occurrences, dish.subtotal]),
    [
      ['rice', 2, 2, 60000],
      ['rice', 4, 1, 60000],
      ['tofu', 1, 1, 15000],
    ],
  );
  assert.match(result.priceNote, /ước tính/);
  assert.ok(Number.isFinite(Date.parse(result.generatedAt)));
});

test('weekly AI rejects missing, duplicate, invented or wrongly scaled prices and unsafe amounts', () => {
  for (const mutate of [
    (m: ReturnType<typeof output>) => {
      m.dishes.pop();
    },
    (m: ReturnType<typeof output>) => {
      m.dishes.push(m.dishes[0]);
    },
    (m: ReturnType<typeof output>) => {
      m.dishes[0].recipeId = 'invented';
    },
    (m: ReturnType<typeof output>) => {
      m.dishes[0].servings = 3;
    },
    (m: ReturnType<typeof output>) => {
      m.dishes[0].estimatedCost = -1000;
    },
    (m: ReturnType<typeof output>) => {
      m.dishes[0].estimatedCost = 1.5;
    },
    (m: ReturnType<typeof output>) => {
      m.dishes[0].estimatedCost = Infinity;
    },
  ]) {
    const model = output();
    mutate(model);
    assert.throws(() => buildWeeklyBudgetEstimate(input, model));
  }
});

test('weekly estimate request requires a bounded, nonempty plan and disallows client prices or recipes', () => {
  for (const patch of [
    { entries: [] },
    { entries: Array(101).fill(input.entries[0]) },
    { entries: [{ recipeId: 'rice', servings: 0 }] },
    { entries: [{ recipeId: 'rice', servings: 21 }] },
    { entries: [{ recipeId: 'rice', servings: 1.5 }] },
    { entries: [{ recipeId: 'rice', servings: 2, estimatedCost: 1 }] },
    { region: ' ' },
    { region: 'x'.repeat(121) },
    { budget: 1 },
  ])
    assert.equal(WeeklyBudgetInputSchema.safeParse({ ...input, ...patch }).success, false);
  assert.equal(WeeklyBudgetInputSchema.parse({ entries: input.entries }).region, 'Việt Nam');
});

test('weekly AI uses catalog ingredients, serving ratios and configured provider without exposing credentials', async (t) => {
  const saved = { ...process.env };
  t.after(() => {
    process.env = saved;
  });
  process.env.VERTEX_API_KEY = 'weekly-budget-test-secret';
  const service = new WeeklyBudgetService({ all: async () => recipes } as Catalog);
  await t.test('provider receives only chosen dishes and counts, not invented client costs', async (ct) => {
    ct.mock.method(
      globalThis,
      'fetch',
      async (url: string | URL | globalThis.Request, init?: RequestInit) => {
        assert.ok(String(url).startsWith('https://aiplatform.googleapis.com/'));
        assert.ok(!String(url).includes(process.env.VERTEX_API_KEY!));
        assert.equal(new Headers(init?.headers).get('x-goog-api-key'), process.env.VERTEX_API_KEY);
        const body = JSON.parse(String(init?.body));
        const prompt = JSON.parse(body.contents[0].parts[0].text);
        assert.equal(prompt.region, input.region);
        assert.equal(prompt.dishes.length, 3);
        assert.equal(prompt.dishes[0].occurrences, 2);
        assert.equal(prompt.dishes[0].baseServings, 2);
        assert.equal(prompt.dishes[1].servings, 4);
        assert.equal(prompt.dishes[0].ingredients[0].quantity, '200');
        assert.equal(prompt.dishes[0].ingredients[1].quantity, null);
        assert.equal(prompt.dishes[0].ingredients[1].note, 'Một nhúm');
        assert.equal(prompt.dishes[0].ingredients.length, 2);
        return Response.json({
          candidates: [
            {
              content: {
                parts: [{ thought: true, text: 'Private reasoning' }, { text: JSON.stringify(output()) }],
              },
            },
          ],
        });
      },
    );
    assert.equal((await service.estimate(input)).estimatedTotal, 135000);
  });
  for (const status of [401, 403, 429, 500])
    await t.test(`sanitized provider failure ${status}`, async (ct) => {
      const logs: unknown[] = [];
      ct.mock.method(console, 'error', (...args: unknown[]) => logs.push(args));
      ct.mock.method(globalThis, 'fetch', async () => new Response(process.env.VERTEX_API_KEY, { status }));
      await assert.rejects(service.estimate(input), (error: any) => {
        assert.equal(error.getStatus(), 503);
        assert.equal(error.getResponse().code, 'WEEKLY_BUDGET_AI_ERROR');
        assert.ok(!JSON.stringify(error.getResponse()).includes(process.env.VERTEX_API_KEY!));
        return true;
      });
      assert.ok(!JSON.stringify(logs).includes(process.env.VERTEX_API_KEY!));
    });
  await t.test('incomplete or malformed AI results never become a partial cost estimate', async (ct) => {
    ct.mock.method(console, 'error', () => {});
    ct.mock.method(globalThis, 'fetch', async () =>
      Response.json({ candidates: [{ content: { parts: [{ text: '{"dishes":[]}' }] } }] }),
    );
    await assert.rejects(
      service.estimate(input),
      (error: any) => error.getResponse().code === 'WEEKLY_BUDGET_AI_ERROR',
    );
  });
  await t.test('unknown recipes and database failures stop before calling the paid provider', async (ct) => {
    ct.mock.method(globalThis, 'fetch', async () => {
      throw new Error('Unexpected provider call');
    });
    await assert.rejects(
      service.estimate({ ...input, entries: [{ recipeId: 'missing', servings: 2 }] }),
      (error: any) => error.getResponse().code === 'RECIPE_UNAVAILABLE',
    );
    const failure = new Error('database-unavailable');
    await assert.rejects(
      new WeeklyBudgetService({
        all: async () => {
          throw failure;
        },
      } as unknown as Catalog).estimate(input),
      (error) => error === failure,
    );
  });
  await t.test('missing configuration never produces a sample price', async () => {
    delete process.env.VERTEX_API_KEY;
    delete process.env.VERTEX_PROJECT_ID;
    delete process.env.GOOGLE_CLOUD_PROJECT;
    await assert.rejects(
      service.estimate(input),
      (error: any) => error.getResponse().code === 'AI_NOT_CONFIGURED',
    );
  });
});

test('weekly budget controller resolves its service and validates the request', async () => {
  class WeeklyBudgetTestModule {}
  Module({
    controllers: [WeeklyBudgetController],
    providers: [WeeklyBudgetService, { provide: Catalog, useValue: {} }],
  })(WeeklyBudgetTestModule);
  const app = await NestFactory.createApplicationContext(WeeklyBudgetTestModule, { logger: false });
  try {
    assert.ok(app.get(WeeklyBudgetService) instanceof WeeklyBudgetService);
    await assert.rejects(
      app.get(WeeklyBudgetController).estimate({ headers: {} } as Request, { entries: [] }),
      (error: any) => error.getStatus() === 400,
    );
  } finally {
    await app.close();
  }
});
