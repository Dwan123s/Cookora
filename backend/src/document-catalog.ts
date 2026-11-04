import { createHash, randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import type { Database } from './db';
import adjustments from './catalog-adjustments.json';

const sourceKey = z.enum(['viet', 'han', 'nhat', 'trung', 'thai', 'menu']);
const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const imagePath = z.string().regex(/^\/recipes\/documents\/doc-[a-z0-9-]+\.webp$/);
export const DocumentCatalogSchema = z
  .object({
    version: z.literal(1),
    imageSupplements: z
      .array(
        z.object({
          name: z.string().min(1).max(200),
          sha256,
          sourceKey,
          recipeCount: z.number().int().positive(),
        }),
      )
      .optional(),
    sources: z
      .array(
        z.object({
          name: z.string().min(1),
          key: sourceKey,
          sha256,
          recipeCount: z.number().int().positive(),
          embeddedImageCount: z.number().int().nonnegative(),
          missingImages: z.array(z.string()),
        }),
      )
      .length(6),
    recipes: z
      .array(
        z.object({
          slug: z
            .string()
            .regex(/^doc-[a-z0-9-]+$/)
            .max(180),
          sourceKey,
          sourceOrdinal: z.number().int().positive(),
          sourceName: z.string().max(200),
          title: z.string().min(1).max(180),
          summary: z.string().max(1000),
          cuisine: z.enum(['VN', 'KR', 'JP', 'CN', 'TH', 'IT', 'WE']),
          category: z.string().max(60),
          section: z.string(),
          baseServings: z.number().int().min(1).max(20),
          totalMinutes: z.number().int().nonnegative().nullable(),
          preconditions: z.string().max(500),
          image: z.union([z.literal(''), imagePath]),
          imageCredit: z.string().max(200),
          images: z.array(
            z.object({
              path: imagePath,
              sourceAsset: z.string(),
              sourceSha256: sha256,
              sha256,
              sourceDocument: z.string().max(200).optional(),
              sourceSlide: z.number().int().positive().optional(),
            }),
          ),
          rawIngredients: z.string().min(1),
          ingredients: z
            .array(
              z.object({
                name: z.string().min(1).max(160),
                quantity: z
                  .string()
                  .regex(/^\d+(?:\.\d{1,6})?$/)
                  .refine((value) => Number(value) > 0)
                  .nullable(),
                unit: z.enum(['g', 'ml', 'piece']),
                note: z.string().max(300),
                role: z.enum(['MAIN', 'SUPPORTING', 'SEASONING']),
              }),
            )
            .min(1),
          steps: z
            .array(
              z.object({
                order: z.number().int().positive(),
                title: z.string().min(1).max(120),
                instruction: z.string().min(1),
              }),
            )
            .min(1),
        }),
      )
      .min(1),
  })
  .superRefine((catalog, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: 'custom', message });
    if (new Set(catalog.recipes.map((recipe) => recipe.slug)).size !== catalog.recipes.length)
      issue('Duplicate document recipe slug');
    if (new Set(catalog.sources.map((source) => source.key)).size !== 6)
      issue('All six sources are required');
    for (const source of catalog.sources) {
      const recipes = catalog.recipes.filter((recipe) => recipe.sourceKey === source.key);
      if (
        recipes.length !== source.recipeCount ||
        recipes.some(
          (recipe, index) => recipe.sourceOrdinal !== index + 1 || recipe.sourceName !== source.name,
        )
      )
        issue(`Source coverage mismatch: ${source.key}`);
      if (
        JSON.stringify(source.missingImages) !==
        JSON.stringify(recipes.filter((r) => !r.image).map((r) => r.slug))
      )
        issue(`Image coverage mismatch: ${source.key}`);
    }
    for (const recipe of catalog.recipes) {
      if (recipe.steps.some((step, index) => step.order !== index + 1))
        issue(`Invalid step order: ${recipe.slug}`);
      if ((recipe.images[0]?.path || '') !== recipe.image) issue(`Invalid cover image: ${recipe.slug}`);
      for (const image of recipe.images.filter((image) => image.sourceDocument)) {
        if (
          !image.sourceSlide ||
          !catalog.imageSupplements?.some(
            (supplement) =>
              supplement.name === image.sourceDocument && supplement.sourceKey === recipe.sourceKey,
          )
        )
          issue(`Unknown supplementary image source: ${recipe.slug}`);
      }
    }
    for (const supplement of catalog.imageSupplements || []) {
      const recipes = catalog.recipes.filter(
        (recipe) =>
          recipe.sourceKey === supplement.sourceKey &&
          recipe.images.some((image) => image.sourceDocument === supplement.name),
      );
      if (recipes.length !== supplement.recipeCount)
        issue(`Supplement coverage mismatch: ${supplement.name}`);
    }
  });

