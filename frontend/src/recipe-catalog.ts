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
  if (category === 'Thịt & hải sản' || category === 'Gỏi & món ăn nhẹ') {
    const isVeg =
      /rau|su su|đọt bí|đậu bắp|cà tím|nấm|khổ qua|đậu que|đậu cô ve|đậu cove|bắp cải|măng|súp lơ|bông cải|rau muống|cải ngọt|cải thìa|cải xanh|cải thảo|mồng tơi|rau dền|rau ngót|bầu|mướp|bí đao|bí đỏ|su hào|củ cải|khoai tây|khoai lang|khoai môn|dưa leo|dưa chuột|bắp nướng|ngô|đậu phụ|đậu hũ|tàu hũ|cà chua|kimchi|kim chi|giá đỗ|rong biển/i.test(
        title.replace(/nấm đùi gà/gi, 'nấm'),
      );
    const hasMeat =
      /thịt|sườn|bò|heo|lợn|gà|vịt|cá|tôm|mực|bạch tuộc|nghêu|sò|ốc|hến|cua|ghẹ|chả|chân giò|giò heo|giò lụa|giò thủ|chả giò|giò sống|nem|lạp xưởng|xúc xích|chim|ếch|lươn|ba chỉ|ba rọi|pate|bì lợn|hàu|sủi cảo|tiểu long bao|hồ lô/i.test(
        title.replace(/nấm đùi gà/gi, 'nấm'),
      );
    if (isVeg && !hasMeat) {
      return 'Rau củ';
    }
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
