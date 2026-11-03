import { createHash } from 'node:crypto';
import Decimal from 'decimal.js';
import { z } from 'zod';
import type { Database } from './db';

const PositiveDecimal = z
  .string()
  .refine((value) => /^\d+(?:\.\d+)?$/.test(value) && new Decimal(value).gt(0), 'Invalid quantity');
export const ThaiCatalogSchema = z
  .array(
    z.object({
      slug: z
        .string()
        .regex(/^[a-z0-9-]+$/)
        .max(180),
      title: z.string().min(1).max(180),
      summary: z.string().max(1000),
      category: z.string().max(60),
      baseServings: z.number().int().min(1).max(20),
      prepMinutes: z.number().int().nonnegative(),
      cookMinutes: z.number().int().nonnegative(),
      totalMinutes: z.number().int().nonnegative(),
      preconditions: z.string().max(500),
      image: z.string().regex(/^\/recipes\/thai\/[a-z0-9-]+\.jpg$/),
      ingredients: z
        .array(
          z.object({
            name: z.string().min(1).max(160),
            quantity: PositiveDecimal,
            unit: z.string().min(1),
            role: z.enum(['MAIN', 'SUPPORTING', 'SEASONING']),
          }),
        )
        .min(1),
      steps: z
        .array(
          z.object({
            order: z.number().int().positive(),
            title: z.string().min(1).max(120),
            instruction: z.string().min(20),
          }),
        )
        .min(1),
    }),
  )
  .length(50)
  .superRefine((recipes, ctx) => {
    if (new Set(recipes.map((recipe) => recipe.slug)).size !== recipes.length)
      ctx.addIssue({ code: 'custom', message: 'Duplicate recipe slugs' });
    recipes.forEach((recipe, index) => {
      if (recipe.steps.some((step, order) => step.order !== order + 1))
        ctx.addIssue({ code: 'custom', path: [index, 'steps'], message: 'Invalid step ordering' });
    });
  });

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
export function thaiIngredient(name: string, quantity: string, rawUnit: string) {
  const unit = rawUnit.trim().toLowerCase();
  const value = new Decimal(quantity);
  if (!value.isFinite() || !value.gt(0)) throw new Error('Invalid ingredient quantity');
  let canonicalUnit: 'g' | 'ml' | 'piece' = 'piece';
  let canonicalQuantity = value;
  if (unit === 'g' || unit === 'kg') {
    canonicalUnit = 'g';
    if (unit === 'kg') canonicalQuantity = value.mul(1000);
  } else if (unit === 'ml' || unit === 'l' || unit === 'lít') {
    canonicalUnit = 'ml';
    if (unit !== 'ml') canonicalQuantity = value.mul(1000);
  } else if (/^(thìa|muỗng) canh$/.test(unit)) {
    canonicalUnit = 'ml';
    canonicalQuantity = value.mul(15);
  } else if (/^(thìa|muỗng) cà phê$/.test(unit)) {
    canonicalUnit = 'ml';
    canonicalQuantity = value.mul(5);
  }
  const stem = normalize(name).slice(0, 54);
  const hash = createHash('sha256')
    .update(`${normalize(name)}:${canonicalUnit}`)
    .digest('hex')
    .slice(0, 8);
  return {
    id: `thai-${stem}-${hash}`,
    name,
    quantity: canonicalQuantity.toString(),
    unit: canonicalUnit,
    note: `${quantity} ${rawUnit}`,
    aliasesText: JSON.stringify([name.toLowerCase(), normalize(name).replace(/-/g, ' ')]),
  };
}

export async function importThaiCatalog(db: Database, input: unknown) {
  const recipes = ThaiCatalogSchema.parse(input);
  return db.$transaction(
    async (tx) => {
      const created: string[] = [],
        preserved: string[] = [];
      for (const recipe of recipes) {
        const existing = await tx.recipe.findUnique({ where: { slug: recipe.slug }, select: { id: true } });
        if (existing) {
          preserved.push(recipe.slug);
          continue;
        }
        const lines = [];
        for (const [index, ingredient] of recipe.ingredients.entries()) {
          const mapped = thaiIngredient(ingredient.name, ingredient.quantity, ingredient.unit);
          await tx.ingredient.upsert({
            where: { id: mapped.id },
            update: {},
            create: {
              id: mapped.id,
              name: mapped.name,
              aliasesText: mapped.aliasesText,
              unit: mapped.unit,
              category: recipe.category,
            },
          });
          lines.push({
            ingredientId: mapped.id,
            quantity: mapped.quantity,
            unit: mapped.unit,
            note: mapped.note,
            role: ingredient.role,
            sortOrder: index + 1,
          });
        }
        await tx.recipe.create({
          data: {
            slug: recipe.slug,
            title: recipe.title,
            summary: recipe.summary,
            cuisine: 'TH',
            category: recipe.category,
            image: recipe.image,
            imageCredit: 'Ảnh minh họa · Bộ dữ liệu món Thái Cookora',
            baseServings: recipe.baseServings,
            prepMinutes: recipe.prepMinutes,
            cookMinutes: recipe.cookMinutes,
            totalMinutes: recipe.totalMinutes,
            waitMinutes: 0,
            timingStatus: 'ESTIMATED',
            preconditions: recipe.preconditions,
            difficulty: 'Chưa đánh giá qua nấu thử',
            contentStatus: 'DRAFT',
            sourceName: 'Bộ 50 món Thái local · Chưa biên tập/nấu thử',
            sourceUrl: '',
            lines: { create: lines },
            steps: { create: recipe.steps },
          },
        });
        created.push(recipe.slug);
      }
      return { created, preserved };
    },
    { isolationLevel: 'Serializable', timeout: 120000 },
  );
}
