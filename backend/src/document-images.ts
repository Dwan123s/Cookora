import type { Database } from './db';
import { DocumentCatalogSchema } from './document-catalog';

export async function applySupplementaryImages(
  db: Database,
  input: unknown,
  saveBackup: (rows: unknown) => Promise<void>,
) {
  const catalog = DocumentCatalogSchema.parse(input);
  const wanted = catalog.recipes.filter((recipe) => recipe.images.some((image) => image.sourceDocument));
  if (!wanted.length) throw new Error('No supplementary images found');
  return db.$transaction(
    async (tx) => {
      const before = await tx.recipe.findMany({
        where: { slug: { in: wanted.map((recipe) => recipe.slug) } },
        select: { id: true, slug: true, title: true, cuisine: true, image: true, imageCredit: true },
      });
      const existing = new Map(before.map((recipe) => [recipe.slug, recipe]));
      const changes = wanted.filter((recipe) => {
        const actual = existing.get(recipe.slug);
        if (!actual || actual.title !== recipe.title || actual.cuisine !== recipe.cuisine)
          throw new Error(`Recipe does not match image source: ${recipe.slug}`);
        if (actual.image && actual.image !== recipe.image)
          throw new Error(`Recipe already has a different image: ${recipe.slug}`);
        return actual.image !== recipe.image || actual.imageCredit !== recipe.imageCredit;
      });
      if (changes.length) await saveBackup(before);
      for (const recipe of changes) {
        const actual = existing.get(recipe.slug)!;
        const updated = await tx.recipe.updateMany({
          where: { id: actual.id, slug: actual.slug, image: actual.image, imageCredit: actual.imageCredit },
          data: { image: recipe.image, imageCredit: recipe.imageCredit },
        });
        if (updated.count !== 1) throw new Error(`Image changed during import: ${recipe.slug}`);
      }
      return { matched: wanted.length, updated: changes.length, preserved: wanted.length - changes.length };
    },
    { isolationLevel: 'Serializable', timeout: 60000, maxWait: 15000 },
  );
}
