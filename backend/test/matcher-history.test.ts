import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AiChefSuggestionResponse, Recipe } from '@cookora/contracts';
import {
  createMatcherStore,
  addMatcherResult,
  emptyMatcherState,
  matcherHistoryLimit,
  matcherStorageKey,
  newMatcherDraft,
  readMatcherState,
  restoreMatcherEntry,
  writeMatcherState,
  type MatcherStorage,
} from '../../frontend/src/matcher-history';

function memoryStorage(): MatcherStorage {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
  };
}
const recipe: Recipe = {
  id: 'catalog-egg',
  slug: 'trung-ca-chua',
  revision: 1,
  title: 'Trứng cà chua',
  summary: 'Món trứng',
  cuisine: 'VN',
  category: 'Món xào',
  image: '/images/eggs.webp',
  imageCredit: 'Cookora',
  baseServings: 2,
  prepMinutes: null,
  cookMinutes: null,
  waitMinutes: null,
  totalMinutes: null,
  timingStatus: 'ESTIMATED',
  preconditions: '',
  difficulty: 'Dễ',
  contentStatus: 'DRAFT',
  sourceUrl: '',
  sourceName: 'Cookora',
  ingredients: [
    {
      id: 'line-1',
      ingredientId: 'egg',
      name: 'Trứng',
      quantity: null,
      unit: 'quả',
      optional: false,
      role: 'MAIN',
    },
  ],
  steps: [{ id: 'step-1', order: 1, title: 'Nấu', instruction: 'Xào trứng với cà chua.' }],
};
const response: AiChefSuggestionResponse = {
  prompt: '2 quả trứng, cà chua',
  servings: 3,
  parsedIngredients: [{ name: 'Trứng', quantity: '2', unit: 'quả', original: '2 quả trứng' }],
  menuOverview: 'Làm trứng hấp.',
  catalogDishes: [{ recipe, reason: 'Có trứng và cà chua' }],
  dishes: [
    {
      id: 'new-egg',
      title: 'Trứng hấp cà chua',
      summary: 'Trứng hấp mềm',
      cuisine: 'VN',
      category: 'Món hấp',
      servings: 3,
      prepMinutes: 5,
      cookMinutes: 10,
      totalMinutes: 15,
      difficulty: 'Dễ',
      usedIngredients: [{ name: 'Trứng', quantity: '2', unit: 'quả', note: 'Đánh đều' }],
      pantryIngredientsNeeded: [{ name: 'Muối', quantity: null, unit: 'nhúm' }],
      steps: [
        { order: 1, title: 'Hấp', instruction: 'Cho trứng vào chén chịu nhiệt, đậy nắp và hấp 10 phút.' },
      ],
    },
  ],
};

