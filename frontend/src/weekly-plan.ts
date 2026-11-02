import type { MealEntry } from '@cookora/contracts';

export type GroceryRow = {
  id: string;
  ingredientId: string;
  name: string;
  unit: string;
  quantity: string | null;
  purchased: boolean;
};

export function weeklyGroceries(entries: MealEntry[]): GroceryRow[] {
  const rows = new Map<string, GroceryRow & { amount: number; unknown: boolean; priority: number }>();
  for (const entry of entries) {
    for (const line of entry.recipe.ingredients.filter((item) => !item.optional)) {
      const unit = line.unit === 'kg' ? 'g' : line.unit === 'l' ? 'ml' : line.unit;
      const multiplier = line.unit === 'kg' || line.unit === 'l' ? 1000 : 1;
      const key = `${line.ingredientId}:${unit}`;
      const row = rows.get(key) || {
        id: key,
        ingredientId: line.ingredientId,
        name: line.name,
        unit,
        quantity: null,
        purchased: false,
        amount: 0,
        unknown: false,
        priority: line.role === 'MAIN' ? 0 : line.role === 'SUPPORTING' ? 1 : 2,
      };
      const amount = line.quantity === null ? NaN : Number(line.quantity);
      if (Number.isFinite(amount))
        row.amount += Math.round(((amount * multiplier * entry.servings) / entry.recipe.baseServings) * 1000);
      else row.unknown = true;
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

export function groceryAmount(row: Pick<GroceryRow, 'quantity' | 'unit' | 'name'>) {
  if (row.quantity === null) return 'Chưa rõ lượng';
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

// Illustrative local unit prices, not live market quotations. Missing prices stay unknown.
const samplePrices: Record<string, { unit: string; price: number }> = {
  egg: { unit: 'piece', price: 3500 },
  tomato: { unit: 'g', price: 25 },
  'tofu-firm': { unit: 'g', price: 35 },
  'chicken-thigh': { unit: 'g', price: 100 },
  'cooked-rice': { unit: 'g', price: 20 },
  scallion: { unit: 'g', price: 45 },
  garlic: { unit: 'g', price: 60 },
  onion: { unit: 'g', price: 25 },
  kimchi: { unit: 'g', price: 70 },
  spaghetti: { unit: 'g', price: 60 },
  oil: { unit: 'ml', price: 45 },
  'soy-sauce': { unit: 'ml', price: 35 },
  sugar: { unit: 'g', price: 25 },
  salt: { unit: 'g', price: 10 },
  water: { unit: 'ml', price: 0 },
};
export function weeklyEstimate(rows: GroceryRow[]) {
  let total = 0,
    known = 0;
  for (const row of rows) {
    const price = samplePrices[row.ingredientId];
    if (price && price.unit === row.unit && row.quantity !== null) {
      total += Number(row.quantity) * price.price;
      known++;
    }
  }
  return { total: Math.round(total), known, missing: rows.length - known };
}
