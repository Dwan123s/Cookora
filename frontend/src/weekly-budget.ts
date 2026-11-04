import type { MealEntry } from '@cookora/contracts';

// Prices depend on the dishes, quantities and servings, not their order in the calendar.
export function weeklyBudgetContext(entries: MealEntry[]) {
  return entries
    .map(({ recipe, servings }) => ({
      recipeId: recipe.id,
      servings,
      revision: recipe.revision,
      baseServings: recipe.baseServings,
      ingredients: recipe.ingredients
        .filter((line) => !line.optional)
        .map(({ name, quantity, unit, note }) => ({ name, quantity, unit, note })),
    }))
    .sort((a, b) => a.recipeId.localeCompare(b.recipeId) || a.servings - b.servings);
}
