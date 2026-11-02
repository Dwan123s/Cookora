import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '../frontend/public/recipes/thai');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Map each of the 50 dishes to its best Wikimedia/Wikipedia image query
const DISH_IMAGE_QUERIES = {
  'pad-krapow-gai': 'Phat_kaphrao',
  'gai-pad-med-mamuang': 'Kai_phat_met_mamuang_himmaphan',
  'gai-yang': 'Kai_yang',
  'moo-ping': 'Mu_ping',
  'kor-moo-yang': 'Grilled_pork_neck',
  'moo-satay': 'Satay',
  'gai-tod-hat-yai': 'Fried_chicken_Hat_Yai',
  'pla-neung-manao': 'Steamed_fish_lime',
  'pla-rad-prik': 'Pla_rad_prik',
  'goong-ob-woon-sen': 'Kung_op_wunsen',

  'tom-yum-goong': 'Tom_yum',
  'tom-kha-gai': 'Tom_kha_kai',
  'gaeng-keow-wan-gai': 'Green_curry',
  'gaeng-phed-gai': 'Red_curry',
  'gaeng-massaman-nuea': 'Massaman_curry',
  'panang-moo': 'Phanaeng_curry',
  'gaeng-kari-gai': 'Yellow_curry',
  'gaeng-som-goong': 'Kaeng_som',
  'gaeng-jued-tao-hoo-moo-sab': 'Tom_chut',
  'jim-jum': 'Chim_chum',

  'pad-thai-goong': 'Pad_thai',
  'pad-see-ew': 'Phat_si-io',
  'pad-kee-mao': 'Drunken_noodles',
  'khao-pad-sapparot': 'Pineapple_fried_rice',
  'khao-pad-pu': 'Thai_fried_rice',
  'khao-man-gai': 'Hainanese_chicken_rice',
  'khao-soi-gai': 'Khao_soi',
  'rad-na': 'Rat_na',
  'pad-woon-sen': 'Phat_wun_sen',
  'khanom-jeen-nam-ya': 'Khanom_chin',

  'som-tam-thai': 'Green_papaya_salad',
  'yam-woon-sen': 'Yam_wun_sen',
  'larb-gai': 'Larb',
  'nam-tok-moo': 'Nam_tok_(food)',
  'yam-nua': 'Thai_beef_salad',
  'yam-mamuang': 'Green_mango_salad',
  'tod-man-pla': 'Tod_man_pla',
  'poh-pia-tod': 'Spring_roll',
  'pak-boong-fai-daeng': 'Water_spinach',
  'khai-jiao': 'Khai_chiao',

  'khao-niao-mamuang': 'Mango_sticky_rice',
  'tub-tim-grob': 'Thapthim_krop',
  'kluay-buat-chi': 'Kluai_buat_chi',
  'bua-loy': 'Bua_loi',
  'khanom-krok': 'Khanom_khrok',
  'khanom-chan': 'Khanom_chan',
  'sangkaya-fak-thong': 'Sankhaya_faktong',
  'woon-kati': 'Coconut_jelly',
  'kluay-tod': 'Banana_fritter',
  'khao-tom-mat': 'Khao_tom_mat'
};

async function fetchWikiImage(title) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800`;
    const res = await fetch(url, { headers: { 'User-Agent': 'CookoraFoodApp/1.0' } });
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    for (const key of Object.keys(pages)) {
      if (pages[key].thumbnail?.source) {
        return pages[key].thumbnail.source;
      }
    }
  } catch (err) {
    console.warn(`Wiki query failed for ${title}:`, err.message);
  }
  return null;
}

async function run() {
  console.log('Testing image queries for first 5 dishes...');
  for (const [slug, query] of Object.entries(DISH_IMAGE_QUERIES).slice(0, 5)) {
    const imgUrl = await fetchWikiImage(query);
    console.log(`${slug} (${query}) -> ${imgUrl ? 'FOUND' : 'NOT FOUND'}`);
  }
}

run();
