import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Recipe } from '@cookora/contracts';
import { budgetResult, recipeCost, isPriceBook } from '../frontend/src/meal-cost';
const recipe = {
  baseServings: 2,
  ingredients: [
    { ingredientId: 'tomato', name: 'Cà chua', quantity: '0.3', unit: 'kg', optional: false },
    { ingredientId: 'tomato', name: 'Cà chua', quantity: '100', unit: 'g', optional: false },
    { ingredientId: 'optional', quantity: '3', unit: 'g', optional: true },
  ],
} as Recipe;
const prices = [
  { ingredientId: 'tomato', quantity: 1, unit: 'kg', price: 30000, updatedAt: '2026-11-02T00:00:00Z' },
];
test('weekly/day budgets and invalid input', () => {
  assert.deepEqual(budgetResult(300000, 'week', 7, 1, 2), {
    total: 300000,
    daily: 300000 / 7,
    meals: 14,
    perMeal: 300000 / 14,
  });
  assert.equal(budgetResult(50000, 'day', 3, 2, 2)?.total, 150000);
  assert.equal(budgetResult(50000, 'day', 3, 2, 2)?.perMeal, 12500);
  for (const args of [
    [0, 7, 1, 2],
    [NaN, 7, 1, 2],
    [100, 0, 1, 2],
    [100, 1, 0, 2],
    [100, 1, 1, 0],
    [100, 1.5, 1, 2],
    [100000001, 7, 1, 2],
  ])
    assert.equal(budgetResult(args[0], 'week', args[1], args[2], args[3]), null);
});
test('ingredient costs normalize units, merge duplicates, distinguish usage and whole packs', () => {
  const result = recipeCost(recipe, 2, prices);
  assert.equal(result.lines.length, 1);
  assert.equal(result.usedTotal, 12000);
  assert.equal(result.purchaseTotal, 30000);
  assert.equal(result.perPerson, 6000);
  assert.equal(recipeCost(recipe, 4, prices).usedTotal, 24000);
  assert.equal(recipeCost(recipe, 6, prices).purchaseTotal, 60000);
});
test('missing price/quantity/unit never confirms a budget match', () => {
  assert.equal(recipeCost(recipe, 2, []).perPerson, null);
  assert.equal(
    recipeCost({ ...recipe, ingredients: [{ ...recipe.ingredients[0], quantity: null }] }, 2, prices)
      .perPerson,
    null,
  );
  assert.equal(recipeCost(recipe, 2, [{ ...prices[0], unit: 'ml' }]).perPerson, null);
  assert.equal(isPriceBook([{ ...prices[0], quantity: 0 }]), false);
  assert.equal(isPriceBook(prices), true);
});
