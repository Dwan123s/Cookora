const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'frontend', 'public');
const imagesDir = path.join(publicDir, 'images');
const recipesDir = path.join(publicDir, 'recipes');

if (!fs.existsSync(recipesDir)) {
  fs.mkdirSync(recipesDir, { recursive: true });
}

const map = {
  'dau-hu-sot-ca-chua.webp': 'cookora-tofu-1200.webp',
  'trung-xao-ca-chua.webp': 'eggs-tomato.webp',
  'com-kimchi.webp': 'kimchi.webp',
  'com-ga-trung.webp': 'oyakodon.webp',
  'ga-ap-chao-sot-toi.webp': 'gai-yang.webp',
  'thit-nuong.webp': 'gai-yang.webp',
  'mi-y-toi-dau-o-liu.webp': 'aglio-olio.webp',
  'canh-rong-bien.webp': 'ratatouille.webp',
};

for (const [dest, src] of Object.entries(map)) {
  const srcFile = path.join(imagesDir, src);
  const destFile = path.join(recipesDir, dest);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    console.log(`Copied ${src} -> recipes/${dest}`);
  } else {
    console.warn(`Source missing: ${srcFile}`);
  }
}
console.log('Recipe images setup complete!');

const distDir = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distDir)) {
  const distRecipes = path.join(distDir, 'recipes');
  if (!fs.existsSync(distRecipes)) fs.mkdirSync(distRecipes, { recursive: true });
  fs.cpSync(recipesDir, distRecipes, { recursive: true });
  console.log('Copied recipes to dist/recipes successfully!');
}
