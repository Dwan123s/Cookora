import type { Recipe } from '@cookora/contracts';

// Original illustrative assets for the seven unchanged development fixtures only.
// Approved or edited recipes always retain their server-provided image and credit.
const demoImages: Record<string, string> = {
  'dau-hu-sot-ca-chua': 'cookora-tofu-1200',
  'com-kimchi': 'kimchi',
  'oyakodon-com-ga-trung': 'oyakodon',
  'trung-xao-ca-chua': 'eggs-tomato',
  'ga-gai-yang-ap-chao': 'gai-yang',
  'spaghetti-aglio-e-olio': 'aglio-olio',
  'ratatouille-rau-ham': 'ratatouille',
};
export function recipeMedia(recipe: Recipe) {
  const demo =
    recipe.contentStatus === 'DRAFT' &&
    recipe.revision === 1 &&
    recipe.imageCredit === 'Unsplash · ảnh minh họa, không phải mẻ nấu thử'
      ? demoImages[recipe.slug]
      : undefined;
  return demo
    ? {
        src: `/images/${demo}.webp`,
        credit: 'Ảnh minh họa tạo bằng AI · Cookora · Không phải mẻ nấu thử',
        label: 'Ảnh AI minh họa',
      }
    : { src: recipe.image, credit: recipe.imageCredit, label: 'Ảnh minh họa' };
}
