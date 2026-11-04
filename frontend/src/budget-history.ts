import type { BudgetSuggestionInput, BudgetSuggestionResponse } from '@cookora/contracts';

export const budgetHistoryLimit = 10;
const maxLength = 2_000_000;
export type BudgetDraft = {
  mode: 'week' | 'day';
  amounts: { week: string; day: string };
  days: number;
  people: number;
  mealsPerDay: number;
  region: string;
  preferences: string;
};
export type BudgetHistoryEntry = {
  id: string;
  savedAt: string;
  response: BudgetSuggestionResponse;
  checked: Record<string, boolean>;
};
export type BudgetHistoryState = {
  version: 1;
  draft: BudgetDraft;
  selectedId: string | null;
  history: BudgetHistoryEntry[];
};
type Storage = { getItem(key: string): string | null; setItem(key: string, value: string): void };
export const budgetHistoryKey = (userId: string | null) =>
  `cookora.budget-history.v1:${userId ? `user:${userId}` : 'guest'}`;
export const defaultBudgetDraft = (): BudgetDraft => ({
  mode: 'week',
  amounts: { week: '300000', day: '50000' },
  days: 7,
  people: 1,
  mealsPerDay: 2,
  region: 'Việt Nam',
  preferences: '',
});
export const emptyBudgetHistory = (): BudgetHistoryState => ({
  version: 1,
  draft: defaultBudgetDraft(),
  selectedId: null,
  history: [],
});
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const integer = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
const text = (value: unknown, limit = 10000): value is string =>
  typeof value === 'string' && value.length <= limit;
const array = (value: unknown, max: number, check: (item: unknown) => boolean): value is unknown[] =>
  Array.isArray(value) && value.length <= max && value.every(check);
