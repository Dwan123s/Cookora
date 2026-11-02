import '../src/config';
import { Database } from '../src/db';
import { THAI_50_RECIPES } from '../../scripts/thai-50-recipes-data.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapUnitAndQuantity(qtyStr: string, unitRaw: string): { quantity: string; unit: string; note: string; ingUnit: 'g' | 'ml' | 'piece' } {
  const q = parseFloat(qtyStr) || 1;
  const unit = unitRaw.trim().toLowerCase();

  if (unit === 'g') {
    return { quantity: String(q), unit: 'g', note: `${q} g`, ingUnit: 'g' };
  }
  if (unit === 'kg') {
    return { quantity: String(q), unit: 'g', note: `${q} kg`, ingUnit: 'g' };
  }
  if (unit === 'ml') {
    return { quantity: String(q), unit: 'ml', note: `${q} ml`, ingUnit: 'ml' };
  }
  if (unit === 'l' || unit === 'lít') {
    return { quantity: String(q * 1000), unit: 'ml', note: `${q} l`, ingUnit: 'ml' };
  }

  // Spoons
  if (unit.includes('thìa canh') || unit.includes('muỗng canh')) {
    const ml = Math.max(1, Math.round(q * 15));
    return { quantity: String(ml), unit: 'ml', note: `${qtyStr} thìa canh`, ingUnit: 'ml' };
  }
  if (unit.includes('thìa cà phê') || unit.includes('muỗng cà phê')) {
    const ml = Math.max(1, Math.round(q * 5));
    return { quantity: String(ml), unit: 'ml', note: `${qtyStr} thìa cà phê`, ingUnit: 'ml' };
  }

  // Count items -> piece
  return { quantity: String(q), unit: 'piece', note: `${qtyStr} ${unitRaw}`, ingUnit: 'piece' };
}

async function run() {
  const db = new Database();
  console.log(`Starting to seed 50 Thai recipes into database...`);

  try {
    for (const recipe of THAI_50_RECIPES) {
      console.log(`Processing [${recipe.id}/50]: ${recipe.title} (${recipe.slug})`);

      // 1. Upsert ingredients
      const linesData = [];
      for (let i = 0; i < recipe.ingredients.length; i++) {
        const ing = recipe.ingredients[i];
        const ingId = 'thai-' + slugify(ing.name);
        const mapped = mapUnitAndQuantity(ing.quantity, ing.unit);

        await db.ingredient.upsert({
          where: { id: ingId },
          create: {
            id: ingId,
            name: ing.name,
            aliasesText: JSON.stringify([slugify(ing.name), ing.name.toLowerCase()]),
            unit: mapped.ingUnit,
            category: recipe.category,
          },
          update: {
            name: ing.name,
            unit: mapped.ingUnit,
          },
        });

        linesData.push({
          ingredientId: ingId,
          quantity: mapped.quantity,
          unit: mapped.unit,
          role: ing.role || 'SEASONING',
          note: mapped.note,
          sortOrder: i + 1,
        });
      }

      // 2. Check if recipe exists
      const existing = await db.recipe.findUnique({
        where: { slug: recipe.slug },
        include: { lines: true, steps: true },
      });

      const recipePayload = {
        title: recipe.title,
        summary: recipe.summary,
        cuisine: 'TH',
        category: recipe.category,
        image: `/recipes/thai/${recipe.slug}.jpg`,
        imageCredit: 'Tourism Authority of Thailand / Cookora',
        baseServings: 1,
        prepMinutes: recipe.prepMinutes,
        cookMinutes: recipe.cookMinutes,
        totalMinutes: recipe.totalMinutes,
        timingStatus: 'VERIFIED',
        preconditions: recipe.preconditions,
        difficulty: 'Dễ',
        contentStatus: 'APPROVED',
        sourceName: 'Tourism Authority of Thailand',
        sourceUrl: 'https://www.tourismthailand.my/thaifood_recipes.php',
        lines: {
          create: linesData,
        },
        steps: {
          create: recipe.steps.map((st) => ({
            order: st.order,
            title: st.title,
            instruction: st.instruction,
          })),
        },
      };

      if (existing) {
        await db.recipeLine.deleteMany({ where: { recipeId: existing.id } });
        await db.recipeStep.deleteMany({ where: { recipeId: existing.id } });

        await db.recipe.update({
          where: { id: existing.id },
          data: recipePayload,
        });
        console.log(`Updated existing recipe: ${recipe.slug}`);
      } else {
        await db.recipe.create({
          data: {
            slug: recipe.slug,
            ...recipePayload,
          },
        });
        console.log(`Created new recipe: ${recipe.slug}`);
      }
    }

    const count = await db.recipe.count({ where: { cuisine: 'TH' } });
    console.log(`Successfully seeded! Total Thai recipes in database: ${count}`);
  } catch (err) {
    console.error('Error seeding Thai recipes:', err);
  } finally {
    await db.$disconnect();
  }
}

run();
