import type { MealEntry } from '@cookora/contracts';
import { addDays } from './date';

export type LocalEntry = Omit<MealEntry, 'recipe'> & { recipeId: string };
export type LocalWeek = { entries: LocalEntry[]; checked: Record<string, boolean> };
export const guestWeekStorageKey = 'cookora.guest-week-plans.document-v2';

export function mealSlotEntries<T extends { date: string; mealType: string }>(
  entries: readonly T[],
  date: string,
  mealType: string,
): T[] {
  return entries.filter((entry) => entry.date === date && entry.mealType === mealType);
}

/** Keep every saved dish in a meal, including older plans with many entries. */
export function readGuestWeeks(storage: Pick<Storage, 'getItem'>): Record<string, LocalWeek> {
  try {
    const data = JSON.parse(storage.getItem(guestWeekStorageKey) || '{}');
    const valid: Record<string, LocalWeek> = {};
    for (const [week, value] of Object.entries(data)) {
      const item = value as LocalWeek;
      if (/^\d{4}-\d{2}-\d{2}$/.test(week) && item && Array.isArray(item.entries)) {
        valid[week] = {
          entries: item.entries.filter(
            (e) =>
              e &&
              typeof e.id === 'string' &&
              typeof e.recipeId === 'string' &&
              typeof e.date === 'string' &&
              e.date >= week &&
              e.date <= addDays(week, 6) &&
              ['BREAKFAST', 'LUNCH', 'DINNER'].includes(e.mealType) &&
              Number.isInteger(e.servings) &&
              e.servings >= 1 &&
              e.servings <= 20,
          ),
          checked: item.checked && typeof item.checked === 'object' ? item.checked : {},
        };
      }
    }
    return valid;
  } catch {
    return {};
  }
}

export function saveLocalDishes(entries: LocalEntry[], additions: LocalEntry[], editId?: string) {
  if (editId) return entries.map((entry) => (entry.id === editId ? { ...additions[0], id: editId } : entry));
  return [...entries, ...additions];
}

export function fillEmptyMealSlots<T extends { date: string; mealType: string }>(
  existing: T[],
  proposals: T[],
): T[] {
  return [
    ...existing,
    ...proposals.filter((proposal) => !mealSlotEntries(existing, proposal.date, proposal.mealType).length),
  ];
}
