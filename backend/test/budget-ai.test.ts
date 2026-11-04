import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Request } from 'express';
import type { BudgetSuggestionInput, Recipe } from '@cookora/contracts';
import {
  BudgetAiController,
  BudgetAiService,
  BudgetInputSchema,
  budgetCandidates,
  buildBudgetPlan,
} from '../src/budget-ai';
import { Catalog } from '../src/catalog';

const input: BudgetSuggestionInput = {
  amount: 100000,
  mode: 'week',
  days: 2,
  people: 2,
  mealsPerDay: 1,
  region: 'Hà Nội',
  preferences: 'Ít cay',
};
const recipe = (id: string, overrides: Partial<Recipe> = {}): Recipe =>
  ({
    id,
    slug: id,
    title: id,
    cuisine: 'VN',
    category: 'Thịt & hải sản',
    baseServings: 2,
    ingredients: [
      {
        id: 'a',
        ingredientId: 'rice',
        name: 'Gạo',
        quantity: '0.2',
        unit: 'kg',
        optional: false,
        role: 'MAIN',
      },
      {
        id: 'b',
        ingredientId: 'salt',
        name: 'Muối',
        quantity: null,
        unit: 'g',
        optional: false,
        role: 'SEASONING',
      },
      {
        id: 'c',
        ingredientId: 'optional',
        name: 'Tỏi',
        quantity: '5',
        unit: 'g',
        optional: true,
        role: 'SEASONING',
      },
    ],
    steps: [{ id: 's', order: 1, title: 'Nấu', instruction: 'Nấu theo công thức.' }],
    ...overrides,
  }) as Recipe;
const recipes = [recipe('rice-and-egg'), recipe('tofu')];
const plan = (cost = 30000) => ({
  overview: 'Dùng chung gạo và rau giữa các bữa.',
  tips: ['Mua đủ phần ăn.'],
  meals: [1, 2].map((day) => ({
    day,
    meal: 1,
    dishes: [
      { recipeId: recipes[day - 1].id, estimatedCost: cost, reason: 'Món đơn giản, dùng nguyên liệu chung.' },
    ],
  })),
});
const modelResponse = (body: unknown) =>
  Response.json({
    candidates: [
      {
        content: {
          parts: [{ thought: true, text: 'Private internal reasoning' }, { text: JSON.stringify(body) }],
        },
      },
    ],
  });

test('budget totals are recalculated for the whole household and grocery quantities aggregate exactly', () => {
  const result = buildBudgetPlan(input, { ...plan(), estimatedTotal: 1, budget: 9999999 }, recipes);
  assert.equal(result.estimatedTotal, 60000);
  assert.equal(result.budget, 100000);
  assert.equal(result.remaining, 40000);
  assert.equal(result.withinBudget, true);
  assert.equal(result.meals[0].estimatedCost, 30000);
  assert.equal(result.shoppingList.find((i) => i.ingredientId === 'rice')?.quantity, '400');
  assert.equal(result.shoppingList.find((i) => i.ingredientId === 'rice')?.unit, 'g');
  assert.equal(result.shoppingList.find((i) => i.ingredientId === 'salt')?.quantity, null);
  assert.ok(!result.shoppingList.some((i) => i.ingredientId === 'optional'));
  assert.ok(result.priceNote.includes('chưa phải giá bán trực tiếp'));
  const scaled = buildBudgetPlan({ ...input, people: 1, mode: 'day', amount: 20000 }, plan(), recipes);
  assert.equal(scaled.budget, 40000);
  assert.equal(scaled.shoppingList.find((i) => i.ingredientId === 'rice')?.quantity, '200');
  assert.equal(scaled.withinBudget, false);
  assert.equal(scaled.remaining, -20000);
  assert.equal(scaled.estimatedTotal, 60000, 'Never cap an estimate to fit the budget');
});

test('rejects fake IDs, duplicate dishes or slots, incomplete schedules and invalid prices', () => {
  for (const alter of [
    (p: any) => {
      p.meals.pop();
    },
    (p: any) => {
      p.meals[1].day = 1;
    },
    (p: any) => {
      p.meals[1].day = 3;
    },
    (p: any) => {
      p.meals[0].dishes[0].recipeId = 'invented-id';
    },
    (p: any) => {
      p.meals[0].dishes.push(p.meals[0].dishes[0]);
    },
    (p: any) => {
      p.meals[0].dishes[0].estimatedCost = 0;
    },
    (p: any) => {
      p.meals[0].dishes[0].estimatedCost = -100;
    },
    (p: any) => {
      p.meals[0].dishes[0].estimatedCost = '30000';
    },
  ]) {
    const model = plan();
    alter(model);
    assert.throws(() => buildBudgetPlan(input, model, recipes));
  }
});

test('request validation rejects invalid and oversized settings and preserves zero manual-price dependency', () => {
  for (const patch of [
    { amount: 0 },
    { amount: 1.5 },
    { days: 8 },
    { days: 0 },
    { people: 21 },
    { mealsPerDay: 0 },
    { mode: 'month' },
    { preferences: 'x'.repeat(1201) },
    { region: 'x'.repeat(121) },
    { estimatedTotal: 1 },
  ])
    assert.equal(BudgetInputSchema.safeParse({ ...input, ...patch }).success, false);
  const valid = BudgetInputSchema.parse({ amount: 10000, mode: 'day', days: 1, people: 1, mealsPerDay: 1 });
  assert.equal(valid.region, 'Việt Nam');
  assert.equal(valid.preferences, '');
});

