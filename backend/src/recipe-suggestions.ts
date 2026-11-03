import type { Ingredient, Recipe } from '@cookora/contracts';
import { match, normalize } from './domain';

const words = (text: string) =>
  normalize(text)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export function suggestFromCatalog(
  recipes: Recipe[],
  ingredients: Ingredient[],
  prompt: string,
  servings: number,
) {
  const text = words(prompt);
  const mentions: { ingredient: Ingredient; start: number; end: number }[] = [];
  for (const ingredient of ingredients) {
    for (const alias of new Set([ingredient.name, ...ingredient.aliases].map(words).filter(Boolean))) {
      const pattern = new RegExp(`(?:^| )(${alias})(?= |$)`, 'g');
      for (const found of text.matchAll(pattern)) {
        const start = found.index! + found[0].length - alias.length;
        mentions.push({ ingredient, start, end: start + alias.length });
      }
    }
  }
  // A specific phrase such as "thịt gà" wins over an overlapping, shorter alias.
  mentions.sort((a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start);
  const occupied: { start: number; end: number }[] = [];
  const recognized = new Map<string, Ingredient>();
  for (const mention of mentions) {
    if (occupied.some((span) => mention.start < span.end && mention.end > span.start)) continue;
    occupied.push(mention);
    const prefix = text.slice(0, mention.start);
    if (/(?:^| )(?:khong(?: co| con| dung| an)?|het|tranh|bo qua) $/.test(prefix)) continue;
    recognized.set(mention.ingredient.id, mention.ingredient);
  }
  const recognizedIngredients = [...recognized.values()].slice(0, 50).map(({ id, name }) => ({ id, name }));
  const ids = new Set(recognizedIngredients.map((ingredient) => ingredient.id));
  const items = [...ids].map((ingredientId) => ({ ingredientId }));
  const matches = recipes
    .filter((recipe) =>
      recipe.ingredients.some(
        (line) => !line.optional && line.role !== 'SEASONING' && ids.has(line.ingredientId),
      ),
    )
    .map((recipe) => match(recipe, items, servings, 'identity'))
    .sort(
      (a, b) =>
        b.score - a.score || a.missing.length - b.missing.length || a.recipe.id.localeCompare(b.recipe.id),
    );
  return { prompt, servings, recognizedIngredients, matches };
}
