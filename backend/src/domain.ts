import Decimal from 'decimal.js';
import type { Recipe, RecipeLine, MatchItem, MatchResult, ScaledRecipe } from '@cookora/contracts';
export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
const units: Record<string, { base: string; factor: string }> = {
  g: { base: 'g', factor: '1' },
  kg: { base: 'g', factor: '1000' },
  ml: { base: 'ml', factor: '1' },
  l: { base: 'ml', factor: '1000' },
  piece: { base: 'piece', factor: '1' },
};
export function convert(value: string, from: string, to: string): Decimal | null {
  const a = units[from],
    b = units[to];
  if (!a || !b || a.base !== b.base) return null;
  return new Decimal(value).mul(a.factor).div(b.factor);
}
export const quantity = (d: Decimal) => d.toDecimalPlaces(6).toString();
export function scale(recipe: Recipe, servings: number): ScaledRecipe {
  const factor = new Decimal(servings).div(recipe.baseServings);
  return {
    recipeId: recipe.id,
    servings,
    lines: recipe.ingredients.map((l) => ({
      ...l,
      exactQuantity: l.quantity === null ? null : quantity(new Decimal(l.quantity).mul(factor)),
    })),
    warnings: [
      'Thời gian và nhiệt độ không tự nhân theo khẩu phần.',
      ...(recipe.contentStatus === 'DRAFT' ? ['Công thức mẫu chưa được Cookora nấu thử.'] : []),
    ],
  };
}
export function match(
  recipe: Recipe,
  items: MatchItem[],
  servings: number,
  mode: 'identity' | 'quantity',
): MatchResult {
  const scaled = scale(recipe, servings);
  const grouped = new Map<string, { line: RecipeLine; needed: Decimal | null; weight: number }>();
  const weights = { MAIN: 3, SUPPORTING: 1, SEASONING: 0.25 };
  for (const line of scaled.lines.filter((l) => !l.optional)) {
    const baseUnit = units[line.unit]?.base ?? line.unit;
    const key = `${line.ingredientId}:${baseUnit}`;
    const old = grouped.get(key),
      needed = line.exactQuantity === null ? null : convert(line.exactQuantity, line.unit, baseUnit);
    grouped.set(key, {
      line: { ...line, unit: baseUnit },
      needed: old ? (old.needed === null || needed === null ? null : old.needed.add(needed)) : needed,
      weight: Math.max(old?.weight || 0, weights[line.role]),
    });
  }
  let score = new Decimal(0),
    denominator = 0;
  const missing: MatchResult['missing'] = [],
    unknown: string[] = [];
  for (const { line, needed, weight } of grouped.values()) {
    denominator += weight;
    const found = items.filter((i) => i.ingredientId === line.ingredientId);
    if (mode === 'identity') {
      if (found.length) {
        score = score.add(weight);
        unknown.push(line.name);
      } else
        missing.push({
          ingredientId: line.ingredientId,
          name: line.name,
          quantity: needed?.toString() ?? null,
          unit: line.unit,
        });
      continue;
    }
    if (needed === null) {
      unknown.push(line.name);
      continue;
    }
    let available = new Decimal(0),
      unresolved = false;
    for (const item of found) {
      if (item.quantity === undefined || !item.unit) {
        unresolved = true;
        continue;
      }
      const c = convert(item.quantity, item.unit, line.unit);
      if (c === null) unresolved = true;
      else available = available.add(c);
    }
    const coverage = Decimal.min(available.div(needed), 1);
    score = score.add(coverage.mul(weight));
    if (available.lt(needed)) {
      if (unresolved) {
        unknown.push(line.name);
        missing.push({ ingredientId: line.ingredientId, name: line.name, quantity: null, unit: line.unit });
      } else
        missing.push({
          ingredientId: line.ingredientId,
          name: line.name,
          quantity: quantity(needed.sub(available)),
          unit: line.unit,
        });
    }
  }
  return {
    recipe,
    score: denominator ? score.div(denominator).mul(100).toDecimalPlaces(2).toNumber() : 0,
    canCookConfirmed: mode === 'quantity' && denominator > 0 && !missing.length && !unknown.length,
    missing,
    unknown: [...new Set(unknown)],
    mode,
  };
}
export function aggregate(entries: { recipe: Recipe; servings: number }[]) {
  const map = new Map<
    string,
    { ingredientId: string; name: string; unit: string; quantity: string | null; sources: string[] }
  >();
  for (const entry of entries)
    for (const l of scale(entry.recipe, entry.servings).lines.filter((l) => !l.optional)) {
      const base = units[l.unit]?.base ?? l.unit;
      const exact = l.exactQuantity === null ? null : convert(l.exactQuantity, l.unit, base);
      const key = `${l.ingredientId}:${base}`,
        old = map.get(key);
      map.set(key, {
        ingredientId: l.ingredientId,
        name: l.name,
        unit: base,
        quantity: old
          ? old.quantity === null || exact === null
            ? null
            : quantity(new Decimal(old.quantity).add(exact))
          : exact === null
            ? null
            : quantity(exact),
        sources: [...new Set([...(old?.sources || []), entry.recipe.title])],
      });
    }
  return [...map.values()];
}
export function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function withinWeek(date: string, week: string) {
  return (
    validDate(date) &&
    validDate(week) &&
    Date.parse(date) >= Date.parse(week) &&
    Date.parse(date) < Date.parse(week) + 7 * 86400000
  );
}
