import '../src/config';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Database } from '../src/db';
import { databaseProvider } from '../src/config';
import { activeDocumentRecipes, DocumentCatalogSchema } from '../src/document-catalog';
import adjustments from '../src/catalog-adjustments.json';

async function main() {
  const root = resolve(__dirname, '../..');
  const context = JSON.parse(readFileSync(resolve(root, '.neon'), 'utf8'));
  assert.equal(databaseProvider, 'postgresql');
  assert.equal(context.projectId, 'polished-bonus-47222343');
  assert.equal(context.branch, 'production');
  assert.equal(process.env.NEON_BRANCH, 'production');
  const source = DocumentCatalogSchema.parse(
    JSON.parse(readFileSync(resolve(root, 'database/seeds/document-recipes.json'), 'utf8')),
  );
  const desired = new Map(activeDocumentRecipes(source).map((recipe) => [recipe.slug, recipe]));
  const db = new Database();
  try {
    const result = await db.$transaction(
      async (tx) => {
        const all = await tx.recipe.findMany({ orderBy: { slug: 'asc' } });
        const removed = all.filter((recipe) => adjustments.removedRecipeSlugs.includes(recipe.slug));
        assert.ok(removed.every((recipe) => recipe.title === 'Jumeokbap (Cơm nắm Hàn Quốc)'));
        const missing = all.filter((recipe) => recipe.totalMinutes === null || recipe.totalMinutes <= 0);
        for (const recipe of missing)
          assert.ok(desired.get(recipe.slug)?.totalMinutes, `Missing timing: ${recipe.slug}`);
        const ids = removed.map((recipe) => recipe.id);
        const entries = await tx.mealEntry.findMany({ where: { recipeId: { in: ids } } });
        const planIds = [...new Set(entries.map((entry) => entry.planId))];
        const summary = {
          mode: process.argv.includes('--apply') ? 'apply' : 'preview',
          before: all.length,
          removed: removed.map(({ id, slug, title }) => ({ id, slug, title })),
          timings: missing.map((recipe) => ({
            slug: recipe.slug,
            title: recipe.title,
            minutes: desired.get(recipe.slug)!.totalMinutes,
          })),
          affectedMealEntries: entries.length,
          affectedPlans: planIds.length,
        };
        if (!process.argv.includes('--apply')) return summary;
        const directory = resolve(root, '.review/catalog-backups');
        mkdirSync(directory, { recursive: true });
        const backupPath = resolve(directory, `before-rice-ball-and-times-${Date.now()}.json`);
        const backup = JSON.stringify(
          {
            project: context.projectId,
            branch: context.branch,
            createdAt: new Date().toISOString(),
            removedRecipes: removed,
            timingRows: missing,
            steps: await tx.recipeStep.findMany({ where: { recipeId: { in: ids } } }),
            lines: await tx.recipeLine.findMany({ where: { recipeId: { in: ids } } }),
            favorites: await tx.favorite.findMany({ where: { recipeId: { in: ids } } }),
            entries,
            plans: await tx.mealPlan.findMany({ where: { id: { in: planIds } } }),
          },
          null,
          2,
        );
        writeFileSync(backupPath, backup, { flag: 'wx' });
        assert.equal(readFileSync(backupPath, 'utf8'), backup, 'Backup verification failed');
        writeFileSync(backupPath + '.sha256', createHash('sha256').update(backup).digest('hex') + '\n', {
          flag: 'wx',
        });
        for (const recipe of missing) {
          const updated = desired.get(recipe.slug)!;
          const timing = (adjustments.timings as Record<string, { note: string }>)[recipe.slug];
          assert.ok(timing);
          await tx.recipe.update({
            where: { id: recipe.id },
            data: {
              totalMinutes: updated.totalMinutes,
              timingStatus: 'ESTIMATED',
              preconditions:
                `${recipe.preconditions.replace('Nguồn chưa ghi thời gian. ', '')} ${timing.note}`
                  .trim()
                  .slice(0, 500),
            },
          });
        }
        if (ids.length) {
          await tx.mealEntry.deleteMany({ where: { recipeId: { in: ids } } });
          await tx.favorite.deleteMany({ where: { recipeId: { in: ids } } });
          await tx.recipeStep.deleteMany({ where: { recipeId: { in: ids } } });
          await tx.recipeLine.deleteMany({ where: { recipeId: { in: ids } } });
          await tx.recipe.deleteMany({ where: { id: { in: ids } } });
          if (planIds.length)
            await tx.mealPlan.updateMany({
              where: { id: { in: planIds } },
              data: { version: { increment: 1 } },
            });
        }
        const after = await tx.recipe.findMany({ select: { id: true, totalMinutes: true } });
        assert.equal(after.length, all.length - ids.length);
        assert.ok(after.every((recipe) => recipe.totalMinutes !== null && recipe.totalMinutes > 0));
        assert.equal(await tx.recipe.count({ where: { slug: { in: adjustments.removedRecipeSlugs } } }), 0);
        return { ...summary, after: after.length, updatedTimings: missing.length, backupPath };
      },
      { isolationLevel: 'Serializable', timeout: 120000, maxWait: 15000 },
    );
    const report = resolve(
      root,
      '.review',
      `catalog-amendment-${process.argv.includes('--apply') ? 'applied' : 'preview'}.json`,
    );
    writeFileSync(report, JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ ...result, timings: result.timings.length, report }));
  } finally {
    await db.$disconnect();
  }
}
main().catch((error) => {
  console.error(
    error instanceof assert.AssertionError
      ? error.message
      : 'Catalog amendment failed; database credentials suppressed.',
  );
  process.exitCode = 1;
});
