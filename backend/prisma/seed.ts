import '../src/config';
import { Database } from '../src/db';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
async function seed() {
  if (process.env.NODE_ENV === 'production') throw new Error('Demo seed is forbidden in production.');
  const db = new Database();
  const data = JSON.parse(readFileSync(resolve(__dirname, '../../database/seeds/demo-recipes.json'), 'utf8'));
  try {
    for (const i of data.ingredients)
      await db.ingredient.upsert({
        where: { id: i.id },
        create: {
          id: i.id,
          name: i.name,
          aliasesText: JSON.stringify(i.aliases),
          unit: i.unit,
          category: i.category,
        },
        update: {},
      });
    for (const r of data.recipes) {
      const existing = await db.recipe.findUnique({ where: { slug: r.slug } });
      if (existing) continue;
      await db.recipe.create({
        data: {
          slug: r.slug,
          title: r.title,
          summary: r.summary,
          cuisine: r.cuisine,
          category: r.category,
          image: r.image,
          imageCredit: 'Unsplash · ảnh minh họa, không phải mẻ nấu thử',
          baseServings: r.baseServings,
          prepMinutes: r.time[0],
          cookMinutes: r.time[1],
          waitMinutes: r.time[2],
          totalMinutes: r.time[3],
          timingStatus: 'ESTIMATED',
          preconditions: r.preconditions || 'Chưa gồm cơm hoặc món ăn kèm; thời gian dự kiến chưa được đo.',
          difficulty: 'Chưa đánh giá qua nấu thử',
          contentStatus: 'DRAFT',
          sourceUrl: r.sourceUrl,
          sourceName: r.sourceName,
          lines: {
            create: r.ingredients.map(([id, qty, role]: [string, number, string?], index: number) => ({
              ingredientId: id,
              quantity: String(qty),
              unit: data.ingredients.find((i: any) => i.id === id).unit,
              role: role || 'SEASONING',
              sortOrder: index + 1,
            })),
          },
          steps: {
            create: r.steps.map(([title, instruction]: [string, string], index: number) => ({
              order: index + 1,
              title,
              instruction,
            })),
          },
        },
      });
    }
    console.log(`Demo seed ready: ${data.recipes.length} draft recipes; existing content preserved.`);
  } finally {
    await db.$disconnect();
  }
}
seed().catch((e) => {
  console.error('Seed failed:', e.code || e.message);
  process.exitCode = 1;
});
