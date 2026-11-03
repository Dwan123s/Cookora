import '../src/config';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Database } from '../src/db';
import { recipeDto, recipeInclude } from '../src/catalog';
import { importUserMenu, UserMenuSchema } from '../src/user-menu-import';

async function run() {
  if (process.env.NODE_ENV === 'production') throw new Error('Local catalog import only.');
  const source = UserMenuSchema.parse(
    JSON.parse(readFileSync(resolve(__dirname, '../../database/seeds/user-menu-recipes.json'), 'utf8')),
  );
  const db = new Database();
  try {
    const before = (await db.recipe.findMany({ include: recipeInclude, orderBy: { slug: 'asc' } })).map(
      recipeDto,
    );
    const existing = new Set(before.map((recipe) => recipe.slug));
    console.log(
      JSON.stringify({
        mode: process.argv.includes('--apply') ? 'apply' : 'preview',
        sourceName: source.sourceName,
        sourceRecipes: source.recipes.length,
        create: source.recipes.filter((recipe) => !existing.has(recipe.slug)).length,
        preserve: source.recipes.filter((recipe) => existing.has(recipe.slug)).length,
        before: before.length,
      }),
    );
    if (!process.argv.includes('--apply')) return;
    const directory = resolve(__dirname, '../../.review');
    mkdirSync(directory, { recursive: true });
    const backup = resolve(
      directory,
      `user-menu-import-before-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
    );
    writeFileSync(backup, JSON.stringify(before, null, 2), 'utf8');
    const result = await importUserMenu(db, source);
    const after = (await db.recipe.findMany({ include: recipeInclude, orderBy: { slug: 'asc' } })).map(
      recipeDto,
    );
    for (const recipe of source.recipes) {
      const stored = after.find((item) => item.slug === recipe.slug);
      if (
        !stored ||
        stored.title !== recipe.title ||
        stored.steps.map((step) => step.instruction).join('\n') !==
          recipe.steps.map((step) => step.instruction).join('\n')
      )
        throw new Error(`Source mismatch: ${recipe.slug}`);
    }
    for (const original of before)
      if (JSON.stringify(after.find((recipe) => recipe.id === original.id)) !== JSON.stringify(original))
        throw new Error('Existing recipe changed');
    console.log(
      JSON.stringify({
        created: result.created.length,
        preserved: result.preserved.length,
        sourceCoverage: source.recipes.length,
        total: after.length,
        backup,
        verified: true,
      }),
    );
  } finally {
    await db.$disconnect();
  }
}
run().catch((error: unknown) => {
  console.error('Menu import failed:', error instanceof Error ? error.message : 'unknown');
  process.exitCode = 1;
});
