import React from 'react';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { MealEntry, Recipe } from '@cookora/contracts';
// The backend test compiler has no JSX setting; frontend typechecking validates the component.
const { WeeklyBudgetCard } = require('../../frontend/src/components/WeeklyBudgetCard');
import { weeklyBudgetContext } from '../../frontend/src/weekly-budget';

const recipe = {
  id: 'rice',
  title: 'Cơm gà',
  revision: 1,
  baseServings: 2,
  ingredients: [{ name: 'Gạo', quantity: '200', unit: 'g', optional: false }],
} as Recipe;
const entry = { id: 'entry', date: '2026-11-04', mealType: 'LUNCH', servings: 2, recipe } as MealEntry;
const week = '2026-11-02';
function render(entries: MealEntry[], client: QueryClient, userId?: string, budget = 300000) {
  return renderToStaticMarkup(
    React.createElement(
      QueryClientProvider,
      { client },
      React.createElement(WeeklyBudgetCard, {
        entries,
        week,
        userId,
        budget,
        onBudgetChange: () => {},
        disabled: false,
      }),
    ),
  );
}

test('weekly budget UI requires a selected plan and never calls AI while mounting', () => {
  const client = new QueryClient();
  try {
    const empty = render([], client);
    assert.ok(empty.includes('Chưa có món'));
    assert.match(empty, /<button[^>]*disabled/);
    const ready = render([entry], client);
    assert.ok(ready.includes('AI dự tính ngân sách'));
    assert.ok(ready.includes('Chưa ước tính'));
    assert.ok(!ready.includes('Giá minh họa'));
    assert.equal(client.isFetching(), 0);
  } finally {
    client.clear();
  }
});

test('weekly budget UI shows AI totals, item costs and overspending for the matching account and plan only', () => {
  const client = new QueryClient();
  const data = {
    estimatedTotal: 400000,
    dishes: [{ recipeId: 'rice', servings: 2, occurrences: 1, estimatedCost: 400000, subtotal: 400000 }],
    explanation: 'Tính theo nguyên liệu.',
    tips: [],
    priceNote: 'Giá AI ước tính.',
    generatedAt: new Date().toISOString(),
  };
  const key = ['weekly-budget-ai', 'user-a', week, 'Việt Nam', weeklyBudgetContext([entry])];
  client.setQueryData(key, { data, meta: {} });
  try {
    const result = render([entry], client, 'user-a');
    assert.ok(result.includes('400.000'));
    assert.ok(result.includes('Vượt ngân sách 100.000'));
    assert.ok(result.includes('Xem chi phí từng món'));
    assert.ok(result.includes('Cơm gà'));
    assert.ok(render([entry], client, 'user-a', 500000).includes('Còn 100.000'));
    assert.ok(render([entry], client, 'user-b').includes('Chưa ước tính'));
    assert.ok(render([entry], client).includes('Chưa ước tính'));
    assert.ok(render([{ ...entry, servings: 4 }], client, 'user-a').includes('Chưa ước tính'));
    assert.ok(
      render([{ ...entry, recipe: { ...recipe, ingredients: [] } }], client, 'user-a').includes(
        'Chưa ước tính',
      ),
    );
  } finally {
    client.clear();
  }
});

test('weekly budget context ignores calendar order but changes with dish quantities or serving sizes', () => {
  const other = { ...entry, id: 'other', recipe: { ...recipe, id: 'tofu' } };
  assert.deepEqual(weeklyBudgetContext([entry, other]), weeklyBudgetContext([other, entry]));
  assert.notDeepEqual(weeklyBudgetContext([entry]), weeklyBudgetContext([{ ...entry, servings: 3 }]));
});