export type DocumentCatalog = z.infer<typeof DocumentCatalogSchema>;
// Keep document provenance intact while applying the user's catalog changes to stored rows.
export function activeDocumentRecipes(catalog: DocumentCatalog) {
  const removed = new Set(adjustments.removedRecipeSlugs);
  const timings: Record<string, { totalMinutes: number; note: string }> = adjustments.timings;
  return catalog.recipes
    .filter((recipe) => !removed.has(recipe.slug))
    .map((recipe) => {
      const timing = timings[recipe.slug];
      if (!timing || (recipe.totalMinutes !== null && recipe.totalMinutes > 0)) return recipe;
      return {
        ...recipe,
        totalMinutes: timing.totalMinutes,
        preconditions: `${recipe.preconditions.replace('Nguồn chưa ghi thời gian. ', '')} ${timing.note}`
          .trim()
          .slice(0, 500),
      };
    });
}
type Tx = Prisma.TransactionClient;
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

export function catalogRows(input: unknown) {
  const catalog = DocumentCatalogSchema.parse(input);
  const ingredients = new Map<string, Prisma.IngredientCreateManyInput>();
  const lines: Prisma.RecipeLineCreateManyInput[] = [];
  const steps: Prisma.RecipeStepCreateManyInput[] = [];
  const recipes: Prisma.RecipeCreateManyInput[] = [];
  for (const recipe of activeDocumentRecipes(catalog)) {
    const id = randomUUID();
    recipes.push({
      id,
      slug: recipe.slug,
      title: recipe.title,
      summary: recipe.summary,
      cuisine: recipe.cuisine,
      category: recipe.category,
      image: recipe.image,
      imageCredit: recipe.imageCredit,
      baseServings: recipe.baseServings,
      totalMinutes: recipe.totalMinutes,
      prepMinutes: null,
      cookMinutes: null,
      waitMinutes: null,
      timingStatus: 'ESTIMATED',
      preconditions: recipe.preconditions,
      difficulty: 'Chưa đánh giá qua nấu thử',
      contentStatus: 'DRAFT',
      sourceName: recipe.sourceName,
      sourceUrl: '',
    });
    for (const [index, item] of recipe.ingredients.entries()) {
      const ingredientId = `doc-${createHash('sha256')
        .update(`${item.name.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim()}:${item.unit}`)
        .digest('hex')
        .slice(0, 40)}`;
      ingredients.set(ingredientId, {
        id: ingredientId,
        name: item.name,
        unit: item.unit,
        category: 'Nguyên liệu công thức',
        aliasesText: JSON.stringify([...new Set([item.name.toLowerCase(), normalize(item.name)])]),
      });
      lines.push({
        id: randomUUID(),
        recipeId: id,
        ingredientId,
        quantity: item.quantity,
        unit: item.unit,
        note: item.note,
        role: item.role,
        sortOrder: index + 1,
        optional: false,
      });
    }
    for (const step of recipe.steps) steps.push({ id: randomUUID(), recipeId: id, ...step });
  }
  return { catalog, recipes, ingredients: [...ingredients.values()], lines, steps };
}

async function batches<T>(rows: T[], write: (batch: T[]) => Promise<unknown>) {
  // Stay below SQL Server's 2100-parameter limit, including wide Recipe rows.
  for (let offset = 0; offset < rows.length; offset += 50) await write(rows.slice(offset, offset + 50));
}

async function insertRows(tx: Tx, rows: ReturnType<typeof catalogRows>) {
  await batches(rows.ingredients, (data) => tx.ingredient.createMany({ data }));
  await batches(rows.recipes, (data) => tx.recipe.createMany({ data }));
  await batches(rows.lines, (data) => tx.recipeLine.createMany({ data }));
  await batches(rows.steps, (data) => tx.recipeStep.createMany({ data }));
}

