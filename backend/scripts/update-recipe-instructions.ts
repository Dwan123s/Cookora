import '../src/config';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Database } from '../src/db';
import { recipeDto, recipeInclude } from '../src/catalog';
import {
  instructionFingerprint,
  planInstructionUpdates,
  type InstructionSource,
} from '../src/stored-recipe-instructions';

async function run() {
  if (process.env.NODE_ENV === 'production')
    throw new Error('This updater is for the local development catalog only.');
  const seed = JSON.parse(readFileSync(resolve(__dirname, '../../database/seeds/demo-recipes.json'), 'utf8'));
  const source: InstructionSource[] = seed.recipes.map((recipe: any) => ({
    slug: recipe.slug,
    baseServings: recipe.baseServings,
    ingredients: recipe.ingredients.map(([ingredientId, quantity]: [string, number]) => ({
      ingredientId,
      quantity: String(quantity),
      unit: seed.ingredients.find((ingredient: any) => ingredient.id === ingredientId).unit,
    })),
    steps: recipe.steps.map(([title, instruction]: [string, string]) => ({ title, instruction })),
  }));
  const expanded: unknown = JSON.parse(
    readFileSync(resolve(__dirname, '../../database/seeds/detailed-recipe-steps.json'), 'utf8'),
  );
  const db = new Database();
  try {
    const recipes = (await db.recipe.findMany({
      where: { slug: { in: source.map((recipe) => recipe.slug) } },
      include: recipeInclude,
      orderBy: { slug: 'asc' },
    })).map(
      recipeDto,
    );
    const plan = planInstructionUpdates(recipes, source, expanded);
    console.log(
      JSON.stringify(
        {
          mode: process.argv.includes('--apply') ? 'apply' : 'preview',
          recipes: recipes.length,
          updates: plan.updates.map(({ recipe, steps }) => ({
            slug: recipe.slug,
            from: recipe.steps.length,
            to: steps.length,
            revision: recipe.revision + 1,
          })),
          unchanged: plan.unchanged,
        },
        null,
        2,
      ),
    );
    if (!process.argv.includes('--apply') || !plan.updates.length) return;
    const directory = resolve(__dirname, '../../.review');
    mkdirSync(directory, { recursive: true });
    const backup = resolve(
      directory,
      `recipe-instructions-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
    );
    writeFileSync(
      backup,
      JSON.stringify(
        plan.updates.map(({ recipe }) => recipe),
        null,
        2,
      ),
      'utf8',
    );
    await db.$transaction(
      async (tx) => {
        for (const update of plan.updates) {
          const current = await tx.recipe.findUniqueOrThrow({
            where: { id: update.recipe.id },
            include: recipeInclude,
          });
          if (instructionFingerprint(recipeDto(current)) !== update.fingerprint)
            throw new Error(`Concurrent change: ${update.recipe.slug}`);
          const changed = await tx.recipe.updateMany({
            where: { id: current.id, revision: current.revision, contentStatus: 'DRAFT' },
            data: { revision: { increment: 1 } },
          });
          if (changed.count !== 1) throw new Error(`Revision conflict: ${update.recipe.slug}`);
          for (const [index, step] of update.steps.entries()) {
            const existing = current.steps[index];
            if (existing)
              await tx.recipeStep.update({
                where: { id: existing.id },
                data: { title: step.title, instruction: step.instruction },
              });
            else await tx.recipeStep.create({ data: { recipeId: current.id, ...step } });
          }
        }
      },
      { isolationLevel: 'Serializable', timeout: 30000 },
    );
    const updated = (await db.recipe.findMany({ include: recipeInclude, orderBy: { slug: 'asc' } })).map(
      recipeDto,
    );
    if (planInstructionUpdates(updated, source, expanded).updates.length)
      throw new Error('Post-update verification failed.');
    console.log(JSON.stringify({ updated: plan.updates.length, backup, verified: true }));
  } finally {
    await db.$disconnect();
  }
}
run().catch((error: unknown) => {
  console.error('Instruction update failed:', error instanceof Error ? error.message : 'unknown');
  process.exitCode = 1;
});
