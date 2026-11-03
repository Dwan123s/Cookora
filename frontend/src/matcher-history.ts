import type { AiChefSuggestionResponse, AiSuggestedDish, Recipe } from '@cookora/contracts';

export const matcherHistoryLimit = 10;
const maxStoredLength = 1_000_000;
export type MatcherInput = { prompt: string; servings: number };
export type MatcherEntry = MatcherInput & {
  id: string;
  savedAt: string;
  response: AiChefSuggestionResponse;
};
export type MatcherState = {
  version: 1;
  draft: MatcherInput;
  selectedId: string | null;
  history: MatcherEntry[];
};
export type MatcherStorage = Pick<Storage, 'getItem' | 'setItem'>;
export const emptyMatcherState = (): MatcherState => ({
  version: 1,
  draft: { prompt: '', servings: 2 },
  selectedId: null,
  history: [],
});
export const matcherStorageKey = (accountId: string | null) =>
  `cookora.matcher.v1:${accountId ? `user:${accountId}` : 'guest'}`;

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const strings = (value: Record<string, unknown>, fields: string[]) =>
  fields.every((key) => typeof value[key] === 'string');
const numbers = (value: Record<string, unknown>, fields: string[]) =>
  fields.every((key) => typeof value[key] === 'number' && Number.isFinite(value[key]));
const nullableString = (value: unknown) => value === null || typeof value === 'string';
const arrayOf = (value: unknown, check: (item: unknown) => boolean) =>
  Array.isArray(value) && value.length <= 200 && value.every(check);
function validInput(value: unknown): value is MatcherInput & Record<string, unknown> {
  return (
    record(value) &&
    typeof value.prompt === 'string' &&
    value.prompt.length <= 1000 &&
    typeof value.servings === 'number' &&
    Number.isInteger(value.servings) &&
    value.servings >= 1 &&
    value.servings <= 20
  );
}
function validDish(value: unknown): value is AiSuggestedDish {
  const ingredient = (item: unknown) =>
    record(item) &&
    strings(item, ['name', 'unit']) &&
    nullableString(item.quantity) &&
    (item.note === undefined || typeof item.note === 'string');
  return (
    record(value) &&
    strings(value, ['id', 'title', 'summary', 'cuisine', 'category', 'difficulty']) &&
    numbers(value, ['servings', 'prepMinutes', 'cookMinutes', 'totalMinutes']) &&
    arrayOf(value.usedIngredients, ingredient) &&
    arrayOf(value.pantryIngredientsNeeded, ingredient) &&
    arrayOf(
      value.steps,
      (step) => record(step) && numbers(step, ['order']) && strings(step, ['title', 'instruction']),
    )
  );
}
function validRecipe(value: unknown): value is Recipe {
  return (
    record(value) &&
    strings(value, [
      'id',
      'slug',
      'title',
      'summary',
      'cuisine',
      'category',
      'image',
      'imageCredit',
      'timingStatus',
      'preconditions',
      'difficulty',
      'contentStatus',
      'sourceUrl',
      'sourceName',
    ]) &&
    numbers(value, ['revision', 'baseServings']) &&
    ['prepMinutes', 'cookMinutes', 'waitMinutes', 'totalMinutes'].every(
      (key) => value[key] === null || (typeof value[key] === 'number' && Number.isFinite(value[key])),
    ) &&
    arrayOf(
      value.ingredients,
      (line) =>
        record(line) &&
        strings(line, ['id', 'ingredientId', 'name', 'unit', 'role']) &&
        nullableString(line.quantity) &&
        typeof line.optional === 'boolean',
    ) &&
    arrayOf(
      value.steps,
      (step) => record(step) && strings(step, ['id', 'title', 'instruction']) && numbers(step, ['order']),
    )
  );
}
function validResponse(value: unknown): value is AiChefSuggestionResponse {
  return (
    validInput(value) &&
    record(value) &&
    typeof value.menuOverview === 'string' &&
    arrayOf(
      value.parsedIngredients,
      (line) =>
        record(line) &&
        strings(line, ['name', 'original']) &&
        nullableString(line.quantity) &&
        nullableString(line.unit),
    ) &&
    arrayOf(value.dishes, validDish) &&
    arrayOf(
      value.catalogDishes,
      (item) => record(item) && typeof item.reason === 'string' && validRecipe(item.recipe),
    )
  );
}
function validEntry(value: unknown): value is MatcherEntry {
  return (
    validInput(value) &&
    record(value) &&
    typeof value.id === 'string' &&
    typeof value.savedAt === 'string' &&
    Number.isFinite(Date.parse(value.savedAt)) &&
    validResponse(value.response) &&
    value.response.prompt === value.prompt &&
    value.response.servings === value.servings
  );
}

export function readMatcherState(
  storage: MatcherStorage,
  key: string,
): { state: MatcherState; available: boolean } {
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return { state: emptyMatcherState(), available: false };
  }
  if (!raw || raw.length > maxStoredLength) return { state: emptyMatcherState(), available: true };
  try {
    const value: unknown = JSON.parse(raw);
    if (!record(value) || value.version !== 1 || !validInput(value.draft) || !Array.isArray(value.history))
      return { state: emptyMatcherState(), available: true };
    const history = value.history.filter(validEntry).slice(0, matcherHistoryLimit);
    const selectedId =
      typeof value.selectedId === 'string' && history.some((entry) => entry.id === value.selectedId)
        ? value.selectedId
        : null;
    return { state: { version: 1, draft: value.draft, history, selectedId }, available: true };
  } catch {
    return { state: emptyMatcherState(), available: true };
  }
}

export function addMatcherResult(
  state: MatcherState,
  response: AiChefSuggestionResponse,
  id: string,
  now = new Date(),
): MatcherState {
  const entry: MatcherEntry = {
    id,
    savedAt: now.toISOString(),
    prompt: response.prompt,
    servings: response.servings,
    response,
  };
  return {
    ...state,
    selectedId: id,
    history: [entry, ...state.history.filter((item) => item.id !== id)].slice(0, matcherHistoryLimit),
  };
}
export function restoreMatcherEntry(state: MatcherState, id: string): MatcherState {
  const entry = state.history.find((item) => item.id === id);
  return entry
    ? { ...state, selectedId: entry.id, draft: { prompt: entry.prompt, servings: entry.servings } }
    : state;
}
export function newMatcherDraft(state: MatcherState): MatcherState {
  return { ...state, draft: { prompt: '', servings: 2 }, selectedId: null };
}
export function writeMatcherState(storage: MatcherStorage, key: string, state: MatcherState): boolean {
  try {
    // Bound browser storage while preserving the current result and complete recipes.
    const stored = { ...state, history: state.history.slice(0, matcherHistoryLimit) };
    let json = JSON.stringify(stored);
    while (json.length > maxStoredLength && stored.history.length > 1) {
      const index = stored.history.map((item) => item.id !== stored.selectedId).lastIndexOf(true);
      if (index < 0) break;
      stored.history.splice(index, 1);
      json = JSON.stringify(stored);
    }
    if (json.length > maxStoredLength) return false;
    storage.setItem(key, json);
    return true;
  } catch {
    return false;
  }
}

export function createMatcherStore(storage: MatcherStorage | null, key: string) {
  const initial = storage ? readMatcherState(storage, key) : { state: emptyMatcherState(), available: false };
  let snapshot = { state: initial.state, saved: initial.available };
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    update(change: (previous: MatcherState) => MatcherState) {
      const state = change(snapshot.state);
      snapshot = { state, saved: Boolean(storage && writeMatcherState(storage, key, state)) };
      listeners.forEach((listener) => listener());
    },
  };
}
