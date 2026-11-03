import fs from 'node:fs';
import { createHash } from 'node:crypto';

const sourceFile = process.argv[2] || 'C:/Users/reiko/Downloads/Menu món.docx';
const lines = fs.readFileSync('.review/menu-mon-extracted.txt', 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const images = JSON.parse(fs.readFileSync('frontend/src/eatfit-meals.json', 'utf8'));
const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const entries = [];
let section = '', current;
for (const line of lines) {
  if (/^(I|II|III)\./.test(line)) { section = line; continue; }
  const heading = line.match(/^(\d+)\.\s+(.+)$/);
  if (heading || (!current && line === 'Salad ức gà và bơ')) {
    if (current) entries.push(current);
    current = { number: heading ? Number(heading[1]) : 1, title: heading ? heading[2] : line, section, paragraphs: [] };
  } else if (current) current.paragraphs.push(line);
}
if (current) entries.push(current);
if (entries.length !== 50 || entries.some((entry, index) => entry.number !== index + 1)) throw new Error('Expected all 50 document recipes in order');

function splitIngredients(text) {
  let depth = 0, start = 0; const result = [];
  for (let index = 0; index < text.length; index++) {
    if (text[index] === '(') depth++;
    if (text[index] === ')') depth--;
    if (text[index] === ',' && depth === 0) { result.push(text.slice(start, index).trim()); start = index + 1; }
  }
  result.push(text.slice(start).trim().replace(/\.$/, ''));
  return result.filter(Boolean);
}
function ingredient(raw, index) {
  const match = raw.match(/^(\d+(?:[.,]\d+)?(?:\/\d+)?|½|¼|¾)\s*(kg|ml|g|lít|l|quả|lát|tép|lá|cây|miếng|thìa cà phê|muỗng cà phê|thìa canh|muỗng canh|bát con)\s+(.+)$/i);
  if (!match) return { name: raw, quantity: null, unit: '', note: `Nguồn chưa ghi rõ định lượng: ${raw}`, role: 'SUPPORTING' };
  const rawQuantity = match[1];
  let amount = ({ '½': 0.5, '¼': 0.25, '¾': 0.75 })[rawQuantity];
  if (amount === undefined) amount = rawQuantity.includes('/') ? rawQuantity.split('/').map(Number).reduce((a, b) => a / b) : Number(rawQuantity.replace(',', '.'));
  let unit = match[2].toLowerCase(), quantity = amount;
  if (unit === 'kg') { quantity *= 1000; unit = 'g'; }
  else if (unit === 'l' || unit === 'lít') { quantity *= 1000; unit = 'ml'; }
  else if (/^(thìa|muỗng) canh$/.test(unit)) { quantity *= 15; unit = 'ml'; }
  else if (/^(thìa|muỗng) cà phê$/.test(unit)) { quantity *= 5; unit = 'ml'; }
  else if (unit !== 'g' && unit !== 'ml') unit = 'piece';
  return { name: match[3], quantity: String(quantity), unit, note: raw, role: index === 0 ? 'MAIN' : 'SUPPORTING' };
}
const recipes = entries.map((entry) => {
  const ingredientIndex = entry.paragraphs.findIndex((line) => /^Nguyên liệu:/i.test(line));
  const methodIndex = entry.paragraphs.findIndex((line) => /^(Cách làm|Công thức):/i.test(line));
  if (ingredientIndex < 0 || methodIndex < 0) throw new Error(`Missing recipe content ${entry.number}`);
  const rawIngredients = entry.paragraphs[ingredientIndex].replace(/^Nguyên liệu:\s*/i, '');
  const timeText = entry.paragraphs.slice(0, ingredientIndex).join(' ').trim();
  const durations = [...timeText.matchAll(/(\d+)\s*(?:[-–]\s*(\d+)\s*)?phút/g)];
  const totalMinutes = durations.length ? durations.reduce((total, value) => total + Number(value[2] || value[1]), 0) : null;
  const sourceAsset = images.find((image) => normalize(image.title) === normalize(entry.title));
  const instructions = entry.paragraphs.slice(methodIndex + 1).map((line) => line.replace(/^[-•]\s*/, '').trim()).filter(Boolean);
  const cuisine = /kimchi|Hàn Quốc/i.test(entry.title) ? 'KR' : /ramen|udon/i.test(entry.title) ? 'JP' : /Mì Ý/i.test(entry.title) ? 'IT' : /^Salad/i.test(entry.title) ? 'WE' : 'VN';
  return {
    sourceNumber: entry.number, slug: `menu-${normalize(entry.title)}`, title: entry.title,
    summary: `Theo ${entry.section.replace(/^(I|II|III)\.\s*/, '')} trong Menu món.docx.`, cuisine,
    category: /^Salad/i.test(entry.title) ? 'Gỏi & món ăn nhẹ' : entry.number >= 22 ? 'Cơm, mì & bún' : 'Thịt & hải sản',
    baseServings: 1, totalMinutes,
    preconditions: `Nguồn chưa ghi số khẩu phần; tạm tính 1 phần cho định lượng trong tài liệu. ${timeText ? `Thời gian gốc: ${timeText}.` : 'Nguồn chưa ghi thời gian.'} Chưa nấu thử.`,
    image: sourceAsset?.image || '', rawIngredients, timeText, section: entry.section,
    ingredients: splitIngredients(rawIngredients).map(ingredient),
    steps: instructions.map((instruction, index) => ({ order: index + 1, title: `Bước ${index + 1}`, instruction })),
  };
});
const output = { sourceName: 'Menu món.docx', sourceSha256: createHash('sha256').update(fs.readFileSync(sourceFile)).digest('hex'), recipes };
fs.writeFileSync('database/seeds/user-menu-recipes.json', JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({ recipes: recipes.length, images: recipes.filter((recipe) => recipe.image).length,
  unknownTimes: recipes.filter((recipe) => recipe.totalMinutes === null).map((recipe) => recipe.title),
  noSteps: recipes.filter((recipe) => !recipe.steps.length).map((recipe) => recipe.title),
  unknownQuantities: recipes.flatMap((recipe) => recipe.ingredients).filter((line) => line.quantity === null).length,
}));
