import { createHash } from 'node:crypto';
import Decimal from 'decimal.js';
import { z } from 'zod';
import type { Recipe } from '@cookora/contracts';

export const StoredInstructionSchema = z.record(
  z.string(),
  z
    .array(z.tuple([z.string().trim().min(2).max(120), z.string().trim().min(80).max(2400)]))
    .min(5)
    .max(20),
);

export type InstructionSource = Pick<Recipe, 'slug' | 'baseServings'> & {
  ingredients: Pick<Recipe['ingredients'][number], 'ingredientId' | 'quantity' | 'unit'>[];
  steps: Pick<Recipe['steps'][number], 'title' | 'instruction'>[];
};
const stepsKey = (steps: InstructionSource['steps']) =>
  JSON.stringify(steps.map(({ title, instruction }) => [title, instruction]));
const ingredientsKey = (ingredients: InstructionSource['ingredients']) =>
  JSON.stringify(
    ingredients
      .map((line) => [
        line.ingredientId,
        line.quantity === null ? null : new Decimal(line.quantity).toString(),
        line.unit,
      ])
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  );

export function instructionFingerprint(recipe: Recipe): string {
  return createHash('sha256').update(JSON.stringify(recipe)).digest('hex');
}

export function planInstructionUpdates(recipes: Recipe[], sources: InstructionSource[], input: unknown) {
  const instructions = StoredInstructionSchema.parse(input);
  const sourceMap = new Map(sources.map((source) => [source.slug, source]));
  const updates: {
    recipe: Recipe;
    fingerprint: string;
    steps: { order: number; title: string; instruction: string }[];
  }[] = [];
  const unchanged: string[] = [];
  for (const recipe of recipes) {
    const expanded = instructions[recipe.slug];
    const source = sourceMap.get(recipe.slug);
    if (!expanded || !source) throw new Error(`Missing detailed instructions for ${recipe.slug}`);
    const steps = expanded.map(([title, instruction], index) => ({ order: index + 1, title, instruction }));
    if (stepsKey(recipe.steps) === stepsKey(steps)) {
      unchanged.push(recipe.slug);
      continue;
    }
    if (recipe.contentStatus !== 'DRAFT')
      throw new Error(`Refusing to overwrite a published recipe: ${recipe.slug}`);
    if (
      recipe.baseServings !== source.baseServings ||
      ingredientsKey(recipe.ingredients) !== ingredientsKey(source.ingredients)
    ) {
      throw new Error(`Recipe ingredients or servings have changed: ${recipe.slug}`);
    }
    if (stepsKey(recipe.steps) !== stepsKey(source.steps))
      throw new Error(`Recipe instructions have been edited: ${recipe.slug}`);
    if (steps.length < recipe.steps.length || recipe.steps.some((step, index) => step.order !== index + 1)) {
      throw new Error(`Cannot preserve existing step IDs for ${recipe.slug}`);
    }
    updates.push({ recipe, fingerprint: instructionFingerprint(recipe), steps });
  }
  return { updates, unchanged };
}
