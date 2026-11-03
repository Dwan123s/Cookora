import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Recipe } from '@cookora/contracts';
import { planInstructionUpdates, type InstructionSource } from '../src/stored-recipe-instructions';

const seed = JSON.parse(readFileSync(resolve(__dirname, '../../database/seeds/demo-recipes.json'), 'utf8'));
const expanded: unknown = JSON.parse(
  readFileSync(resolve(__dirname, '../../database/seeds/detailed-recipe-steps.json'), 'utf8'),
);
const sources: InstructionSource[] = seed.recipes.map((recipe: any) => ({
  slug: recipe.slug,
  baseServings: recipe.baseServings,
  ingredients: recipe.ingredients.map(([ingredientId, quantity]: [string, number]) => ({
    ingredientId,
    quantity: String(quantity),
    unit: seed.ingredients.find((ingredient: any) => ingredient.id === ingredientId).unit,
  })),
  steps: recipe.steps.map(([title, instruction]: [string, string]) => ({ title, instruction })),
}));
const recipes = sources.map((source, index) => ({
  ...source,
  id: `recipe-${index}`,
  revision: 1,
  contentStatus: 'DRAFT',
  steps: source.steps.map((step, stepIndex) => ({
    ...step,
    id: `step-${index}-${stepIndex}`,
    order: stepIndex + 1,
  })),
})) as Recipe[];

test('all seven stored recipes have distinct, complete instructions without modifying ingredient data', () => {
  const before = JSON.stringify(recipes);
  const plan = planInstructionUpdates(recipes, sources, expanded);
  assert.equal(plan.updates.length, 7);
  assert.equal(new Set(plan.updates.map((item) => JSON.stringify(item.steps))).size, 7);
  for (const update of plan.updates) {
    assert.ok(update.steps.length >= 7);
    assert.ok(update.steps.every((step) => step.instruction.length >= 80));
    assert.deepEqual(
      update.steps.map((step) => step.order),
      update.steps.map((_, index) => index + 1),
    );
  }
  assert.equal(JSON.stringify(recipes), before);
  const installed = plan.updates.map(({ recipe, steps }) => ({
    ...recipe,
    revision: 2,
    steps: steps.map((step, index) => ({ ...step, id: `installed-${index}` })),
  }));
  const next = planInstructionUpdates(installed, sources, expanded);
  assert.equal(next.updates.length, 0);
  assert.equal(next.unchanged.length, 7);
});

test('instruction updater refuses published, customized or unrecognized recipes', () => {
  assert.throws(
    () => planInstructionUpdates([{ ...recipes[0], contentStatus: 'APPROVED' }], sources, expanded),
    /published/,
  );
  assert.throws(
    () => planInstructionUpdates([{ ...recipes[0], baseServings: 9 }], sources, expanded),
    /servings/,
  );
  assert.throws(
    () =>
      planInstructionUpdates(
        [{ ...recipes[0], ingredients: [{ ...recipes[0].ingredients[0], quantity: '999' }] }],
        sources,
        expanded,
      ),
    /ingredients/,
  );
  assert.throws(
    () =>
      planInstructionUpdates(
        [
          {
            ...recipes[0],
            steps: [{ ...recipes[0].steps[0], instruction: 'User edited this instruction.' }],
          },
        ],
        sources,
        expanded,
      ),
    /edited/,
  );
  assert.throws(
    () => planInstructionUpdates([{ ...recipes[0], slug: 'custom-recipe' }], sources, expanded),
    /Missing/,
  );
});
