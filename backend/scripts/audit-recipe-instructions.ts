import '../src/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Database } from '../src/db';
import { recipeDto, recipeInclude } from '../src/catalog';

async function run() {
  const db = new Database();
  try {
    const recipes = (await db.recipe.findMany({ include: recipeInclude, orderBy: { slug: 'asc' } })).map(
      recipeDto,
    );
    const directory = resolve(__dirname, '../../.review');
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      resolve(directory, 'catalog-instructions-before.json'),
      JSON.stringify(recipes, null, 2),
      'utf8',
    );
    console.log(
      JSON.stringify(
        {
          recipes: recipes.length,
          statuses: recipes.reduce<Record<string, number>>((counts, recipe) => {
            counts[recipe.contentStatus] = (counts[recipe.contentStatus] || 0) + 1;
            return counts;
          }, {}),
          steps: recipes.map((recipe) => ({
            slug: recipe.slug,
            title: recipe.title,
            count: recipe.steps.length,
            shortest: Math.min(...recipe.steps.map((step) => step.instruction.length)),
          })),
        },
        null,
        2,
      ),
    );
  } finally {
    await db.$disconnect();
  }
}
run().catch((error: unknown) => {
  console.error('Recipe audit failed:', error instanceof Error ? error.message : 'unknown');
  process.exitCode = 1;
});
