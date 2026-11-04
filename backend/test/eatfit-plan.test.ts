import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Recipe } from '@cookora/contracts';
import { createEatFitProposal } from '../../frontend/src/eatfit-proposal';

const collection = Array.from({ length: 24 }, (_, index) => ({
  slug: `doc-menu-${String(index + 1).padStart(3, '0')}-dish-${index}`,
  title: ['Salad ức gà', 'Cơm cá hồi', 'Cháo trứng', 'Sandwich đậu hũ'][index % 4] + ` ${index}`,
  image: `/dish-${index}.webp`,
  ingredients: [{ name: ['ức gà', 'cá hồi', 'trứng', 'đậu hũ'][index % 4] }, { name: index % 2 ? 'gạo' : 'xà lách' }],
  steps: [{ order: 1, instruction: `Cách nấu riêng của món ${index}` }],
})) as Recipe[];

test('changing Eat Fit goal or profile replaces previous dishes and updates the target', () => {
  const lose = createEatFitProposal(collection, 'lose', 1600, 'female:lose:50', null);
  const gain = createEatFitProposal(collection, 'gain', 2400, 'female:gain:50', lose);
  const updated = createEatFitProposal(collection, 'gain', 2600, 'female:gain:60', gain);
  for (const [previous, next] of [[lose, gain], [gain, updated]]) {
    assert.equal(next.meals.length, 6);
    assert.equal(new Set(next.meals.map((meal) => meal.slug)).size, 6);
    assert.ok(next.meals.every((meal) => !previous.meals.some((old) => old.slug === meal.slug)));
  }
  assert.equal(gain.goal, 'gain');
  assert.equal(gain.target, 2400);
  assert.equal(updated.signature, 'female:gain:60');
  assert.equal(updated.target, 2600);
});

test('Eat Fit cards and opened recipes keep the exact source recipe identity and instructions', () => {
  const plan = createEatFitProposal(collection, 'maintain', 2000, 'profile', null);
  for (const meal of plan.meals) {
    const source = collection.find((recipe) => recipe.slug === meal.slug)!;
    assert.equal(meal.title, source.title);
    assert.equal(meal.image, source.image);
    assert.equal(meal.recipeContext, `Bước 1. ${source.steps[0].instruction}`);
    assert.equal(meal.ingredients, source.ingredients.map((line) => line.name).join('; '));
  }
});

test('propose another menu covers the collection before recycling and avoids the last menu', () => {
  let plan = createEatFitProposal(collection, 'lose', 1600, 'profile', null);
  const seen = new Set(plan.meals.map((meal) => meal.slug));
  for (let round = 0; round < 3; round++) {
    plan = createEatFitProposal(collection, 'lose', 1600, 'profile', plan);
    assert.ok(plan.meals.every((meal) => !seen.has(meal.slug)));
    plan.meals.forEach((meal) => seen.add(meal.slug));
  }
  assert.equal(seen.size, collection.length);
  const next = createEatFitProposal(collection, 'lose', 1600, 'profile', plan);
  assert.ok(next.meals.every((meal) => !plan.meals.some((old) => old.slug === meal.slug)));
});
