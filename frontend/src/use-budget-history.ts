import { useSyncExternalStore } from 'react';
import { budgetHistoryKey, createBudgetStore } from './budget-history';

const stores = new Map<string, ReturnType<typeof createBudgetStore>>();
export function useBudgetHistory(userId: string | null) {
  const key = budgetHistoryKey(userId);
  let store = stores.get(key);
  if (!store) {
    let storage: Storage | null = null;
    try {
      storage = window.localStorage;
    } catch {
      /* Storage may be disabled. */
    }
    store = createBudgetStore(storage, key);
    stores.set(key, store);
  }
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return { ...snapshot, update: store.update };
}
