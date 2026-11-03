import '../src/config';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Database } from '../src/db';
import { recipeDto, recipeInclude } from '../src/catalog';
import { importThaiCatalog, ThaiCatalogSchema } from '../src/thai-catalog-import';

async function run() {
  if (process.env.NODE_ENV === 'production') throw new Error('Local catalog import only.');
  const recipes = ThaiCatalogSchema.parse(
    JSON.parse(readFileSync(resolve(__dirname, '../../database/seeds/thai-recipes.json'), 'utf8')),
  );
  for (const recipe of recipes)
    if (!existsSync(resolve(__dirname, '../../frontend/public', recipe.image.slice(1))))
      throw new Error(`Missing image for ${recipe.slug}`);
  const db = new Database();
  try {
    const before = (await db.recipe.findMany({ include: recipeInclude, orderBy: { slug: 'asc' } })).map(
      recipeDto,
    );
    const existing = new Set(before.map((recipe) => recipe.slug));
    const planned = recipes.filter((recipe) => !existing.has(recipe.slug));
    console.log(
      JSON.stringify({
        mode: process.argv.includes('--apply') ? 'apply' : 'preview',
        before: before.length,
        beforeThai: before.filter((recipe) => recipe.cuisine === 'TH').length,
        sourceRecipes: recipes.length,
        create: planned.length,
        preserve: recipes.length - planned.length,
        afterExpected: before.length + planned.length,
      }),
    );
    if (!process.argv.includes('--apply')) return;
    const directory = resolve(__dirname, '../../.review');
    mkdirSync(directory, { recursive: true });
    const backup = resolve(
      directory,
      `thai-import-before-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
    );
    writeFileSync(backup, JSON.stringify(before, null, 2), 'utf8');
    const result = await importThaiCatalog(db, recipes);
    const after = (await db.recipe.findMany({ include: recipeInclude, orderBy: { slug: 'asc' } })).map(
      recipeDto,
    );
    if (
      recipes.some(
        (recipe) =>
          !after.some((item) => item.slug === recipe.slug && item.ingredients.length && item.steps.length),
      )
    )
      throw new Error('Incomplete import');
    for (const original of before)
      if (JSON.stringify(after.find((recipe) => recipe.id === original.id)) !== JSON.stringify(original))
        throw new Error('Existing recipe changed');
    console.log(
      JSON.stringify({
        created: result.created.length,
        preserved: result.preserved.length,
        total: after.length,
        thai: after.filter((recipe) => recipe.cuisine === 'TH').length,
        sourceCoverage: recipes.length,
        backup,
        verified: true,
      }),
    );
  } finally {
    await db.$disconnect();
  }
}
run().catch((error: unknown) => {
  console.error('Thai catalog import failed:', error instanceof Error ? error.message : 'unknown');
  process.exitCode = 1;
});
