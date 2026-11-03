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
export function discoveryRecipe(recipe: Recipe) {
  return {
    id: recipe.id,
    slug: recipe.slug,
    title: recipe.title,
    category: recipe.category,
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
