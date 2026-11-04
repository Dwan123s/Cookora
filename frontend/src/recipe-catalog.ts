import type { Envelope, Recipe } from '@cookora/contracts';
import { request } from './api';
import { recipeSummary } from './recipe-media';

type FetchPage = (path: string) => Promise<Envelope<Recipe[]>>;

export async function loadRecipeCatalog(
  fetchPage: FetchPage = (path) => request<Recipe[]>(path),
): Promise<Recipe[]> {
  const first = await fetchPage('/recipes?pageSize=50&page=1');
  const pagination = first.meta.pagination as { totalPages?: number } | undefined;
  const pages = pagination?.totalPages ?? 1;
  if (!Number.isInteger(pages) || pages < 0 || pages > 10000)
    throw new Error('Thông tin phân trang công thức không hợp lệ.');
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, index) =>
      fetchPage(`/recipes?pageSize=50&page=${index + 2}`),
    ),
  );
  return [...first.data, ...rest.flatMap((page) => page.data)];
}

const cuisineNames: Record<string, string> = {
  VN: 'Món Việt',
  KR: 'Hàn Quốc',
  JP: 'Nhật Bản',
  CN: 'Trung Quốc',
  TH: 'Thái Lan',
  IT: 'Ý',
  WE: 'Âu & Mỹ',
  FR: 'Pháp',
};
export function resolveCategory(title: string, category: string): string {
  const normalized = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd');
  // "Da cá" names the crispy peanut coating, not a seafood ingredient.
  if (/\b(dau phong|lac) da ca\b/.test(normalized)) return 'Gỏi & món ăn nhẹ';
  const name = normalized.replace(/\b(nam dui ga|dau ga|bo xoi|ca chua|ca rot|ca tim)\b/g, 'rau');
  const vegetables = /\b(rau|dot bi|su su|dau bap|nam|kho qua|dau que|dau co ve|dau cove|bap cai|mang|sup lo|bong cai|cai ngot|cai thia|cai xanh|cai thao|mong toi|rau den|rau ngot|bau|muop|bi dao|bi do|su hao|cu cai|khoai tay|khoai lang|khoai mon|dua leo|dua chuot|ngo|dau phu|dau hu|tau hu|kimchi|kim chi|gia do|rong bien)\b/.test(name);
  const meat = /\b(thit|suon|bo|heo|lon|ga|vit|ca|tom|muc|bach tuoc|ngheu|so|oc|hen|cua|ghe|cha|chan gio|gio heo|gio lua|gio thu|gio song|nem|lap xuong|xuc xich|chim|ech|luon|ba chi|ba roi|pate|hau|sui cao|tieu long bao)\b/.test(name);
  const salad = /\b(salad|goi|nom)\b/.test(name);
  if (vegetables && !meat && !salad &&
      (category === 'Thịt & hải sản' || category === 'Gỏi & món ăn nhẹ' || /\b(xao|luoc|hap|kho)\b/.test(name))) {
    return 'Rau củ';
  }
  return category;
}

export function discoveryRecipe(recipe: Recipe) {
  return {
    id: recipe.id,
    slug: recipe.slug,
    title: recipe.title,
    category: resolveCategory(recipe.title, recipe.category),
    cuisine: recipe.cuisine,
    cuisineName: cuisineNames[recipe.cuisine] || recipe.cuisine,
    image: recipe.image,
    time: recipe.totalMinutes,
    servings: recipe.baseServings,
    difficulty: recipe.difficulty,
    difficultyBasis: recipe.difficultyBasis,
    summary: recipeSummary(recipe),
    isDraft: recipe.contentStatus === 'DRAFT',
  };
}

export function cuisineCategoryCounts(recipes: Pick<Recipe, 'title' | 'category' | 'cuisine'>[], cuisine: string) {
  const counts = new Map<string, number>();
  for (const recipe of recipes) {
    if (cuisine && !(cuisine === 'WE' ? ['WE', 'IT', 'FR'].includes(recipe.cuisine) : recipe.cuisine === cuisine)) continue;
    const category = resolveCategory(recipe.title, recipe.category);
    counts.set(category, (counts.get(category) || 0) + 1);
  }
  return counts;
}
