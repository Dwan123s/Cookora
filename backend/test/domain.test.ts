import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Recipe } from '@cookora/contracts';
import { aggregate, convert, match, scale, validDate, withinWeek } from '../src/domain';
function recipe(lines: Recipe['ingredients'], baseServings = 2): Recipe {
  return {
    id: 'fixture',
    baseServings,
    title: 'Fixture',
    contentStatus: 'DRAFT',
    ingredients: lines,
  } as Recipe;
}
function line(id: string, q: string | null, unit = 'g', role: 'MAIN' | 'SUPPORTING' | 'SEASONING' = 'MAIN') {
  return { id: id + Math.random(), ingredientId: id, name: id, quantity: q, unit, role, optional: false };
}
test('unit conversion stays within dimension; ml is never assumed to equal g', () => {
  assert.equal(convert('0.3', 'kg', 'g')?.toString(), '300');
  assert.equal(convert('100', 'ml', 'g'), null);
  assert.equal(convert('1', 'piece', 'g'), null);
});
test('scaling always starts at original quantities and preserves exact fraction', () => {
  const r = recipe([line('egg', '150')]);
  assert.equal(scale(r, 3).lines[0].exactQuantity, '225');
  assert.equal(scale(r, 2).lines[0].exactQuantity, '150');
  assert.equal(scale(r, 1).lines[0].exactQuantity, '75');
});
test('shopping aggregates mixed compatible units before rounding', () => {
  const a = recipe([line('carrot', '200')]),
    b = recipe([line('carrot', '0.3', 'kg')]),
    c = recipe([line('carrot', '100')]);
  assert.equal(aggregate([a, b, c].map((r) => ({ recipe: r, servings: 2 })))[0].quantity, '600');
});
test('unknown quantity propagates and does not become zero', () => {
  assert.equal(
    aggregate([{ recipe: recipe([line('salt', null), line('salt', '3')]), servings: 2 }])[0].quantity,
    null,
  );
});
test('optional ingredients excluded from missing and shopping', () => {
  const r = recipe([{ ...line('parsley', '5'), optional: true }, line('pasta', '100')]);
  assert.equal(aggregate([{ recipe: r, servings: 2 }]).length, 1);
  assert.equal(
    match(r, [{ ingredientId: 'pasta', quantity: '100', unit: 'g' }], 2, 'quantity').canCookConfirmed,
    true,
  );
});
test('identity matching cannot certify sufficient quantities', () => {
  const m = match(recipe([line('egg', '150')]), [{ ingredientId: 'egg' }], 2, 'identity');
  assert.equal(m.score, 100);
  assert.equal(m.canCookConfirmed, false);
  assert.deepEqual(m.unknown, ['egg']);
});
test('quantity score uses all required weights; unknown adds zero', () => {
  const r = recipe([
    line('chicken', '300'),
    line('carrot', '100', 'g', 'SUPPORTING'),
    line('onion', '20', 'g', 'SUPPORTING'),
    line('salt', '2', 'g', 'SEASONING'),
  ]);
  const m = match(
    r,
    [
      { ingredientId: 'chicken', quantity: '150', unit: 'g' },
      { ingredientId: 'carrot', quantity: '100', unit: 'g' },
      { ingredientId: 'salt' },
    ],
    2,
    'quantity',
  );
  assert.equal(m.score, 47.62);
  assert.equal(m.canCookConfirmed, false);
  assert.equal(m.missing.find((i) => i.ingredientId === 'chicken')?.quantity, '150');
  assert.deepEqual(m.unknown, ['salt']);
});
test('same ingredient in sauce/main is grouped; pantry is not allocated twice', () => {
  const r = recipe([line('chicken', '200'), line('chicken', '100')]);
  const m = match(r, [{ ingredientId: 'chicken', quantity: '200', unit: 'g' }], 2, 'quantity');
  assert.equal(m.score, 66.67);
  assert.equal(m.missing[0].quantity, '100');
});
test('unknown quantity or incompatible volume is not a known missing amount', () => {
  const m = match(
    recipe([line('oil', '20', 'ml')]),
    [{ ingredientId: 'oil', quantity: '20', unit: 'g' }],
    2,
    'quantity',
  );
  assert.equal(m.score, 0);
  assert.equal(m.missing[0].quantity, null);
  assert.deepEqual(m.unknown, ['oil']);
});
test('matching merges same ingredient in g and kg before allocating pantry', () => {
  const r = recipe([line('chicken', '200', 'g'), line('chicken', '0.1', 'kg')]);
  const m = match(r, [{ ingredientId: 'chicken', quantity: '0.2', unit: 'kg' }], 2, 'quantity');
  assert.equal(m.score, 66.67);
  assert.equal(m.missing.length, 1);
  assert.equal(m.missing[0].quantity, '100');
  assert.equal(m.missing[0].unit, 'g');
});
test('week and date boundaries reject impossible dates and out-of-week entries', () => {
  assert.equal(validDate('2026-02-30'), false);
  assert.equal(validDate('2026-02-28'), true);
  assert.equal(withinWeek('2026-11-01', '2026-10-26'), true);
  assert.equal(withinWeek('2026-11-02', '2026-10-26'), false);
});
