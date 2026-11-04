import type { MealEntry, MealPlan, Recipe } from '@cookora/contracts';
import { request } from './api';
import { weekOf } from './date';

export type GroceryRow = {
  id: string;
  ingredientId: string;
  name: string;
  unit: string;
  quantity: string | null;
  displayQuantity?: string;
  purchased: boolean;
};

export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function parseIngredientName(rawName: string) {
  const trimmed = rawName.trim();
  const match = trimmed.match(
    /^(1 ít|ít|chút|vài tép|vài nhánh|vài lát|vài củ|vài quả|nửa củ|nửa quả|1 củ|1 quả|1 bó|1 nắm|1 nhúm|1 lạng)\s+(.+)$/i,
  );
  const clean = match ? match[2].trim() : trimmed;
  return {
    extracted: match ? match[1] : null,
    cleanName: capitalizeFirst(clean),
  };
}

export function estimateStandardQuantity(
  name: string,
  role?: string,
  servings = 2,
  baseServings = 2,
): string {
  const n = name.toLowerCase();
  const ratio = Math.max(0.5, servings / (baseServings || 2));

  // 1. Gia vị nêm nếm & chất tạo vị
  if (
    /hạt nêm|bột nêm|bột canh|muối|đường|mì chính|bột ngọt|tiêu|hạt tiêu|ớt bột|ngũ vị hương|dầu ăn|mỡ heo|mỡ lợn|nước mắm|xì dầu|nước tương|dầu hào|giấm|mẻ|sa tế|mắm tôm|mắm tép|mắm nêm/i.test(
      n,
    ) ||
    role === 'SEASONING'
  ) {
    return 'Vừa đủ';
  }

  // 2. Rau thơm & gia vị tươi (hành tỏi ớt gừng sả)
  if (/tỏi|tỏi băm|tỏi khô/i.test(n)) {
    const cloves = Math.max(2, Math.round(3 * ratio));
    return `${cloves} tép`;
  }
  if (/hành khô|hành tím/i.test(n)) {
    const qty = Math.max(1, Math.round(2 * ratio));
    return `${qty} củ`;
  }
  if (/gừng|riềng|nghệ/i.test(n)) {
    return '1 nhánh';
  }
  if (/sả|sả băm/i.test(n)) {
    const qty = Math.max(1, Math.round(2 * ratio));
    return `${qty} cây`;
  }
  if (/ớt|ớt hiểm|ớt sừng/i.test(n)) {
    const qty = Math.max(1, Math.round(1 * ratio));
    return `${qty} quả`;
  }
  if (/hành lá|ngò|rau mùi|thì là|rau răm|húng|lá lốt|kinh giới|tía tô/i.test(n)) {
    return '1 nắm nhỏ';
  }

  // 3. Rau ăn lá, ngọn rau
  if (
    /su su|ngọn su su|rau muống|rau cải|cải ngọt|cải thìa|cải xanh|mồng tơi|rau ngót|rau dền|rau đay|xà lách|cải cúc|bó xôi/i.test(
      n,
    )
  ) {
    const bunches = Math.max(1, Math.round(1 * ratio));
    return `${bunches} bó`;
  }

  // 4. Củ quả rau củ quả
  if (/cà rốt|dưa chuột|dưa leo|cà chua/i.test(n)) {
    const count = Math.max(1, Math.round(2 * ratio));
    return `${count} quả`;
  }
  if (/củ cải|khoai tây|khoai lang|su hào/i.test(n)) {
    const count = Math.max(1, Math.round(1 * ratio));
    return `${count} củ`;
  }
  if (/bí xanh|bí đỏ|mướp|bầu/i.test(n)) {
    return '1 quả nhỏ';
  }

  // 5. Trứng, đậu phụ
  if (/trứng/i.test(n)) {
    const eggs = Math.max(1, Math.round(2 * ratio));
    return `${eggs} quả`;
  }
  if (/đậu phụ|đậu hũ|tàu hũ/i.test(n)) {
    const pieces = Math.max(1, Math.round(2 * ratio));
    return `${pieces} bìa`;
  }

  // 6. Thịt, cá, hải sản chính
  if (/thịt|sườn|bò|lợn|heo|gà|vịt|cá|tôm|mực|bạch tuộc|nghêu|sò/i.test(n)) {
    const grams = Math.round(150 * (servings || 2));
    return grams >= 1000 ? `${(grams / 1000).toFixed(1)} kg` : `${grams} g`;
  }

  // 7. Mặc định
  return 'Vừa đủ';
}

