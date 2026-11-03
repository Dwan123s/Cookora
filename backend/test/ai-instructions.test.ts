import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AiChefService } from '../src/ai';
import { Catalog } from '../src/catalog';
import { detailedDish } from './ai-dish-fixture';

const emptyCatalog = { all: async () => [], ingredients: async () => [] } as unknown as Catalog;
const modelResponse = (dishes: unknown[]) =>
  Response.json({
    candidates: [
      {
        content: {
          parts: [
            {
              text: JSON.stringify({
                menuOverview: 'Các món từ trứng.',
                catalogSelections: [],
                dishes,
              }),
            },
          ],
        },
      },
    ],
  });

test('every generated dish receives detailed instructions, including later dishes in the same response', async (ctx) => {
  const savedKey = process.env.VERTEX_API_KEY;
  process.env.VERTEX_API_KEY = 'test-only-key';
  ctx.after(() => {
    if (savedKey === undefined) delete process.env.VERTEX_API_KEY;
    else process.env.VERTEX_API_KEY = savedKey;
  });
  let calls = 0;
  ctx.mock.method(globalThis, 'fetch', async (_input: unknown, init?: RequestInit) => {
    calls++;
    const body = JSON.parse(String(init?.body));
    const instructions = body.systemInstruction.parts[0].text;
    assert.ok(instructions.includes('MỌI món'));
    assert.ok(instructions.includes('mức lửa'));
    assert.ok(instructions.includes('dấu hiệu'));
    assert.ok(instructions.includes('không được vượt danh sách nguyên liệu'));
    if (calls === 1)
      return modelResponse([
        detailedDish(),
        { title: 'Trứng hấp nấm', steps: [{ order: 1, title: 'Nấu', instruction: 'Hấp trứng cho chín.' }] },
      ]);
    assert.equal(body.contents.at(-2).role, 'model');
    assert.ok(body.contents.at(-1).parts[0].text.includes('MỖI món'));
    return modelResponse([detailedDish(), detailedDish('Trứng hấp nấm')]);
  });
  const result = await new AiChefService(emptyCatalog).suggestRecipes('Tôi có trứng, cà chua, nấm.');
  assert.equal(calls, 2);
  assert.equal(result.dishes.length, 2);
  for (const dish of result.dishes) {
    assert.equal(dish.steps.length, 6);
    assert.deepEqual(
      dish.steps.map((step) => step.order),
      [1, 2, 3, 4, 5, 6],
    );
    assert.ok(dish.steps[0].instruction.includes('1 cm'));
    assert.ok(dish.steps[4].instruction.includes('lửa vừa nhỏ'));
    assert.ok(dish.steps[4].instruction.includes('10–12 phút'));
    assert.ok(dish.steps[4].instruction.includes('không còn lỏng'));
  }
});

test('a still-incomplete or discarded recipe after one repair is never presented as a complete recipe', async (ctx) => {
  const savedKey = process.env.VERTEX_API_KEY;
  process.env.VERTEX_API_KEY = 'test-only-key';
  ctx.after(() => {
    if (savedKey === undefined) delete process.env.VERTEX_API_KEY;
    else process.env.VERTEX_API_KEY = savedKey;
  });
  for (const dropDish of [false, true]) {
    let calls = 0;
    ctx.mock.method(console, 'error', () => {});
    ctx.mock.method(globalThis, 'fetch', async () => {
      calls++;
      return modelResponse(dropDish && calls === 2 ? [] : [{ title: 'Trứng hấp', steps: [] }]);
    });
    await assert.rejects(new AiChefService(emptyCatalog).suggestRecipes('Tôi có trứng'), (error: any) => {
      assert.equal(error.getStatus(), 503);
      assert.equal(error.getResponse().code, 'AI_RECIPE_INCOMPLETE');
      return true;
    });
    assert.equal(calls, 2);
  }
});
