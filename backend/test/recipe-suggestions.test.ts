import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Ingredient, Recipe, RecipeLine } from '@cookora/contracts';
import { Catalog } from '../src/catalog';
import { AiChefService } from '../src/ai';
import { detailedDish } from './ai-dish-fixture';
import { suggestFromCatalog } from '../src/recipe-suggestions';

const ingredients: Ingredient[] = [
  { id: 'egg', name: 'Trứng', aliases: ['trứng gà'], unit: 'piece', category: 'PROTEIN' },
  { id: 'tomato', name: 'Cà chua', aliases: [], unit: 'g', category: 'VEGETABLE' },
  { id: 'chicken', name: 'Thịt gà', aliases: ['gà'], unit: 'g', category: 'PROTEIN' },
  { id: 'tofu', name: 'Đậu hũ', aliases: ['đậu phụ'], unit: 'g', category: 'PROTEIN' },
  { id: 'salt', name: 'Muối', aliases: [], unit: 'g', category: 'SEASONING' },
];
const line = (ingredientId: string, role: RecipeLine['role'] = 'MAIN', optional = false): RecipeLine => ({
  id: ingredientId,
  ingredientId,
  name: ingredients.find((item) => item.id === ingredientId)!.name,
  quantity: '100',
  unit: 'g',
  role,
  optional,
});
const recipe = (id: string, lines: RecipeLine[]): Recipe => ({
  id,
  slug: id,
  title: id,
  revision: 1,
  summary: '',
  cuisine: 'VN',
  category: 'Món chính',
  image: '',
  imageCredit: '',
  baseServings: 2,
  prepMinutes: 5,
  cookMinutes: 10,
  waitMinutes: 0,
  totalMinutes: 15,
  timingStatus: 'ESTIMATED',
  preconditions: '',
  difficulty: 'Dễ',
  contentStatus: 'DRAFT',
  sourceUrl: '',
  sourceName: '',
  ingredients: lines,
  steps: [],
});
const recipes = [
  recipe('egg-tomato', [line('egg'), line('tomato', 'SUPPORTING'), line('salt', 'SEASONING')]),
  recipe('chicken-salt', [line('chicken'), line('salt', 'SEASONING')]),
  recipe('tofu-egg-optional', [line('tofu'), line('egg', 'SUPPORTING', true)]),
];

test('catalog suggestions recognize Vietnamese aliases and prefer the longest ingredient phrase', () => {
  const result = suggestFromCatalog(recipes, ingredients, '2 qua trung ga, 200g ca chua, dau phu', 3);
  assert.deepEqual(result.recognizedIngredients.map((item) => item.id).sort(), ['egg', 'tofu', 'tomato']);
  assert.equal(result.servings, 3);
  assert.equal(result.matches[0].recipe.id, 'tofu-egg-optional');
  assert.equal(
    result.matches.some((item) => item.recipe.id === 'chicken-salt'),
    false,
  );
  const eggMatch = result.matches.find((item) => item.recipe.id === 'egg-tomato')!;
  assert.ok(result.matches[0].score > eggMatch.score);
  assert.equal(eggMatch.canCookConfirmed, false);
  assert.equal(eggMatch.missing[0].quantity, '150');
});

test('catalog suggestions do not match ingredient fragments or unknown text', () => {
  const result = suggestFromCatalog(recipes, ingredients, 'galangal, muoidiem, nguyên liệu lạ', 2);
  assert.deepEqual(result.recognizedIngredients, []);
  assert.deepEqual(result.matches, []);
});

test('catalog suggestions ignore explicitly unavailable ingredients', () => {
  const result = suggestFromCatalog(recipes, ingredients, 'Không có thịt gà, hết trứng, có đậu hũ', 2);
  assert.deepEqual(
    result.recognizedIngredients.map((item) => item.id),
    ['tofu'],
  );
  assert.deepEqual(
    result.matches.map((item) => item.recipe.id),
    ['tofu-egg-optional'],
  );
});

test('seasoning and optional ingredients alone cannot produce a recommended recipe', () => {
  assert.deepEqual(suggestFromCatalog(recipes, ingredients, 'Muối', 2).matches, []);
  const result = suggestFromCatalog(recipes, ingredients, 'Trứng', 2);
  assert.deepEqual(
    result.matches.map((item) => item.recipe.id),
    ['egg-tomato'],
  );
});