test('candidate selection includes varied cuisines and skips incomplete recipes without mutating catalog', () => {
  const records = [
    ...Array.from({ length: 30 }, (_, i) => recipe(`vn-${i}`)),
    recipe('japanese', { cuisine: 'JP' }),
    recipe('soup', { category: 'Canh' }),
    recipe('no-method', { steps: [] }),
  ];
  const before = records.map((r) => r.id);
  const selected = budgetCandidates(records, 6);
  assert.equal(selected.length, 6);
  assert.ok(selected.some((r) => r.id === 'japanese'));
  assert.ok(selected.some((r) => r.id === 'soup'));
  assert.ok(!selected.some((r) => r.id === 'no-method'));
  assert.deepEqual(
    records.map((r) => r.id),
    before,
  );
});

test('budget service uses real catalog candidates, key header and safe provider failures', async (ctx) => {
  const names = ['VERTEX_API_KEY', 'VERTEX_PROJECT_ID', 'GOOGLE_CLOUD_PROJECT', 'VERTEX_MODEL'];
  const saved = names.map((name) => [name, process.env[name]] as const);
  ctx.after(() => {
    for (const [name, value] of saved) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });
  const secret = 'budget-test-only-secret';
  process.env.VERTEX_API_KEY = secret;
  process.env.VERTEX_MODEL = 'gemini-3.7-flash';
  const service = new BudgetAiService({ all: async () => recipes } as Catalog);
  await ctx.test('sends the complete AI request through a mocked provider', async (t) => {
    t.mock.method(globalThis, 'fetch', async (url: string | URL | globalThis.Request, init?: RequestInit) => {
      assert.ok(String(url).includes('aiplatform.googleapis.com'));
      assert.ok(!String(url).includes(secret));
      assert.equal(new Headers(init?.headers).get('x-goog-api-key'), secret);
      const body = JSON.parse(String(init?.body));
      assert.ok(!String(init?.body).includes(secret));
      const prompt = JSON.parse(body.contents[0].parts[0].text);
      assert.equal(prompt.totalBudget, 100000);
      assert.equal(prompt.budgetPerMealForHousehold, 50000);
      assert.equal(prompt.budgetPerMealPerPerson, 25000);
      assert.equal(prompt.people, 2);
      assert.equal(prompt.mealsPerDay, 1);
      assert.deepEqual(
        prompt.catalogCandidates.map((r: any) => r.recipeId),
        recipes.map((r) => r.id),
      );
      assert.equal(body.generationConfig.responseMimeType, 'application/json');
      assert.ok(init?.signal);
      return modelResponse(plan());
    });
    assert.equal((await service.suggest(input)).meals.length, 2);
  });
  for (const status of [401, 403, 429, 500])
    await ctx.test(`safe HTTP ${status}`, async (t) => {
      const logs: unknown[] = [];
      t.mock.method(console, 'error', (...args: unknown[]) => logs.push(args));
      t.mock.method(globalThis, 'fetch', async () => new Response(`private data ${secret}`, { status }));
      await assert.rejects(service.suggest(input), (error: any) => {
        assert.equal(error.getStatus(), 503);
        assert.equal(error.getResponse().code, 'BUDGET_AI_ERROR');
        assert.ok(!JSON.stringify(error.getResponse()).includes(secret));
        return true;
      });
      assert.ok(!JSON.stringify(logs).includes(secret));
    });
  await ctx.test('rejects invalid model output instead of showing made-up results', async (t) => {
    t.mock.method(console, 'error', () => {});
    t.mock.method(globalThis, 'fetch', async () => modelResponse({ meals: [] }));
    await assert.rejects(
      service.suggest(input),
      (error: any) => error.getResponse().code === 'BUDGET_AI_ERROR',
    );
  });
  await ctx.test('database errors are preserved without calling AI', async (t) => {
    const failure = new Error('SQL unavailable');
    t.mock.method(globalThis, 'fetch', async () => {
      throw new Error('Unexpected call');
    });
    await assert.rejects(
      new BudgetAiService({
        all: async () => {
          throw failure;
        },
      } as unknown as Catalog).suggest(input),
      (error) => error === failure,
    );
  });
  await ctx.test('missing configuration never returns a demo', async () => {
    delete process.env.VERTEX_API_KEY;
    delete process.env.VERTEX_PROJECT_ID;
    delete process.env.GOOGLE_CLOUD_PROJECT;
    await assert.rejects(
      service.suggest(input),
      (error: any) => error.getResponse().code === 'AI_NOT_CONFIGURED',
    );
  });
});

test('budget controller dependency injection works under tsx and validates before calling the service', async () => {
  class BudgetTestModule {}
  Module({
    controllers: [BudgetAiController],
    providers: [BudgetAiService, { provide: Catalog, useValue: { all: async () => [] } }],
  })(BudgetTestModule);
  const app = await NestFactory.createApplicationContext(BudgetTestModule, { logger: false });
  try {
    assert.ok(app.get(BudgetAiService) instanceof BudgetAiService);
    await assert.rejects(
      app.get(BudgetAiController).suggest({ headers: {} } as Request, { ...input, days: 0 }),
      (error: any) => error.getStatus() === 400,
    );
  } finally {
    await app.close();
  }
});
