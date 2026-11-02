import type { Recipe } from '@cookora/contracts';
import { recipeMedia } from './recipe-media';

const dishIllustrations: Record<string, string> = {
  'gaeng-jued-tao-hoo-moo-sab': '/recipes/thai/019_gaeng_jued_tao_hoo_moo_sab_canh_dau_hu_thit_bam.jpg',
  'poh-pia-tod': '/recipes/thai/038_poh_pia_tod_cha_gio_kieu_thai.jpg',
  'yam-woon-sen': '/recipes/thai/032_yam_woon_sen_goi_mien_tom_thit.jpg',
};

export function matcherMedia(recipe: Recipe) {
  const illustration = dishIllustrations[recipe.slug];
  return illustration
    ? {
        src: illustration,
        label: 'Ảnh AI minh họa',
        credit: 'Ảnh minh họa tạo bằng AI · Cookora · Không phải mẻ nấu thử',
      }
    : recipeMedia(recipe);
}
