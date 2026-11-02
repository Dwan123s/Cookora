const fs = require('fs');
const { THAI_50_RECIPES } = require('./thai-50-recipes-data.js');

const starterRecipes = [
  {
    id: 'starter-1',
    slug: 'dau-hu-sot-ca-chua',
    title: 'Đậu hũ sốt cà chua',
    category: 'Thịt & hải sản',
    cuisine: 'VN',
    cuisineName: 'Món Việt',
    image: '/images/hero/tofu.jpg',
    time: 28,
    servings: 2,
    difficulty: 'Dễ',
    summary: 'Đậu hũ non sốt cà chua chua ngọt dịu nhẹ, ăn cùng cơm nóng rất ngon.'
  },
  {
    id: 'starter-2',
    slug: 'com-kimchi',
    title: 'Cơm kimchi cho ngày bận rộn',
    category: 'Cơm, mì & bún',
    cuisine: 'KR',
    cuisineName: 'Hàn Quốc',
    image: '/images/hero/kimchi.jpg',
    time: 18,
    servings: 2,
    difficulty: 'Dễ',
    summary: 'Cơm chiên kimchi chua cay giòn giòn, kèm trứng ốp la béo ngậy.'
  },
  {
    id: 'starter-3',
    slug: 'com-ga-trung',
    title: 'Oyakodon · cơm gà trứng',
    category: 'Cơm, mì & bún',
    cuisine: 'JP',
    cuisineName: 'Nhật Bản',
    image: '/images/hero/oyakodon.jpg',
    time: 27,
    servings: 2,
    difficulty: 'Vừa',
    summary: 'Cơm gà trứng mềm mọng kiểu Nhật, hòa quyện cùng sốt dashi ngọt thanh.'
  },
  {
    id: 'starter-4',
    slug: 'trung-xao-ca-chua',
    title: 'Trứng xào cà chua',
    category: 'Gỏi & món ăn nhẹ',
    cuisine: 'VN',
    cuisineName: 'Món Việt',
    image: '/images/hero/tomatoegg.jpg',
    time: 18,
    servings: 2,
    difficulty: 'Dễ',
    summary: 'Món trứng xào cà chua xốp mềm, vị chua ngọt dễ ăn cho bữa cơm gia đình.'
  },
  {
    id: 'starter-5',
    slug: 'mi-y-toi-dau-o-liu',
    title: 'Spaghetti tỏi & dầu ô liu',
    category: 'Cơm, mì & bún',
    cuisine: 'IT',
    cuisineName: 'Âu & Mỹ',
    image: '/images/hero/pasta.jpg',
    time: 23,
    servings: 2,
    difficulty: 'Vừa',
    summary: 'Mì Ý xào tỏi ớt và dầu ô liu nguyên chất thơm nồng kiểu truyền thống.'
  },
  {
    id: 'starter-6',
    slug: 'ratatouille',
    title: 'Ratatouille · rau hầm sắc màu',
    category: 'Gỏi & món ăn nhẹ',
    cuisine: 'WE',
    cuisineName: 'Pháp',
    image: '/images/ratatouille.webp',
    time: 45,
    servings: 4,
    difficulty: 'Dễ',
    summary: 'Món rau củ đút lò truyền thống miền Nam nước Pháp thanh mát giàu dinh dưỡng.'
  },
  {
    id: 'starter-7',
    slug: 'ga-ap-chao-sot-toi',
    title: 'Gà áp chảo sốt tỏi',
    category: 'Thịt & hải sản',
    cuisine: 'VN',
    cuisineName: 'Món Á',
    image: '/images/hero/grilledchicken.jpg',
    time: 25,
    servings: 1,
    difficulty: 'Dễ',
    summary: 'Ức gà áp chảo vàng ruộm đẫm sốt bơ tỏi thơm lừng.'
  }
];

const thaiRecipes = THAI_50_RECIPES.map((t, i) => ({
  id: 'thai-' + (i + 1),
  slug: t.slug,
  title: t.title,
  category: t.category,
  cuisine: 'TH',
  cuisineName: 'Thái Lan',
  image: '/recipes/thai/' + t.slug + '.jpg',
  time: t.totalMinutes || (t.prepMinutes + t.cookMinutes) || 25,
  servings: t.baseServings || (i % 2 === 0 ? 1 : 2),
  difficulty: t.difficulty || (i % 3 === 2 ? 'Vừa' : 'Dễ'),
  summary: t.summary
}));

const all57 = [...starterRecipes, ...thaiRecipes];

const tsContent = `export interface RecipeItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  cuisine: string;
  cuisineName: string;
  image: string;
  time: number;
  servings: number;
  difficulty: string;
  summary: string;
}

export const ALL_RECIPES_57: RecipeItem[] = ${JSON.stringify(all57, null, 2)};
`;

fs.mkdirSync('frontend/src/data', { recursive: true });
fs.writeFileSync('frontend/src/data/recipes-57.ts', tsContent, 'utf8');
console.log('Saved frontend/src/data/recipes-57.ts successfully with', all57.length, 'recipes!');
