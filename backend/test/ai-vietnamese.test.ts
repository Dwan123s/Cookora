import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AiVietnameseError, ensureVietnameseAccents, needsVietnameseAccents } from '../src/ai-vietnamese';
import { AiChefService } from '../src/ai';
import type { Catalog } from '../src/catalog';
import { generateBudgetJson } from '../src/budget-provider';

const plain =
  'Thuc don gia dinh 2 nguoi duoc ket hop can doi gom mon man dam da tu kho Cookora va mot mon canh thanh mat nau moi.';
const accented =
  'Thực đơn gia đình 2 người được kết hợp cân đối gồm món mặn đậm đà từ kho Cookora và một món canh thanh mát nấu mới.';
const response = (value: unknown) =>
  Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(value) }] } }] });

test('recognizes the reported accentless paragraph and mixed text without rejecting correct Vietnamese or foreign names', () => {
  assert.equal(needsVietnameseAccents(plain), true);
  assert.equal(needsVietnameseAccents('Thực đơn gia dinh với rau và canh.'), true);
  for (const text of [
    accented,
    'Canh chua',
    'Rau',
    'Salad',
    'Tom Yum Goong',
    'Miso soup',
    '200 g',
    'Cơm gà, canh rau ngót',
  ])
    assert.equal(needsVietnameseAccents(text), false, text);
});

test('repairs only generated prose while preserving IDs, original user text, amounts and recipe structure', async () => {
  const input = {
    menuOverview: plain,
    parsedIngredients: [{ original: 'thuc don gia dinh', name: 'Cà chua' }],
    dishes: [
      {
        id: 'thuc don gia dinh',
        title: 'Trứng hấp',
        servings: 2,
        quantity: '200',
        steps: [{ instruction: 'Hấp trứng trên lửa vừa.' }],
      },
    ],
  };
  let calls = 0;
  const result = await ensureVietnameseAccents(input, async (_system, user) => {
    calls++;
    assert.deepEqual(JSON.parse(user), { texts: [{ id: 'text-0', text: plain }] });
    return { texts: [{ id: 'text-0', text: accented }] };
  });
  assert.equal(calls, 1);
  assert.deepEqual(result, { ...input, menuOverview: accented });
  assert.equal(input.menuOverview, plain);
});

test('already accented output makes no extra model call', async () => {
  const input = { overview: accented, explanation: 'Chi phí cho cả nhà.', tips: ['Nên mua theo mùa.'] };
  assert.equal(
    await ensureVietnameseAccents(input, async () => {
      throw Error('Must not call');
    }),
    input,
  );
});

test('rejects repair that changes numbers, invents wording, repeats accentless text or returns unknown/duplicate IDs', async () => {
  for (const raw of [
    { texts: [{ id: 'text-0', text: accented.replace('2 người', '3 người') }] },
    { texts: [{ id: 'text-0', text: accented + ' Thêm thịt.' }] },
    { texts: [{ id: 'text-0', text: plain }] },
    { texts: [{ id: 'unknown', text: accented }] },
    { texts: [] },
    {
      texts: [
        { id: 'text-0', text: accented },
        { id: 'text-0', text: accented },
      ],
    },
  ])
    await assert.rejects(
      ensureVietnameseAccents({ menuOverview: plain }, async () => raw),
      AiVietnameseError,
    );
});

test('chat restores accents once before returning menuOverview, even for unaccented user prompts', async (t) => {
  const previous = process.env.VERTEX_API_KEY;
  process.env.VERTEX_API_KEY = 'test-language-key';
  t.after(() => {
    if (previous === undefined) delete process.env.VERTEX_API_KEY;
    else process.env.VERTEX_API_KEY = previous;
  });
  const catalog = { all: async () => [], ingredients: async () => [] } as unknown as Catalog;
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (_url: unknown, init?: RequestInit) => {
    calls++;
    const body = JSON.parse(String(init?.body));
    if (calls === 1) {
      assert.ok(body.systemInstruction.parts[0].text.includes('tiếng Việt có đầy đủ dấu'));
      return response({ menuOverview: plain, dishes: [] });
    }
    assert.ok(body.systemInstruction.parts[0].text.includes('Chỉ thêm hoặc sửa dấu'));
    return response({ texts: [{ id: 'text-0', text: accented }] });
  });
  const result = await new AiChefService(catalog).suggestRecipes('thuc don gia dinh');
  assert.equal(result.menuOverview, accented);
  assert.equal(calls, 2);
});

test('persistent language failure returns a safe Vietnamese error instead of a bad answer or infinite retries', async (t) => {
  const previous = process.env.VERTEX_API_KEY;
  process.env.VERTEX_API_KEY = 'test-language-key';
  t.after(() => {
    if (previous === undefined) delete process.env.VERTEX_API_KEY;
    else process.env.VERTEX_API_KEY = previous;
  });
  const catalog = { all: async () => [], ingredients: async () => [] } as unknown as Catalog;
  let calls = 0;
  t.mock.method(console, 'error', () => {});
  t.mock.method(globalThis, 'fetch', async () =>
    response(
      ++calls === 1 ? { menuOverview: plain, dishes: [] } : { texts: [{ id: 'text-0', text: plain }] },
    ),
  );
  await assert.rejects(new AiChefService(catalog).suggestRecipes('thuc don gia dinh'), (error: any) => {
    assert.equal(error.getResponse().code, 'AI_RESPONSE_LANGUAGE');
    assert.ok(!JSON.stringify(error.getResponse()).includes('test-language-key'));
    return true;
  });
  assert.equal(calls, 2);
});

test('budget and weekly estimate provider share the same accent enforcement without changing any prices', async (t) => {
  const previous = process.env.VERTEX_API_KEY;
  process.env.VERTEX_API_KEY = 'test-language-key';
  t.after(() => {
    if (previous === undefined) delete process.env.VERTEX_API_KEY;
    else process.env.VERTEX_API_KEY = previous;
  });
  let calls = 0;
  const output = {
    explanation: plain,
    dishes: [{ recipeId: 'recipe-1', servings: 2, estimatedCost: 25000 }],
    tips: ['Nấu vừa đủ.'],
  };
  t.mock.method(globalThis, 'fetch', async (_url: unknown, init?: RequestInit) => {
    calls++;
    const body = JSON.parse(String(init?.body));
    if (calls === 1) {
      assert.ok(body.systemInstruction.parts[0].text.includes('tiếng Việt có đầy đủ dấu'));
      return response(output);
    }
    return response({ texts: [{ id: 'text-0', text: accented }] });
  });
  assert.deepEqual(await generateBudgetJson('Dự toán bữa ăn.', '{}'), { ...output, explanation: accented });
  assert.equal(calls, 2);
});
