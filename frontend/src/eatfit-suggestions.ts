import type { Goal } from './eatfit-calculations';

type Candidate = {
  slug: string;
  title: string;
  ingredients: { name: string; note?: string | null }[];
};

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd');
}

type SuggestionOptions = {
  round?: number;
  seenSlugs?: string[];
  previousSlugs?: string[];
};

const dishTypes = [
  ['Salad', /\b(salad|xa lach|goi|nom)\b/],
  ['Bánh mì & cuốn', /\b(sandwich|banh mi|wrap|cuon)\b/],
  ['Cháo & yến mạch', /\b(chao|yen mach|oatmeal|overnight oats)\b/],
  ['Bún, mì & pasta', /\b(bun|mi|pasta|nui|pho|mien|spaghetti)\b/],
  ['Cơm & ngũ cốc', /\b(com|gao|quinoa|hat diem mach|bowl)\b/],
  ['Canh & súp', /\b(canh|sup|soup)\b/],
  ['Bữa nhẹ', /\b(sua chua|yogurt|sinh to|smoothie|pudding)\b/],
] as const;

const proteinTypes = [
  ['Gà', /\b(uc ga|thit ga|dui ga|canh ga|ga nuong|ga ap chao|ga hap|ga xe|ga xao|ga luoc|chao ga)\b/],
  ['Bò', /\b(thit bo|bo bit tet|bo ap chao|bo xao)\b/],
  ['Heo', /\b(thit heo|thit lon|than heo|than lon)\b/],
  ['Cá', /\b(ca hoi|ca ngu|ca thu|ca loc|ca basa|ca dieu hong)\b/],
  ['Hải sản', /\b(tom|muc|bach tuoc|hai san)\b/],
  ['Đậu', /\b(dau hu|dau phu|dau ga|dau lang|dau nanh)\b/],
  ['Trứng', /\b(trung)\b/],
] as const;

function tieBreaker(slug: string, round: number) {
  let hash = round + 1;
  for (const character of slug) hash = (Math.imul(hash, 31) + character.charCodeAt(0)) | 0;
  return hash >>> 0;
}

// Ingredient signals rank inspiration only; they do not estimate recipe calories.
export function suggestEatFitRecipes<T extends Candidate>(recipes: T[], goal: Goal, options: SuggestionOptions = {}) {
  const { round = 0, seenSlugs = [], previousSlugs = [] } = options;
  const weights = {
    lose: { protein: 3, vegetables: 4, starch: 0, fried: -4, sweet: -4 },
    maintain: { protein: 3, vegetables: 3, starch: 2, fried: -2, sweet: -3 },
    gain: { protein: 5, vegetables: 1, starch: 4, fried: -2, sweet: -3 },
  }[goal];
  const seen = new Set(seenSlugs);
  const previous = new Set(previousSlugs);
  const unique = [...new Map(recipes.map((recipe) => [recipe.slug, recipe])).values()];
  // Once the whole collection has been seen, begin another cycle, avoiding the last batch.
  if (unique.every((recipe) => seen.has(recipe.slug))) seen.clear();
  const ranked = unique.map((recipe) => {
    const ingredients = normalize(recipe.ingredients.map((item) => item.name).join('; '));
    const title = normalize(recipe.title);
    const protein = /\b(trung|uc ga|thit ga|thit bo|thit heo|thit lon|ca hoi|ca ngu|ca thu|ca loc|ca basa|ca dieu hong|tom|muc|dau hu|dau phu|dau ga|dau lang|dau nanh)\b/.test(ingredients);
    const vegetables = /\b(rau|cai|xa lach|bong cai|sup lo|bi ngoi|bi do|dua leo|dua chuot|ca chua|ca rot|nam|dau que|mang tay|cai bo xoi)\b/.test(ingredients);
    const starch = /\b(gao|com|yen mach|khoai|bun|mi|banh mi|quinoa|hat diem mach|nui)\b/.test(ingredients);
    const fried = /\b(chien|ran)\b/.test(title);
    const sweet = /\b(banh ngot|che|kem|tra sua)\b/.test(title);
    const score = Number(protein) * weights.protein + Number(vegetables) * weights.vegetables
      + Number(starch) * weights.starch + Number(fried) * weights.fried + Number(sweet) * weights.sweet;
    const reasons = [protein && 'Có nguồn đạm', vegetables && 'Có rau củ', starch && 'Có nguồn tinh bột']
      .filter((value): value is string => Boolean(value));
    const group = dishTypes.find(([, pattern]) => pattern.test(title))?.[0] || 'Món đạm & rau';
    const source = proteinTypes.find(([, pattern]) => pattern.test(title))?.[0]
      || proteinTypes.find(([, pattern]) => pattern.test(ingredients))?.[0] || '';
    const method = /\b(nuong|ap chao)\b/.test(title) ? 'Nướng / áp chảo'
      : /\b(hap|luoc)\b/.test(title) ? 'Hấp / luộc'
      : /\b(xao)\b/.test(title) ? 'Xào'
      : /\b(kho|ham)\b/.test(title) ? 'Kho / hầm'
      : fried ? 'Chiên' : group;
    return {
      recipe, score, group, source, method,
      reason: [group, ...reasons].join(' · '),
      tie: tieBreaker(recipe.slug, round),
    };
  });

  // Use the entire collection rather than paging through the first 18 sorted dishes.
  const alternatives = ranked.filter((item) => !previous.has(item.recipe.slug));
  let remaining = alternatives.length >= Math.min(6, ranked.length) ? alternatives : ranked;
  const selected: typeof ranked = [];
  const groups = new Map<string, number>();
  const sources = new Map<string, number>();
  const methods = new Map<string, number>();
  const count = (counts: Map<string, number>, key: string) => counts.get(key) || 0;

  while (selected.length < 6 && remaining.length) {
    // Prefer at most two dishes of a type/source. Relax only if the remaining data cannot fill the batch.
    const eligible = remaining.filter((item) => count(groups, item.group) < 2 && (!item.source || count(sources, item.source) < 2));
    const diverse = remaining.filter((item) => count(groups, item.group) < 2);
    const candidates = eligible.length ? eligible : diverse.length ? diverse : remaining;
    const utility = (item: (typeof ranked)[number]) => item.score
      + (seen.has(item.recipe.slug) ? 0 : 24)
      - (previous.has(item.recipe.slug) ? 48 : 0)
      - count(groups, item.group) * 8
      - (item.source ? count(sources, item.source) * 4 : 0)
      - count(methods, item.method) * 2;
    const best = [...candidates].sort((a, b) => utility(b) - utility(a) || a.tie - b.tie || a.recipe.slug.localeCompare(b.recipe.slug))[0];
    selected.push(best);
    groups.set(best.group, count(groups, best.group) + 1);
    if (best.source) sources.set(best.source, count(sources, best.source) + 1);
    methods.set(best.method, count(methods, best.method) + 1);
    remaining = remaining.filter((item) => item.recipe.slug !== best.recipe.slug);
  }
  return selected;
}
