import '../src/config';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Database } from '../src/db';
import { databaseProvider } from '../src/config';
import { activeDocumentRecipes, DocumentCatalogSchema } from '../src/document-catalog';

// Explicit release of the user's complete document catalog; does not alter recipe facts or user data.
async function main() {
  const root = resolve(__dirname, '../..');
  const context = JSON.parse(readFileSync(resolve(root, '.neon'), 'utf8'));
  if (
    process.env.PUBLISH_DOCUMENT_CATALOG !== 'true' ||
    databaseProvider !== 'postgresql' ||
    context.projectId !== 'polished-bonus-47222343' ||
    context.branch !== 'production' ||
    process.env.NEON_BRANCH !== 'production'
  )
    throw new Error('Publication requires the explicitly acknowledged Cookora Neon production project.');
  const source = DocumentCatalogSchema.parse(
    JSON.parse(readFileSync(resolve(root, 'database/seeds/document-recipes.json'), 'utf8')),
  );
  if (source.recipes.length !== 419) throw new Error('Unexpected document catalog size.');
  const active = activeDocumentRecipes(source);
  const db = new Database();
  try {
    const outcome = await db.$transaction(
      async (tx) => {
        const rows = await tx.recipe.findMany({
          where: { slug: { in: active.map((r) => r.slug) } },
          select: { id: true, slug: true, sourceName: true, contentStatus: true },
        });
        if (rows.length !== active.length || new Set(rows.map((r) => r.slug)).size !== active.length)
          throw new Error('Cloud catalog does not match the complete source.');
        const bySlug = new Map(active.map((r) => [r.slug, r]));
        if (rows.some((r) => r.sourceName !== bySlug.get(r.slug)!.sourceName))
          throw new Error('Source metadata mismatch; publication stopped.');
        const review = resolve(root, '.review');
        mkdirSync(review, { recursive: true });
        writeFileSync(
          resolve(review, `catalog-publication-${Date.now()}.json`),
          JSON.stringify(
            {
              project: context.projectId,
              branch: context.branch,
              before: rows,
              reason: 'User explicitly requested the full catalog without draft labels.',
            },
            null,
            2,
          ),
        );
        const updated = await tx.recipe.updateMany({
          where: { id: { in: rows.map((r) => r.id) }, contentStatus: 'DRAFT' },
          data: { contentStatus: 'APPROVED' },
        });
        const published = await tx.recipe.count({
          where: { id: { in: rows.map((r) => r.id) }, contentStatus: 'APPROVED' },
        });
        if (published !== active.length) throw new Error('Incomplete publication; transaction rolled back.');
        return { changed: updated.count, published };
      },
      { isolationLevel: 'Serializable', timeout: 30000 },
    );
    console.log(
      JSON.stringify({
        ...outcome,
        scope: `${active.length} active source-document recipes`,
        factsAndTimingUnchanged: true,
      }),
    );
  } finally {
    await db.$disconnect();
  }
}
main().catch(() => {
  console.error(
    'Catalog publication stopped; check exact source scope and connection. Credentials are not printed.',
  );
  process.exitCode = 1;
});