export async function snapshotCatalog(tx: Tx) {
  // No account credentials or sessions are included in a recipe backup.
  return {
    recipes: await tx.recipe.findMany({ orderBy: { id: 'asc' } }),
    ingredients: await tx.ingredient.findMany({ orderBy: { id: 'asc' } }),
    lines: await tx.recipeLine.findMany({ orderBy: { id: 'asc' } }),
    steps: await tx.recipeStep.findMany({ orderBy: { id: 'asc' } }),
    favorites: await tx.favorite.findMany(),
    entries: await tx.mealEntry.findMany(),
    plans: await tx.mealPlan.findMany(),
    shoppingLists: await tx.shoppingList.findMany(),
    shoppingItems: await tx.shoppingItem.findMany(),
  };
}
export type CatalogSnapshot = Awaited<ReturnType<typeof snapshotCatalog>>;

export async function replaceDocumentCatalog(
  db: Database,
  input: unknown,
  saveBackup: (snapshot: CatalogSnapshot) => Promise<void>,
) {
  const rows = catalogRows(input);
  return db.$transaction(
    async (tx) => {
      const before = await snapshotCatalog(tx);
      await saveBackup(before); // Abort before deletion if backup cannot be saved.
      const affectedPlans = [
        ...new Set([
          ...before.entries.map((entry) => entry.planId),
          ...before.shoppingLists.map((list) => list.planId),
        ]),
      ];
      await tx.shoppingItem.deleteMany();
      await tx.shoppingList.deleteMany();
      await tx.mealEntry.deleteMany();
      await tx.favorite.deleteMany();
      await tx.recipeStep.deleteMany();
      await tx.recipeLine.deleteMany();
      await tx.recipe.deleteMany();
      await tx.ingredient.deleteMany();
      if (affectedPlans.length)
        await tx.mealPlan.updateMany({
          where: { id: { in: affectedPlans } },
          data: { version: { increment: 1 } },
        });
      await insertRows(tx, rows);
      if ((await tx.recipe.count()) !== rows.recipes.length) throw new Error('Replacement count mismatch');
      return {
        removed: before.recipes.length,
        created: rows.recipes.length,
        ingredients: rows.ingredients.length,
        lines: rows.lines.length,
        steps: rows.steps.length,
        removedFavorites: before.favorites.length,
        removedMealEntries: before.entries.length,
        clearedShoppingLists: before.shoppingLists.length,
      };
    },
    { isolationLevel: 'Serializable', timeout: 180000, maxWait: 15000 },
  );
}

// Repeated seeds only add missing document recipes; never reintroduce legacy fixtures.
export async function seedDocumentCatalog(db: Database, input: unknown) {
  const catalog = DocumentCatalogSchema.parse(input);
  const active = activeDocumentRecipes(catalog);
  return db.$transaction(
    async (tx) => {
      const existing = new Set(
        (await tx.recipe.findMany({ select: { slug: true } })).map((recipe) => recipe.slug),
      );
      const missing = active.filter((recipe) => !existing.has(recipe.slug));
      if (!missing.length) return { created: 0, preserved: active.length };
      const rows = catalogRows(catalog);
      const wanted = new Set(missing.map((recipe) => recipe.slug));
      rows.recipes = rows.recipes.filter((recipe) => wanted.has(recipe.slug));
      const ids = new Set(rows.recipes.map((recipe) => recipe.id));
      rows.lines = rows.lines.filter((line) => ids.has(line.recipeId));
      rows.steps = rows.steps.filter((step) => ids.has(step.recipeId));
      const ingredientIds = new Set(rows.lines.map((line) => line.ingredientId));
      const present = new Set(
        (await tx.ingredient.findMany({ select: { id: true } })).map((item) => item.id),
      );
      rows.ingredients = rows.ingredients.filter(
        (item) => ingredientIds.has(item.id) && !present.has(item.id),
      );
      await insertRows(tx, rows);
      return { created: missing.length, preserved: active.length - missing.length };
    },
    { isolationLevel: 'Serializable', timeout: 180000, maxWait: 15000 },
  );
}
