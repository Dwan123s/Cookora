import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { MealEntry, RecipeLine } from '@cookora/contracts';
import { weeklyGroceries, groceryAmount, weeklyEstimate } from '../frontend/src/weekly-plan';
const line = (quantity: string | null, unit = 'g', optional = false): RecipeLine => ({
  id: 'line',
  ingredientId: 'tomato',
  name: 'Cà chua',
  quantity,
  unit,
  optional,
  role: 'MAIN',
});
const entry = (lines: RecipeLine[], servings = 2) =>
  ({ servings, recipe: { baseServings: 2, ingredients: lines } }) as MealEntry;
test('weekly groceries merge compatible units and scale every meal from its original servings', () => {
  const result = weeklyGroceries([entry([line('0.5', 'kg')]), entry([line('250')], 4)]);
  assert.equal(result.length, 1);
  assert.equal(result[0].quantity, '1000');
  assert.equal(result[0].unit, 'g');
  assert.equal(groceryAmount(result[0]), '1 kg');
});
test('weekly groceries preserve unknown quantities and skip optional lines', () => {
  const result = weeklyGroceries([entry([line('200'), line(null), line('50', 'g', true)])]);
  assert.equal(result[0].quantity, null);
  assert.equal(groceryAmount(result[0]), 'Chưa rõ lượng');
});
test('weekly groceries never combine mass with volume', () => {
  const result = weeklyGroceries([entry([line('200'), line('100', 'ml')])]);
  assert.equal(result.length, 2);
  assert.deepEqual(
    result.map((row) => row.quantity),
    ['200', '100'],
  );
});
test('price estimates disclose unknown prices instead of guessing a total', () => {
  const rows = weeklyGroceries([entry([line('100')])]);
  rows.push({ ...rows[0], id: 'unknown:g', ingredientId: 'unknown' });
  const estimate = weeklyEstimate(rows);
  assert.equal(estimate.total, 2500);
  assert.equal(estimate.known, 1);
  assert.equal(estimate.missing, 1);
});
