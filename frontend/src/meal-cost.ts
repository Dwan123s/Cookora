import type { Recipe } from '@cookora/contracts';
export type Price = {
  ingredientId: string;
  quantity: number;
  unit: string;
  price: number;
  updatedAt: string;
};
export type PriceBook = Price[];
export const isPriceBook = (value: unknown): value is PriceBook =>
  Array.isArray(value) &&
  value.length < 2000 &&
  value.every(
    (p) =>
      typeof p?.ingredientId === 'string' &&
      Number.isFinite(p.quantity) &&
      p.quantity > 0 &&
      ['g', 'kg', 'ml', 'l', 'piece'].includes(p.unit) &&
      Number.isFinite(p.price) &&
      p.price >= 0 &&
      typeof p.updatedAt === 'string',
  );
export function budgetResult(
  amount: number,
  mode: 'week' | 'day',
  days: number,
  people: number,
  meals: number,
) {
  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 100000000 ||
    !Number.isInteger(days) ||
    days < 1 ||
    days > 7 ||
    !Number.isInteger(people) ||
    people < 1 ||
    people > 20 ||
    !Number.isInteger(meals) ||
    meals < 1 ||
    meals > 4
  )
    return null;
  const total = mode === 'day' ? amount * days : amount;
  return { total, daily: total / days, meals: days * meals, perMeal: total / days / meals / people };
}
export function baseUnit(quantity: number, unit: string) {
  return {
    quantity: quantity * (unit === 'kg' || unit === 'l' ? 1000 : 1),
    unit: unit === 'kg' ? 'g' : unit === 'l' ? 'ml' : unit,
  };
}
export function recipeCost(recipe: Recipe, people: number, prices: PriceBook) {
  const grouped = new Map<
    string,
    { name: string; ingredientId: string; unit: string; quantity: number | null }
  >();
  for (const line of recipe.ingredients.filter((l) => !l.optional)) {
    const normalized = baseUnit(Number(line.quantity), line.unit);
    const key = `${line.ingredientId}:${normalized.unit}`;
    const quantity =
      line.quantity !== null &&
      Number.isFinite(Number(line.quantity)) &&
      Number(line.quantity) >= 0 &&
      recipe.baseServings > 0
        ? (normalized.quantity * people) / recipe.baseServings
        : null;
    const old = grouped.get(key);
    grouped.set(key, {
      name: line.name,
      ingredientId: line.ingredientId,
      unit: normalized.unit,
      quantity: old
        ? old.quantity === null || quantity === null
          ? null
          : old.quantity + quantity
        : quantity,
    });
  }
  const lines = [...grouped.values()].map((line) => {
    const price = prices.find(
      (p) => p.ingredientId === line.ingredientId && baseUnit(p.quantity, p.unit).unit === line.unit,
    );
    const pack = price ? baseUnit(price.quantity, price.unit) : null;
    const known = line.quantity !== null && !!price && !!pack && pack.quantity > 0;
    return {
      ...line,
      cost: known ? (line.quantity! / pack!.quantity) * price!.price : null,
      purchase: known ? Math.ceil(line.quantity! / pack!.quantity) * price!.price : null,
      price,
    };
  });
  const known = lines.filter((l) => l.cost !== null).length;
  const complete =
    lines.length > 0 && known === lines.length && Number.isInteger(people) && people >= 1 && people <= 20;
  return {
    lines,
    known,
    complete,
    usedTotal: lines.reduce((s, l) => s + (l.cost || 0), 0),
    purchaseTotal: lines.reduce((s, l) => s + (l.purchase || 0), 0),
    perPerson: complete ? lines.reduce((s, l) => s + l.cost!, 0) / people : null,
  };
}
