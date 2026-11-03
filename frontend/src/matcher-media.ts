import type { Recipe } from '@cookora/contracts';
import { recipeMedia } from './recipe-media';

export function matcherMedia(recipe: Recipe) {
  return recipeMedia(recipe);
}
