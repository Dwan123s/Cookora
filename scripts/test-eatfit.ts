import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateNutrition, mealBudgets } from '../frontend/src/eatfit-calculations';
const input = {
  gender: 'female' as const,
  age: 22,
  height: 160,
  weight: 50,
  activity: 1.375,
  goal: 'lose' as const,
};
test('default estimate and goal adjustments', () => {
  assert.deepEqual(calculateNutrition(input), {
    bmr: 1229,
    tdee: 1690,
    target: 1290,
    protein: 97,
    carbs: 129,
    fat: 43,
  });
  assert.equal(calculateNutrition({ ...input, goal: 'maintain' })?.target, 1690);
  assert.equal(calculateNutrition({ ...input, goal: 'gain' })?.target, 2090);
});
test('incomplete and out of range measurements have no estimate', () => {
  for (const change of [
    { age: 0 },
    { age: 17 },
    { age: 22.5 },
    { height: 0 },
    { weight: NaN },
    { activity: 9 },
  ])
    assert.equal(calculateNutrition({ ...input, ...change }), null);
});
test('four meal budgets preserve the daily total after rounding', () => {
  for (const total of [1290, 1690, 2090, 1601, 2403])
    assert.equal(
      mealBudgets(total).reduce((a, b) => a + b, 0),
      total,
    );
});
