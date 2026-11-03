import type { Recipe } from '@cookora/contracts';

export const RECIPE_PLACEHOLDER = '/images/recipe-placeholder.svg';
const documentReference = /\.docx?\b|tài liệu/i;

export function recipeSummary(recipe: Pick<Recipe, 'summary'>) {
  const summary = recipe.summary?.trim() || '';
  return documentReference.test(summary) ? '' : summary;
}

export function recipeMedia(recipe: Recipe) {
  return {
    src: recipe.image || RECIPE_PLACEHOLDER,
    credit: documentReference.test(recipe.imageCredit) ? '' : recipe.imageCredit,
    label: recipe.image ? 'Ảnh món ăn' : 'Chưa có ảnh',
  };
}
