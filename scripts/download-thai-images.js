import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { THAI_50_RECIPES } from './thai-50-recipes-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '../frontend/public/recipes/thai');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function fetchWikiImage(title) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1000`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Cookora/1.0 (culinary-app)' } });
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    for (const key of Object.keys(pages)) {
      if (pages[key].thumbnail?.source) {
        return pages[key].thumbnail.source;
      }
    }
  } catch (err) {
    // ignore
  }
  return null;
}

// Fallback pool of high quality food images already in the repo
const FALLBACKS = [
  path.resolve(__dirname, '../frontend/public/images/hero/hero.jpg'),
  path.resolve(__dirname, '../frontend/public/images/hero/grilledchicken.jpg'),
  path.resolve(__dirname, '../frontend/public/images/hero/tofu.jpg'),
  path.resolve(__dirname, '../frontend/public/images/hero/kimchi.jpg'),
  path.resolve(__dirname, '../frontend/public/images/hero/tomatoegg.jpg'),
  path.resolve(__dirname, '../frontend/public/images/hero/oyakodon.jpg'),
  path.resolve(__dirname, '../frontend/public/images/hero/pasta.jpg'),
  path.resolve(__dirname, '../frontend/public/images/gai-yang.webp'),
  path.resolve(__dirname, '../frontend/public/recipes/thit-nuong.webp'),
  path.resolve(__dirname, '../frontend/public/recipes/canh-rong-bien.webp')
];

async function downloadImage(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Cookora/1.0 (culinary-app)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(arrayBuffer));
}

async function main() {
  console.log(`Starting image generation / acquisition for 50 Thai dishes...`);

  let downloaded = 0;
  let copied = 0;

  for (let i = 0; i < THAI_50_RECIPES.length; i++) {
    const dish = THAI_50_RECIPES[i];
    const dest = path.join(outputDir, `${dish.slug}.jpg`);

    // If already exists and size > 2KB, keep it
    if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) {
      console.log(`[${i + 1}/50] ${dish.slug}: ALREADY EXISTS`);
      continue;
    }

    let success = false;
    if (dish.imageQuery) {
      try {
        const imgUrl = await fetchWikiImage(dish.imageQuery);
        if (imgUrl) {
          await downloadImage(imgUrl, dest);
          console.log(`[${i + 1}/50] ${dish.slug}: DOWNLOADED from Wiki`);
          downloaded++;
          success = true;
        }
      } catch (err) {
        // failover
      }
    }

    if (!success) {
      // Use thematic culinary fallback
      const fb = FALLBACKS[i % FALLBACKS.length];
      if (fs.existsSync(fb)) {
        fs.copyFileSync(fb, dest);
        console.log(`[${i + 1}/50] ${dish.slug}: FALLBACK COPIED from ${path.basename(fb)}`);
        copied++;
      }
    }
  }

  console.log(`Done! Downloaded: ${downloaded}, Copied fallbacks: ${copied}. Total files in directory: ${fs.readdirSync(outputDir).length}`);
}

main().catch(console.error);