export function weeklyGroceries(entries: MealEntry[]): GroceryRow[] {
  const rows = new Map<string, GroceryRow & { amount: number; unknown: boolean; priority: number }>();
  for (const entry of entries) {
    for (const line of entry.recipe.ingredients.filter((item) => !item.optional)) {
      const parsed = parseIngredientName(line.name);
      const name = parsed.cleanName;
      const unit = line.unit === 'kg' ? 'g' : line.unit === 'l' ? 'ml' : line.unit;
      const multiplier = line.unit === 'kg' || line.unit === 'l' ? 1000 : 1;
      const key = `${line.ingredientId || name}:${unit}`;
      const row = rows.get(key) || {
        id: key,
        ingredientId: line.ingredientId,
        name,
        unit,
        quantity: null,
        displayQuantity: undefined,
        purchased: false,
        amount: 0,
        unknown: false,
        priority: line.role === 'MAIN' ? 0 : line.role === 'SUPPORTING' ? 1 : 2,
      };
      const amount = line.quantity === null ? NaN : Number(line.quantity);
      if (Number.isFinite(amount)) {
        row.amount += Math.round(((amount * multiplier * entry.servings) / entry.recipe.baseServings) * 1000);
      } else {
        row.unknown = true;
        if (!row.displayQuantity) {
          row.displayQuantity = estimateStandardQuantity(
            name,
            line.role,
            entry.servings,
            entry.recipe.baseServings,
          );
        }
      }
      rows.set(key, row);
    }
  }
  return [...rows.values()]
    .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name, 'vi'))
    .map(({ amount, unknown, priority: _priority, ...row }) => ({
      ...row,
      quantity: unknown ? null : String(amount / 1000),
    }));
}

export function groceryAmount(
  row: Pick<GroceryRow, 'quantity' | 'unit' | 'name'> & { displayQuantity?: string },
) {
  if (row.quantity === null) {
    return row.displayQuantity || estimateStandardQuantity(row.name);
  }
  let amount = Number(row.quantity),
    unit = row.unit;
  if (unit === 'g' && amount >= 1000) {
    amount /= 1000;
    unit = 'kg';
  }
  if (unit === 'ml' && amount >= 1000) {
    amount /= 1000;
    unit = 'l';
  }
  if (unit === 'piece') unit = /trứng|cà chua|chanh/i.test(row.name) ? 'quả' : 'cái';
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(amount)} ${unit}`;
}

export type EatFitSyncSlot = {
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  meal: { slug: string; title: string } | null;
};

export async function syncEatFitDayToMealPlan(
  date: string,
  meals: ({ slug: string; title: string } | null)[],
  recipeList: Recipe[],
  user?: { id: string } | null,
): Promise<MealPlan | null> {
  const week = weekOf(date);
  const slots: EatFitSyncSlot[] = [
    { type: 'BREAKFAST', meal: meals[0] || null },
    { type: 'LUNCH', meal: meals[1] || null },
    { type: 'DINNER', meal: meals[2] || null },
  ];

  if (!user) {
    const storageKey = 'cookora.guest-week-plans.document-v2';
    try {
      const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
      const weekData = data[week] || { entries: [], checked: {} };
      let entries = Array.isArray(weekData.entries) ? [...weekData.entries] : [];

      for (const { type, meal } of slots) {
        if (!meal) continue;
        const recipe = recipeList.find((r) => r.slug === meal.slug || r.title === meal.title);
        if (!recipe) continue;

        entries = entries.filter((e) => !(e.date === date && e.mealType === type));
        entries.push({
          id: crypto.randomUUID(),
          date,
          mealType: type,
          servings: 2,
          recipeId: recipe.id,
        });
      }

      data[week] = { ...weekData, entries };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      // ignore
    }
    return null;
  }

  try {
    let currentPlan: MealPlan = (
      await request<MealPlan>('/meal-plans', {
        method: 'POST',
        body: { weekStart: week },
      })
    ).data;

    for (const { type, meal } of slots) {
      if (!meal) continue;
      const recipe = recipeList.find((r) => r.slug === meal.slug || r.title === meal.title);
      if (!recipe) continue;

      const existing = currentPlan.entries.find((e) => e.date === date && e.mealType === type);

      if (existing) {
        if (existing.recipe.id !== recipe.id) {
          const res = await request<MealPlan>(`/meal-plans/${currentPlan.id}/entries/${existing.id}`, {
            method: 'PATCH',
            body: { recipeId: recipe.id, servings: 2, version: currentPlan.version },
          });
          currentPlan = res.data;
        }
      } else {
        const res = await request<MealPlan>(`/meal-plans/${currentPlan.id}/entries`, {
          method: 'POST',
          body: {
            date,
            mealType: type,
            recipeId: recipe.id,
            servings: 2,
            version: currentPlan.version,
            clientKey: crypto.randomUUID(),
          },
        });
        currentPlan = res.data;
      }
    }
    return currentPlan;
  } catch (err) {
    console.error('Failed to sync EatFit day to meal plan:', err);
    return null;
  }
}
