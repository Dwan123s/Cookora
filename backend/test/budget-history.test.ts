import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { BudgetSuggestionInput, BudgetSuggestionResponse, Recipe } from '@cookora/contracts';
import { buildBudgetPlan } from '../src/budget-ai';
import {
  addBudgetResult,
  budgetHistoryKey,
  budgetInput,
  budgetSignature,
  checkBudgetItem,
  createBudgetStore,
  emptyBudgetHistory,
  isBudgetResponse,
  newBudgetDraft,
  restoreBudgetEntry,
} from '../../frontend/src/budget-history';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}
const input: BudgetSuggestionInput = {
  amount: 100000,
  mode: 'day',
  days: 2,
  people: 2,
  mealsPerDay: 1,
  region: 'Hà Nội',
  preferences: 'Ít cay',
};
const recipe: Recipe = {
  id: 'recipe-1',
  slug: 'trung-ca-chua',
  title: 'Trứng cà chua',
  summary: 'Món xào',
  image: '/recipes/egg.webp',
  imageCredit: 'Cookora',
  revision: 1,
  cuisine: 'VN',
  category: 'Món xào',
  baseServings: 2,
  prepMinutes: null,
  cookMinutes: null,
  waitMinutes: null,
  totalMinutes: null,
  timingStatus: 'ESTIMATED',
  preconditions: '',
  difficulty: 'Dễ',
  contentStatus: 'APPROVED',
  sourceUrl: '',
  sourceName: 'Cookora',
  ingredients: [],
  steps: [{ id: 'step-1', order: 1, title: 'Nấu', instruction: 'Xào cà chua rồi thêm trứng.' }],
};
function response(settings: BudgetSuggestionInput = input): BudgetSuggestionResponse {
  const meals = Array.from({ length: settings.days }, (_, day) =>
    Array.from({ length: settings.mealsPerDay }, (_, meal) => ({
      day: day + 1,
      meal: meal + 1,
      estimatedCost: 25000,
      dishes: [{ recipe, estimatedCost: 25000, reason: 'Dùng nguyên liệu sẵn có' }],
    })),
  ).flat();
  const budget = settings.amount * (settings.mode === 'day' ? settings.days : 1);
  const estimatedTotal = meals.length * 25000;
  return {
    input: settings,
    budget,
    meals,
    estimatedTotal,
    remaining: budget - estimatedTotal,
    withinBudget: estimatedTotal <= budget,
    overview: 'Hai bữa tiết kiệm',
    shoppingList: [
      { ingredientId: 'egg', name: 'Trứng', quantity: '4', unit: 'piece', note: '' },
      { ingredientId: 'salt', name: 'Muối', quantity: null, unit: 'g', note: 'Chưa rõ lượng' },
    ],
    tips: ['Kiểm tra giá trước khi mua'],
    priceNote: 'Giá AI ước tính, chưa phải giá bán trực tiếp.',
    generatedAt: '2026-11-04T12:00:00.000Z',
  };
}