test('one AI request receives catalog context and returns real catalog recipes plus new dishes', async (ctx) => {
  const savedKey = process.env.VERTEX_API_KEY;
  process.env.VERTEX_API_KEY = 'test-only-key';
  ctx.after(() => {
    if (savedKey === undefined) delete process.env.VERTEX_API_KEY;
    else process.env.VERTEX_API_KEY = savedKey;
  });
  const catalog = {
    all: async () => [recipes[0]],
    ingredients: async () => ingredients,
  } as unknown as Catalog;
  let calls = 0;
  ctx.mock.method(globalThis, 'fetch', async (_input: unknown, init?: RequestInit) => {
    calls++;
    const request = JSON.parse(String(init?.body));
    const text = request.contents[0].parts[0].text;
    assert.ok(text.includes('3 quả trứng, 2 cà chua'));
    assert.ok(text.includes('"recipeId":"egg-tomato"'));
    assert.ok(!text.includes('"recipeId":"chicken-salt"'));
    assert.ok(request.systemInstruction.parts[0].text.includes('Đồng thời đề xuất'));
    return Response.json({
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  parsedIngredients: [],
                  menuOverview: 'Ưu tiên món trong kho, thêm món mới.',
                  catalogSelections: [
                    { recipeId: 'invented-id', reason: 'Không hợp lệ' },
                    {
                      recipeId: 'egg-tomato',
                      reason: 'Tận dụng trứng và cà chua',
                      title: 'AI tried to rewrite the recipe',
                    },
                    { recipeId: 'egg-tomato', reason: 'Lặp lại' },
                  ],
                  dishes: [
                    null,
                    { title: 'egg-tomato' },
                    detailedDish('Trứng hấp cà chua'),
                    detailedDish('trung hap ca chua'),
                  ],
                }),
              },
            ],
          },
        },
      ],
    });
  });
  const result = await new AiChefService(catalog).suggestRecipes('3 quả trứng, 2 cà chua', 2);
  assert.equal(calls, 1);
  assert.deepEqual(result.catalogDishes, [{ recipe: recipes[0], reason: 'Tận dụng trứng và cà chua' }]);
  assert.deepEqual(
    result.dishes.map((dish) => dish.title),
    ['Trứng hấp cà chua'],
  );
});

test('an empty catalog still returns AI dishes without fabricated catalog entries', async (ctx) => {
  const savedKey = process.env.VERTEX_API_KEY;
  process.env.VERTEX_API_KEY = 'test-only-key';
  ctx.after(() => {
    if (savedKey === undefined) delete process.env.VERTEX_API_KEY;
    else process.env.VERTEX_API_KEY = savedKey;
  });
  const catalog = { all: async () => [], ingredients: async () => ingredients } as unknown as Catalog;
  ctx.mock.method(globalThis, 'fetch', async () =>
    Response.json({
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  catalogSelections: [{ recipeId: 'egg-tomato', reason: 'Not in the provided catalog' }],
                  dishes: [detailedDish('Trứng hấp')],
                }),
              },
            ],
          },
        },
      ],
    }),
  );
  const result = await new AiChefService(catalog).suggestRecipes('trứng');
  assert.deepEqual(result.catalogDishes, []);
  assert.equal(result.dishes[0].title, 'Trứng hấp');
});

test('follow-up chat sends prior turns and retrieves catalog ingredients from conversation context', async (ctx) => {
  const savedKey = process.env.VERTEX_API_KEY;
  process.env.VERTEX_API_KEY = 'test-only-key';
  ctx.after(() => {
    if (savedKey === undefined) delete process.env.VERTEX_API_KEY;
    else process.env.VERTEX_API_KEY = savedKey;
  });
  const catalog = { all: async () => recipes, ingredients: async () => ingredients } as unknown as Catalog;
  ctx.mock.method(globalThis, 'fetch', async (_input: unknown, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body));
    assert.equal(body.contents.length, 3);
    assert.equal(body.contents[0].role, 'user');
    assert.equal(body.contents[0].parts[0].text, 'Tôi có trứng và cà chua');
    assert.equal(body.contents[1].role, 'model');
    assert.equal(body.contents[1].parts[0].text, 'Bạn có thể nấu trứng xào cà chua.');
    assert.ok(body.contents[2].parts[0].text.includes('Làm ít dầu hơn nhé'));
    assert.ok(body.contents[2].parts[0].text.includes('"recipeId":"egg-tomato"'));
    assert.ok(!body.contents[2].parts[0].text.includes('"recipeId":"chicken-salt"'));
    return Response.json({
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  menuOverview: 'Bạn có thể dùng chảo chống dính và giảm lượng dầu.',
                  catalogSelections: [],
                  dishes: [],
                }),
              },
            ],
          },
        },
      ],
    });
  });
  const result = await new AiChefService(catalog).suggestRecipes('Làm ít dầu hơn nhé', 2, [
    { role: 'user', content: 'Tôi có trứng và cà chua' },
    { role: 'assistant', content: 'Bạn có thể nấu trứng xào cà chua.' },
  ]);
  assert.ok(result.menuOverview.includes('giảm lượng dầu'));
  assert.deepEqual(result.dishes, []);
});
