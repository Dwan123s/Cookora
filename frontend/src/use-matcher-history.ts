import { useSyncExternalStore } from 'react';
import { createMatcherStore, matcherStorageKey, type MatcherStorage } from './matcher-history';

function browserStorage(): MatcherStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
// Keep active requests attached to the same store when the user leaves and returns.
const stores = new Map<string, ReturnType<typeof createMatcherStore>>();
export function useMatcherHistory(accountId: string | null) {
  const key = matcherStorageKey(accountId);
  let store = stores.get(key);
  if (!store) {
    store = createMatcherStore(browserStorage(), key);
    stores.set(key, store);
  }
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return { ...snapshot, update: store.update };
}