test('budget draft and complete estimate survive a reload including prices, recipes and shopping checks', () => {
  const storage = memoryStorage(),
    key = budgetHistoryKey('account-a');
  const store = createBudgetStore(storage, key);
  store.update((state) => addBudgetResult(state, response(), 'first'));
  store.update((state) => restoreBudgetEntry(state, 'first'));
  store.update((state) => checkBudgetItem(state, 'first', 'egg:piece', true));
  const reloaded = createBudgetStore(storage, key).getSnapshot();
  assert.deepEqual(reloaded, store.getSnapshot());
  assert.deepEqual(budgetInput(reloaded.state.draft), input);
  assert.equal(reloaded.state.history[0].response.budget, 200000);
  assert.equal(reloaded.state.history[0].response.estimatedTotal, 50000);
  assert.equal(
    reloaded.state.history[0].response.meals[0].dishes[0].recipe.steps[0].instruction,
    recipe.steps[0].instruction,
  );
  assert.equal(reloaded.state.history[0].checked['egg:piece'], true);
  assert.equal(reloaded.state.history[0].response.shoppingList[1].quantity, null);
});
test('real backend budget responses round trip without losing totals or producing a false stale notice', () => {
  const plan = buildBudgetPlan(
    input,
    {
      overview: 'Dùng cùng nguyên liệu cho hai bữa',
      tips: [],
      meals: [1, 2].map((day) => ({
        day,
        meal: 1,
        dishes: [{ recipeId: recipe.id, estimatedCost: 25000, reason: 'Món tiết kiệm' }],
      })),
    },
    [recipe],
  );
  assert.equal(isBudgetResponse(plan), true);
  const storage = memoryStorage(),
    store = createBudgetStore(storage, 'real-response');
  store.update((state) => addBudgetResult(state, plan, 'real'));
  store.update((state) => restoreBudgetEntry(state, 'real'));
  const reloaded = createBudgetStore(storage, 'real-response').getSnapshot().state;
  assert.deepEqual(reloaded.history[0].response, plan);
  const signature = budgetSignature(budgetInput(reloaded.draft));
  assert.equal(signature, budgetSignature(plan.input));
  assert.equal(
    signature,
    budgetSignature({
      preferences: input.preferences,
      region: input.region,
      mealsPerDay: input.mealsPerDay,
      people: input.people,
      days: input.days,
      mode: input.mode,
      amount: input.amount,
    }),
  );
});
test('invalid unfinished amounts persist without deleting a successful estimate; starting over preserves history', () => {
  const storage = memoryStorage(),
    store = createBudgetStore(storage, 'draft');
  store.update((state) => addBudgetResult(state, response(), 'saved'));
  store.update((state) => ({
    ...state,
    draft: { ...state.draft, amounts: { day: '', week: '999999999999999' } },
  }));
  const restored = createBudgetStore(storage, 'draft').getSnapshot().state;
  assert.equal(restored.draft.amounts.day, '');
  assert.equal(restored.draft.amounts.week, '999999999999999');
  assert.equal(restored.history.length, 1);
  store.update(newBudgetDraft);
  assert.equal(store.getSnapshot().state.selectedId, null);
  store.update((state) => restoreBudgetEntry(state, 'saved'));
  assert.equal(store.getSnapshot().state.history.length, 1);
  assert.deepEqual(budgetInput(store.getSnapshot().state.draft), input);
});
test('ten estimates retain separate shopping checks and restore the settings used for each result', () => {
  const store = createBudgetStore(memoryStorage(), 'history');
  for (let i = 0; i < 12; i++)
    store.update((state) =>
      addBudgetResult(state, response({ ...input, amount: 100000 + i * 1000 }), `result-${i}`),
    );
  assert.equal(store.getSnapshot().state.history.length, 10);
  assert.equal(store.getSnapshot().state.history[0].id, 'result-11');
  store.update((state) => checkBudgetItem(state, 'result-2', 'egg:piece', true));
  store.update((state) => restoreBudgetEntry(state, 'result-2'));
  assert.equal(store.getSnapshot().state.draft.amounts.day, '102000');
  assert.equal(
    store.getSnapshot().state.history.find((entry) => entry.id === 'result-2')?.checked['egg:piece'],
    true,
  );
  assert.deepEqual(store.getSnapshot().state.history[0].checked, {});
});
test('guest and each account have separate histories without leaking prior results', () => {
  const storage = memoryStorage();
  const a = createBudgetStore(storage, budgetHistoryKey('account-a'));
  a.update((state) => addBudgetResult(state, response(), 'private-a'));
  assert.equal(
    createBudgetStore(storage, budgetHistoryKey('account-a')).getSnapshot().state.history.length,
    1,
  );
  assert.equal(
    createBudgetStore(storage, budgetHistoryKey('account-b')).getSnapshot().state.history.length,
    0,
  );
  assert.equal(createBudgetStore(storage, budgetHistoryKey(null)).getSnapshot().state.history.length, 0);
});
test('completion after leaving the page persists without overwriting a newly edited budget', () => {
  const storage = memoryStorage(),
    store = createBudgetStore(storage, 'navigation');
  let updates = 0;
  const leave = store.subscribe(() => updates++);
  leave();
  store.update((state) => ({ ...state, draft: { ...state.draft, people: 5 } }));
  const back = store.subscribe(() => updates++);
  store.update((state) => addBudgetResult(state, response(), 'background-result'));
  assert.equal(updates, 1);
  assert.equal(store.getSnapshot().state.draft.people, 5);
  assert.equal(store.getSnapshot().state.history[0].response.input.people, 2);
  assert.deepEqual(createBudgetStore(storage, 'navigation').getSnapshot(), store.getSnapshot());
  back();
});
test('corrupt histories, malformed nested records and inconsistent totals cannot become restored estimates', () => {
  const storage = memoryStorage();
  for (const value of ['{', 'null', JSON.stringify({ version: 99 }), 'x'.repeat(2000001)]) {
    storage.setItem('invalid', value);
    assert.equal(createBudgetStore(storage, 'invalid').getSnapshot().state.history.length, 0);
  }
  for (const alter of [
    (plan: any) => {
      plan.meals[0].dishes[0].recipe = null;
    },
    (plan: any) => {
      plan.meals[0].dishes[0].recipe.title = null;
    },
    (plan: any) => {
      plan.meals[0].estimatedCost = 1;
    },
    (plan: any) => {
      plan.remaining = 1;
    },
    (plan: any) => {
      plan.withinBudget = false;
    },
    (plan: any) => {
      plan.meals.pop();
    },
    (plan: any) => {
      plan.meals[1].day = 1;
    },
    (plan: any) => {
      plan.shoppingList[0].quantity = {};
    },
  ]) {
    const plan = structuredClone(response());
    alter(plan);
    assert.equal(isBudgetResponse(plan), false);
    storage.setItem(
      'invalid',
      JSON.stringify({
        ...emptyBudgetHistory(),
        selectedId: 'broken',
        history: [{ id: 'broken', savedAt: plan.generatedAt, response: plan, checked: {} }],
      }),
    );
    const state = createBudgetStore(storage, 'invalid').getSnapshot().state;
    assert.equal(state.selectedId, null);
    assert.equal(state.history.length, 0);
  }
});
test('storage failure preserves the visible result and previous on-disk estimate with an honest failure status', () => {
  const storage = memoryStorage();
  const original = createBudgetStore(storage, 'quota');
  original.update((state) => addBudgetResult(state, response(), 'saved-before'));
  const blocked = createBudgetStore(
    {
      getItem: storage.getItem,
      setItem: () => {
        throw new Error('Quota');
      },
    },
    'quota',
  );
  blocked.update((state) => addBudgetResult(state, response(), 'still-visible'));
  assert.equal(blocked.getSnapshot().saved, false);
  assert.equal(blocked.getSnapshot().state.selectedId, 'still-visible');
  assert.equal(createBudgetStore(storage, 'quota').getSnapshot().state.selectedId, 'saved-before');
  const unavailable = createBudgetStore(null, 'none');
  unavailable.update((state) => addBudgetResult(state, response(), 'memory-only'));
  assert.equal(unavailable.getSnapshot().saved, false);
  assert.equal(unavailable.getSnapshot().state.history.length, 1);
});
test('large histories prune older snapshots while preserving the selected full recipe', () => {
  const storage = memoryStorage(),
    store = createBudgetStore(storage, 'large');
  const plan = response();
  plan.meals[0].dishes[0].recipe = structuredClone(recipe);
  plan.meals[0].dishes[0].recipe.steps[0].instruction = 'Cách nấu đầy đủ. '.repeat(15000);
  for (let i = 0; i < 10; i++) store.update((state) => addBudgetResult(state, plan, `large-${i}`));
  assert.ok(storage.getItem('large')!.length <= 2000000);
  const snapshot = createBudgetStore(storage, 'large').getSnapshot();
  assert.equal(snapshot.state.selectedId, 'large-9');
  assert.equal(
    snapshot.state.history[0].response.meals[0].dishes[0].recipe.steps[0].instruction,
    plan.meals[0].dishes[0].recipe.steps[0].instruction,
  );
  assert.ok(snapshot.state.history.length < 10);
});
