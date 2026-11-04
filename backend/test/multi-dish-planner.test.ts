import React from 'react';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import type { MealEntry, MealPlan, Recipe } from '@cookora/contracts';
import {
  fillEmptyMealSlots,
  guestWeekStorageKey,
  mealSlotEntries,
  readGuestWeeks,
  saveLocalDishes,
  type LocalEntry,
} from '../../frontend/src/meal-plan-slots';
import { syncEatFitDayToMealPlan, weeklyGroceries } from '../../frontend/src/weekly-plan';
import { setCsrf } from '../../frontend/src/api';
const { WeeklyMealSlot } = require('../../frontend/src/components/WeeklyMealSlot');

const date = '2026-11-04',
  week = '2026-11-02';
function recipe(id: string, title: string, quantity: string, baseServings = 2): Recipe {
  return {
    id,
    slug: id,
    title,
    image: '',
    imageCredit: '',
    baseServings,
    ingredients: [
      { ingredientId: 'onion', name: 'Hành', unit: 'g', quantity, role: 'SUPPORTING', optional: false },
    ],
  } as Recipe;
}
const main = recipe('main', 'Cá kho', '20'),
  soup = recipe('soup', 'Canh rau ngót', '10'),
  veg = recipe('veg', 'Rau muống xào', '30');
const local = (r: Recipe, servings = 2): LocalEntry => ({
  id: `entry-${r.id}`,
  recipeId: r.id,
  date,
  mealType: 'LUNCH',
  servings,
});
const entry = (r: Recipe, servings = 2): MealEntry => ({ ...local(r, servings), recipe: r });
function storage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) || null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

test('a meal can append soup and vegetables, edit either dish, remove one and reload all remaining dishes', () => {
  let entries = saveLocalDishes([local(main)], [local(soup), local(veg)]);
  assert.equal(mealSlotEntries(entries, date, 'LUNCH').length, 3);
  entries = saveLocalDishes(entries, [local(soup, 4)], 'entry-soup');
  assert.equal(entries.find((e) => e.id === 'entry-soup')?.servings, 4);
  assert.deepEqual(
    entries.find((e) => e.id === 'entry-main'),
    local(main),
  );
  entries = entries.filter((e) => e.id !== 'entry-veg');
  const saved = storage();
  saved.setItem(guestWeekStorageKey, JSON.stringify({ [week]: { entries, checked: { onion: true } } }));
  assert.deepEqual(readGuestWeeks(saved)[week], { entries, checked: { onion: true } });
  assert.equal(mealSlotEntries(entries, date, 'DINNER').length, 0);
});

test('reloading a large week never silently truncates dishes after the first 100', () => {
  const saved = storage();
  const entries = Array.from({ length: 126 }, (_, i) => ({ ...local(main), id: `entry-${i}` }));
  saved.setItem(guestWeekStorageKey, JSON.stringify({ [week]: { entries, checked: {} } }));
  assert.equal(readGuestWeeks(saved)[week].entries.length, 126);
});

test('auto planning only fills empty meals and preserves every dish in existing meals', () => {
  const existing = [local(main), local(soup), local(veg)];
  const dinner = { ...local(main), id: 'dinner', mealType: 'DINNER' as const };
  const planned = fillEmptyMealSlots(existing, [{ ...local(main), id: 'replacement' }, dinner]);
  assert.deepEqual(planned, [...existing, dinner]);
});

test('calendar renders every dish with its own edit button and an add action even in an occupied meal', () => {
  const html = renderToStaticMarkup(
    React.createElement(WeeklyMealSlot, {
      meals: [entry(main), entry(soup), entry(veg)],
      label: 'Bữa trưa, 04/11',
      disabled: false,
      loading: false,
      onEdit: () => {},
      onAdd: () => {},
    }),
  );
  for (const r of [main, soup, veg]) assert.ok(html.includes(`Chỉnh ${r.title}`));
  assert.ok(html.includes('Thêm món vào bữa'));
  assert.ok(html.includes('3 món'));
  const empty = renderToStaticMarkup(
    React.createElement(WeeklyMealSlot, {
      meals: [],
      label: 'Bữa tối',
      disabled: true,
      loading: true,
      onEdit: () => {},
      onAdd: () => {},
    }),
  );
  assert.match(empty, /<button[^>]*disabled/);
  assert.ok(empty.includes('Thêm món'));
});

test('groceries include all dishes in the same meal and scale each independent serving size', () => {
  const groceries = weeklyGroceries([entry(main, 2), entry(soup, 4), entry(veg, 3)]);
  assert.equal(groceries.length, 1);
  assert.equal(groceries[0].quantity, '85'); // 20 + 10*2 + 30*1.5
});

test('guest Eat Fit import appends a dish once without replacing soup or vegetables', async (t) => {
  const saved = storage();
  saved.setItem(
    guestWeekStorageKey,
    JSON.stringify({ [week]: { entries: [local(soup), local(veg)], checked: {} } }),
  );
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: saved });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  });
  await syncEatFitDayToMealPlan(date, [null, main, null], [main, soup, veg]);
  await syncEatFitDayToMealPlan(date, [null, main, null], [main, soup, veg]);
  assert.deepEqual(
    readGuestWeeks(saved)[week].entries.map((e) => e.recipeId),
    ['soup', 'veg', 'main'],
  );
});

test('account Eat Fit import posts an additional dish, never patches an existing dish, and skips repeat imports', async (t) => {
  let plan: MealPlan = { id: 'plan', weekStart: week, version: 1, entries: [entry(soup), entry(veg)] };
  const methods: string[] = [];
  setCsrf('test-token');
  t.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
    methods.push(`${init.method} ${url}`);
    assert.equal(init.method, 'POST');
    if (String(url).endsWith('/entries')) {
      const body = JSON.parse(String(init.body));
      assert.equal(body.version, plan.version);
      assert.equal(body.recipeId, main.id);
      plan = { ...plan, version: plan.version + 1, entries: [...plan.entries, entry(main)] };
    }
    return new Response(JSON.stringify({ data: plan, meta: {} }), { status: 201 });
  });
  const first = await syncEatFitDayToMealPlan(date, [null, main, null], [main, soup, veg], { id: 'user' });
  const second = await syncEatFitDayToMealPlan(date, [null, main, null], [main, soup, veg], { id: 'user' });
  assert.equal(first?.entries.length, 3);
  assert.equal(second?.entries.length, 3);
  assert.equal(methods.filter((m) => m.endsWith('/entries')).length, 1);
});
