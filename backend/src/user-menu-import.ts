import { createHash } from 'node:crypto';
import { z } from 'zod';
import type { Database } from './db';

export const UserMenuSchema = z
  .object({
    sourceName: z.literal('Menu món.docx'),
    sourceSha256: z.string().regex(/^[a-f0-9]{64}$/),
    recipes: z
      .array(
        z.object({
          sourceNumber: z.number().int().min(1).max(50),
          slug: z
            .string()
            .regex(/^menu-[a-z0-9-]+$/)
            .max(180),
          title: z.string().min(1).max(180),
          summary: z.string().max(1000),
          cuisine: z.enum(['VN', 'WE', 'KR', 'JP', 'IT']),
          category: z.string().max(60),
          baseServings: z.literal(1),
          totalMinutes: z.number().int().nonnegative().nullable(),
          preconditions: z.string().max(500),
          image: z.string(),
          rawIngredients: z.string().min(1),
          timeText: z.string(),
          section: z.string(),
          ingredients: z
            .array(
              z.object({
                name: z.string().min(1).max(160),
                quantity: z
                  .string()
                  .regex(/^\d+(?:\.\d+)?$/)
                  .nullable(),
                unit: z.enum(['g', 'ml', 'piece', '']),
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
      .length(50),
  })
  .superRefine((source, ctx) => {
    if (new Set(source.recipes.map((recipe) => recipe.slug)).size !== 50)
      ctx.addIssue({ code: 'custom', message: 'Duplicate menu recipes' });
    if (
      source.recipes.some(
        (recipe, index) =>
          recipe.sourceNumber !== index + 1 ||
          recipe.steps.some((step, stepIndex) => step.order !== stepIndex + 1),
      )
    ) {
      ctx.addIssue({ code: 'custom', message: 'Source recipe or step ordering is invalid' });
    }
  });

const normalized = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();
export async function importUserMenu(db: Database, input: unknown) {
  const source = UserMenuSchema.parse(input);
  return db.$transaction(
    async (tx) => {
      const created: string[] = [],
        preserved: string[] = [];
      for (const recipe of source.recipes) {
        const existing = await tx.recipe.findUnique({ where: { slug: recipe.slug }, select: { id: true } });
        if (existing) {
          preserved.push(recipe.slug);
          continue;
        }
        const lines = [];
        for (const [index, ingredient] of recipe.ingredients.entries()) {
          const unit = ingredient.unit || 'piece';
          const ingredientId = `menu-${createHash('sha256')
            .update(`${normalized(ingredient.name)}:${unit}`)
            .digest('hex')
            .slice(0, 24)}`;
          await tx.ingredient.upsert({
            where: { id: ingredientId },
            update: {},
            create: {
              id: ingredientId,
              name: ingredient.name,
              aliasesText: JSON.stringify([ingredient.name.toLowerCase(), normalized(ingredient.name)]),
              unit,
              category: 'Nguyên liệu menu',
            },
          });
          lines.push({
            ingredientId,
            quantity: ingredient.quantity,
            unit,
            note: ingredient.note,
            role: ingredient.role,
            sortOrder: index + 1,
          });
        }
        await tx.recipe.create({
          data: {
            slug: recipe.slug,
            title: recipe.title,
            summary: recipe.summary,
            cuisine: recipe.cuisine,
            category: recipe.category,
            image: recipe.image,
            imageCredit: recipe.image ? 'Ảnh minh họa tạo bằng AI · Không phải mẻ nấu thử' : 'Chưa có ảnh',
            baseServings: recipe.baseServings,
            totalMinutes: recipe.totalMinutes,
            prepMinutes: null,
            cookMinutes: null,
            waitMinutes: null,
            timingStatus: 'ESTIMATED',
            preconditions: recipe.preconditions,
            difficulty: 'Chưa đánh giá qua nấu thử',
            contentStatus: 'DRAFT',
            sourceName: source.sourceName,
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
