import type { Recipe } from '@cookora/contracts';
import type { Goal } from './eatfit-calculations';
import type { EatFitMeal, EatFitProposal } from './eatfit-storage';
import { suggestEatFitRecipes } from './eatfit-suggestions';
import { RECIPE_PLACEHOLDER } from './recipe-media';

export function eatFitMeal(recipe: Recipe, reason = ''): EatFitMeal {
  return {
    number: Number(recipe.slug.match(/^doc-menu-(\d+)/)?.[1]),
    slug: recipe.slug,
    title: recipe.title,
    image: recipe.image || RECIPE_PLACEHOLDER,
    ingredients: recipe.ingredients.map((item) => item.note || item.name).join('; '),
    recipeContext: recipe.steps.map((step) => `Bước ${step.order}. ${step.instruction}`).join('\n\n'),
    reason,
  };
}

export function createEatFitProposal(
  collection: Recipe[], goal: Goal, target: number, signature: string, previous: EatFitProposal | null,
): EatFitProposal {
  const round = previous ? previous.round + 1 : 0;
  const history = previous?.seenSlugs || [];
  const suggestions = suggestEatFitRecipes(collection, goal, {
    round, profileKey: signature, seenSlugs: history,
    previousSlugs: previous?.meals.map((meal) => meal.slug) || [],
  });
  const seenSlugs = collection.every((recipe) => history.includes(recipe.slug)) ? [] : history;
  return {
    meals: suggestions.map(({ recipe, reason }) => eatFitMeal(recipe, reason)),
    target, goal, signature, round,
    seenSlugs: [...new Set([...seenSlugs, ...suggestions.map(({ recipe }) => recipe.slug)])],
  };
}