function validDraft(value: unknown): value is BudgetDraft {
  return (
    object(value) &&
    ['week', 'day'].includes(String(value.mode)) &&
    object(value.amounts) &&
    ['week', 'day'].every(
      (key) =>
        text((value.amounts as Record<string, unknown>)[key], 15) &&
        /^\d*$/.test(String((value.amounts as Record<string, unknown>)[key])),
    ) &&
    integer(value.days, 1, 7) &&
    integer(value.people, 1, 6) &&
    integer(value.mealsPerDay, 1, 4) &&
    text(value.region, 120) &&
    text(value.preferences, 1200)
  );
}
function validInput(value: unknown): value is BudgetSuggestionInput {
  return (
    object(value) &&
    integer(value.amount, 1000, 100000000) &&
    ['week', 'day'].includes(String(value.mode)) &&
    integer(value.days, 1, 7) &&
    integer(value.people, 1, 6) &&
    integer(value.mealsPerDay, 1, 4) &&
    text(value.region, 120) &&
    text(value.preferences, 1200)
  );
}
// Validate nested records used by the result UI before restoring untrusted browser data.
export function isBudgetResponse(value: unknown): value is BudgetSuggestionResponse {
  if (
    !object(value) ||
    !validInput(value.input) ||
    !text(value.overview) ||
    !text(value.priceNote) ||
    !text(value.generatedAt, 100) ||
    !Number.isFinite(Date.parse(value.generatedAt)) ||
    !array(value.tips, 20, (tip) => text(tip)) ||
    typeof value.withinBudget !== 'boolean' ||
    !integer(value.budget, 1000, 700000000) ||
    !integer(value.estimatedTotal, 0, 8400000000) ||
    !integer(value.remaining, -8400000000, 700000000)
  )
    return false;
  const input = value.input;
  if (
    value.budget !== input.amount * (input.mode === 'day' ? input.days : 1) ||
    value.remaining !== value.budget - value.estimatedTotal ||
    value.withinBudget !== value.remaining >= 0
  )
    return false;
  const slots = new Set<string>();
  if (
    !array(value.meals, 28, (meal) => {
      if (
        !object(meal) ||
        !integer(meal.day, 1, input.days) ||
        !integer(meal.meal, 1, input.mealsPerDay) ||
        !integer(meal.estimatedCost, 0, 300000000) ||
        !array(
          meal.dishes,
          3,
          (dish) =>
            object(dish) &&
            integer(dish.estimatedCost, 100, 100000000) &&
            text(dish.reason) &&
            object(dish.recipe) &&
            ['id', 'slug', 'title', 'image', 'imageCredit'].every((key) =>
              text((dish.recipe as Record<string, unknown>)[key]),
            ),
        )
      )
        return false;
      const key = `${meal.day}:${meal.meal}`;
      if (slots.has(key) || meal.dishes.length === 0) return false;
      slots.add(key);
      return (
        meal.estimatedCost ===
        meal.dishes.reduce<number>((sum, dish) => sum + (dish as { estimatedCost: number }).estimatedCost, 0)
      );
    }) ||
    value.meals.length !== input.days * input.mealsPerDay
  )
    return false;
  if (
    value.estimatedTotal !==
    value.meals.reduce<number>((sum, meal) => sum + (meal as { estimatedCost: number }).estimatedCost, 0)
  )
    return false;
  return array(
    value.shoppingList,
    1000,
    (item) =>
      object(item) &&
      ['ingredientId', 'name', 'unit', 'note'].every((key) => text(item[key])) &&
      (item.quantity === null || (text(item.quantity, 100) && /^\d+(?:\.\d+)?$/.test(item.quantity))),
  );
}
function validEntry(value: unknown): value is BudgetHistoryEntry {
  return (
    object(value) &&
    text(value.id, 100) &&
    value.id.length > 0 &&
    text(value.savedAt, 100) &&
    Number.isFinite(Date.parse(value.savedAt)) &&
    isBudgetResponse(value.response) &&
    object(value.checked) &&
    Object.entries(value.checked).length <= 1000 &&
    Object.entries(value.checked).every(([key, checked]) => key.length <= 300 && typeof checked === 'boolean')
  );
}
export function budgetInput(draft: BudgetDraft): BudgetSuggestionInput {
  return {
    amount: Number(draft.amounts[draft.mode]),
    mode: draft.mode,
    days: draft.days,
    people: draft.people,
    mealsPerDay: draft.mealsPerDay,
    region: draft.region.trim(),
    preferences: draft.preferences.trim(),
  };
}
export function budgetSignature(input: BudgetSuggestionInput): string {
  return JSON.stringify([
    input.amount,
    input.mode,
    input.days,
    input.people,
    input.mealsPerDay,
    input.region.trim(),
    input.preferences.trim(),
  ]);
}
export function addBudgetResult(
  state: BudgetHistoryState,
  response: BudgetSuggestionResponse,
  id: string,
): BudgetHistoryState {
  if (!isBudgetResponse(response)) throw new Error('Kết quả ước tính chưa hợp lệ để lưu.');
  return {
    ...state,
    selectedId: id,
    history: [
      { id, savedAt: response.generatedAt, response, checked: {} },
      ...state.history.filter((entry) => entry.id !== id),
    ].slice(0, budgetHistoryLimit),
  };
}
export function restoreBudgetEntry(state: BudgetHistoryState, id: string): BudgetHistoryState {
  const entry = state.history.find((item) => item.id === id);
  if (!entry) return state;
  const input = entry.response.input;
  return {
    ...state,
    selectedId: id,
    draft: {
      mode: input.mode,
      amounts: { ...state.draft.amounts, [input.mode]: String(input.amount) },
      days: input.days,
      people: input.people,
      mealsPerDay: input.mealsPerDay,
      region: input.region,
      preferences: input.preferences,
    },
  };
}
export function newBudgetDraft(state: BudgetHistoryState): BudgetHistoryState {
  return { ...state, draft: defaultBudgetDraft(), selectedId: null };
}
export function checkBudgetItem(
  state: BudgetHistoryState,
  id: string,
  key: string,
  checked: boolean,
): BudgetHistoryState {
  return {
    ...state,
    history: state.history.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            checked: { ...entry.checked, [key]: checked },
          }
        : entry,
    ),
  };
}
export function readBudgetHistory(storage: Storage | null, key: string) {
  const fallback = { state: emptyBudgetHistory(), saved: Boolean(storage) };
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    if (!raw || raw.length > maxLength) return fallback;
    const value: unknown = JSON.parse(raw);
    if (!object(value) || value.version !== 1 || !validDraft(value.draft) || !Array.isArray(value.history))
      return fallback;
    const history = value.history.filter(validEntry).slice(0, budgetHistoryLimit);
    const selectedId =
      typeof value.selectedId === 'string' && history.some((item) => item.id === value.selectedId)
        ? value.selectedId
        : null;
    return { state: { version: 1 as const, draft: value.draft, history, selectedId }, saved: true };
  } catch {
    return { ...fallback, saved: false };
  }
}
function fitHistory(state: BudgetHistoryState): BudgetHistoryState {
  const stored = { ...state, history: state.history.slice(0, budgetHistoryLimit) };
  while (JSON.stringify(stored).length > maxLength && stored.history.length > 1) {
    const index = stored.history.map((entry) => entry.id !== stored.selectedId).lastIndexOf(true);
    if (index < 0) break;
    stored.history.splice(index, 1);
  }
  return stored;
}
export function createBudgetStore(storage: Storage | null, key: string) {
  let snapshot = readBudgetHistory(storage, key);
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    update(change: (state: BudgetHistoryState) => BudgetHistoryState) {
      let state = change(snapshot.state);
      let saved = false;
      try {
        const bounded = fitHistory(state);
        let raw = JSON.stringify(bounded);
        if (storage && raw.length <= maxLength) {
          // If other features fill localStorage, retry with fewer older results.
          while (true) {
            try {
              storage.setItem(key, raw);
              state = bounded;
              saved = true;
              break;
            } catch {
              const index = bounded.history.map((entry) => entry.id !== bounded.selectedId).lastIndexOf(true);
              if (index < 0) break;
              bounded.history.splice(index, 1);
              raw = JSON.stringify(bounded);
            }
          }
        }
      } catch {
        /* Keep the in-memory result and report a storage failure. */
      }
      snapshot = { state, saved };
      listeners.forEach((listener) => listener());
    },
  };
}
