import '../src/config';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Database } from '../src/db';
import { databaseProvider } from '../src/config';
import adjustments from '../src/catalog-adjustments.json';

const slug = 'doc-nhat-013-com-nam-nhat-ban-kinoko-gohan';
const title = 'Cơm nấm Nhật Bản (きのこご飯 – Kinoko Gohan)';

async function main() {
  assert.ok(adjustments.removedRecipeSlugs.includes(slug));
  if (databaseProvider === 'postgresql') {
    const context = JSON.parse(readFileSync(resolve(__dirname, '../../.neon'), 'utf8'));
    assert.equal(context.projectId, 'polished-bonus-47222343');
    assert.equal(context.branch, 'production');
    assert.equal(process.env.NEON_BRANCH, 'production');
  } else assert.ok(['localhost', '127.0.0.1'].includes(process.env.DB_HOST || 'localhost'));

  const db = new Database();
  try {
    const result = await db.$transaction(
      async (tx) => {
        const before = await tx.recipe.count();
        const recipe = await tx.recipe.findUnique({ where: { slug } });
        if (!recipe) return { provider: databaseProvider, slug, alreadyRemoved: true, before, after: before };
        assert.equal(recipe.title, title);
        assert.equal(recipe.cuisine, 'JP');
        const where = { recipeId: recipe.id };
        const entries = await tx.mealEntry.findMany({ where });
        const planIds = [...new Set(entries.map((entry) => entry.planId))];
        const favorites = await tx.favorite.findMany({ where });
        const summary = {
          provider: databaseProvider,
          slug,
          before,
          mealEntries: entries.length,
          favorites: favorites.length,
        };
        if (!process.argv.includes('--apply')) return { ...summary, mode: 'preview' };

        const directory = resolve(__dirname, '../../.review/catalog-backups');
        mkdirSync(directory, { recursive: true });
        const backupPath = resolve(directory, `kinoko-gohan-${databaseProvider}-${Date.now()}.json`);
        const backup = JSON.stringify(
          {
            createdAt: new Date().toISOString(),
            provider: databaseProvider,
            recipe,
            entries,
            favorites,
            steps: await tx.recipeStep.findMany({ where }),
            lines: await tx.recipeLine.findMany({ where }),
            plans: await tx.mealPlan.findMany({ where: { id: { in: planIds } } }),
          },
          null,
          2,
        );
        writeFileSync(backupPath, backup, { flag: 'wx' });
        assert.equal(readFileSync(backupPath, 'utf8'), backup);
        writeFileSync(backupPath + '.sha256', createHash('sha256').update(backup).digest('hex') + '\n', {
          flag: 'wx',
        });

        await tx.mealEntry.deleteMany({ where });
        await tx.favorite.deleteMany({ where });
        await tx.recipeStep.deleteMany({ where });
        await tx.recipeLine.deleteMany({ where });
        await tx.recipe.delete({ where: { id: recipe.id } });
        if (planIds.length)
          await tx.mealPlan.updateMany({
            where: { id: { in: planIds } },
            data: { version: { increment: 1 } },
          });
        const after = await tx.recipe.count();
        assert.equal(after, before - 1);
        assert.equal(await tx.recipe.count({ where: { slug } }), 0);
        return { ...summary, mode: 'apply', after, backupPath };
      },
      { isolationLevel: 'Serializable', timeout: 60000, maxWait: 15000 },
    );
    console.log(JSON.stringify(result));
  } finally {
    await db.$disconnect();
  }
}
main().catch(() => {
  console.error('Kinoko Gohan removal failed; credentials suppressed.');
  process.exitCode = 1;
});