test('matcher restores input, servings, catalog and full AI instructions after leaving/reloading', () => {
  const storage = memoryStorage(),
    key = matcherStorageKey('user-a');
  const draft = { ...emptyMatcherState(), draft: { prompt: response.prompt, servings: response.servings } };
  const completed = addMatcherResult(draft, response, 'first', new Date('2026-11-03T12:00:00Z'));
  assert.equal(writeMatcherState(storage, key, completed), true);
  const restored = readMatcherState(storage, key).state;
  assert.deepEqual(restored, completed);
  assert.equal(
    restored.history[0].response.dishes[0].steps[0].instruction,
    response.dishes[0].steps[0].instruction,
  );
  assert.equal(restored.history[0].response.catalogDishes[0].recipe.ingredients[0].quantity, null);
});
test('editing input or starting over keeps saved recipes and lets the user reopen a previous suggestion', () => {
  let state = addMatcherResult(emptyMatcherState(), response, 'old');
  state = { ...state, draft: { prompt: 'Thịt và rau', servings: 4 } };
  assert.equal(state.history[0].response.prompt, response.prompt);
  state = newMatcherDraft(state);
  assert.equal(state.selectedId, null);
  assert.equal(state.draft.prompt, '');
  assert.equal(state.history.length, 1);
  state = restoreMatcherEntry(state, 'old');
  assert.equal(state.draft.prompt, response.prompt);
  assert.equal(state.draft.servings, 3);
  assert.equal(state.selectedId, 'old');
});
test('keeps the ten most recent successful generations with their original inputs', () => {
  let state = emptyMatcherState();
  for (let i = 0; i < 15; i++)
    state = addMatcherResult(state, { ...response, prompt: `Trứng ${i}` }, `id-${i}`);
  assert.equal(state.history.length, matcherHistoryLimit);
  assert.equal(state.history[0].prompt, 'Trứng 14');
  assert.equal(state.history[9].prompt, 'Trứng 5');
  const storage = memoryStorage();
  writeMatcherState(storage, 'test', state);
  assert.deepEqual(readMatcherState(storage, 'test').state, state);
});
test('guest and different accounts have separate browser histories; drafts save before generating', () => {
  const storage = memoryStorage();
  const state = { ...emptyMatcherState(), draft: { prompt: 'Đậu hũ', servings: 5 } };
  writeMatcherState(storage, matcherStorageKey('user-a'), state);
  assert.deepEqual(readMatcherState(storage, matcherStorageKey('user-a')).state.draft, state.draft);
  assert.equal(readMatcherState(storage, matcherStorageKey('user-b')).state.draft.prompt, '');
  assert.equal(readMatcherState(storage, matcherStorageKey(null)).state.draft.prompt, '');
});
test('invalid browser data, outdated versions and malformed nested dishes cannot crash the page', () => {
  const storage = memoryStorage();
  for (const raw of ['{', 'null', JSON.stringify({ version: 2 }), 'x'.repeat(1_000_001)]) {
    storage.setItem('test', raw);
    assert.deepEqual(readMatcherState(storage, 'test').state, emptyMatcherState());
  }
  const state = addMatcherResult(emptyMatcherState(), response, 'bad');
  storage.setItem(
    'test',
    JSON.stringify({
      ...state,
      history: [{ ...state.history[0], response: { ...response, dishes: [{ title: 'Broken' }] } }],
    }),
  );
  const read = readMatcherState(storage, 'test');
  assert.equal(read.state.history.length, 0);
  assert.equal(read.state.selectedId, null);
});
test('blocked storage or full quota reports failure and preserves the previous saved result', () => {
  const state = addMatcherResult(emptyMatcherState(), response, 'saved');
  const storage = memoryStorage();
  writeMatcherState(storage, 'test', state);
  const quota: MatcherStorage = {
    getItem: storage.getItem,
    setItem: () => {
      throw new Error('Quota exceeded');
    },
  };
  assert.equal(writeMatcherState(quota, 'test', newMatcherDraft(state)), false);
  assert.equal(readMatcherState(storage, 'test').state.selectedId, 'saved');
  const blocked: MatcherStorage = {
    getItem: () => {
      throw new Error('Blocked');
    },
    setItem: quota.setItem,
  };
  assert.equal(readMatcherState(blocked, 'test').available, false);
  assert.equal(writeMatcherState(blocked, 'test', state), false);
});

test('a generation completing after navigation updates the returning page without overwriting its draft', () => {
  const storage = memoryStorage();
  const store = createMatcherStore(storage, 'test');
  let notifications = 0;
  const leave = store.subscribe(() => notifications++);
  store.update((previous) => ({ ...previous, draft: { prompt: response.prompt, servings: 3 } }));
  leave();
  store.update((previous) => ({ ...previous, draft: { prompt: 'Đang nhập một yêu cầu mới', servings: 2 } }));
  const back = store.subscribe(() => notifications++);
  store.update((previous) => addMatcherResult(previous, response, 'completed-in-background'));
  assert.equal(notifications, 2);
  assert.equal(store.getSnapshot().state.draft.prompt, 'Đang nhập một yêu cầu mới');
  assert.equal(store.getSnapshot().state.history[0].response.dishes[0].title, 'Trứng hấp cà chua');
  assert.deepEqual(createMatcherStore(storage, 'test').getSnapshot(), store.getSnapshot());
  back();
  const blocked = createMatcherStore(null, 'blocked');
  blocked.update((previous) => addMatcherResult(previous, response, 'memory-only'));
  assert.equal(blocked.getSnapshot().saved, false);
  assert.equal(blocked.getSnapshot().state.history.length, 1);
});

test('large histories are bounded without truncating the selected recipe instructions', () => {
  const storage = memoryStorage();
  let state = emptyMatcherState();
  for (let i = 0; i < 7; i++) {
    state = addMatcherResult(state, { ...response, menuOverview: 'x'.repeat(200000) }, `large-${i}`);
  }
  state = restoreMatcherEntry(state, 'large-0');
  assert.equal(writeMatcherState(storage, 'test', state), true);
  assert.ok(storage.getItem('test')!.length <= 1_000_000);
  const restored = readMatcherState(storage, 'test').state;
  assert.equal(restored.selectedId, 'large-0');
  const selected = restored.history.find((entry) => entry.id === restored.selectedId)!;
  assert.equal(selected.response.menuOverview.length, 200000);
  assert.equal(selected.response.dishes[0].steps[0].instruction, response.dishes[0].steps[0].instruction);
  assert.ok(restored.history.length < 7);
});
