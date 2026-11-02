const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const [group, filename, source, promptFile] = process.argv.slice(2);
  const root = path.resolve(__dirname, '..');
  const manifestPath = path.join(root, 'docs/recipe-images/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const entry = manifest.find((item) => item.group === group && item.filename === filename);
  if (!entry || path.basename(filename) !== filename) throw new Error('Unknown recipe image');
  const destination = path.join(root, 'frontend/public/recipes', group, filename);
  if (fs.existsSync(destination)) throw new Error('Refusing to overwrite an existing image');
  await sharp(source).resize(1200, 900, { fit: 'cover' }).jpeg({ quality: 90 }).toFile(destination);
  Object.assign(entry, {
    status: 'generated',
    image: `/recipes/${group}/${filename}`,
    generator: 'built-in image_gen',
    prompt: promptFile ? fs.readFileSync(promptFile, 'utf8') : entry.prompt,
  });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  const csvCell = (value) => '"' + String(value ?? '').replaceAll('"', '""') + '"';
  fs.writeFileSync(path.join(root, 'docs/recipe-images/progress.csv'), '\uFEFF' + [
    ['Nhóm', 'Menu nguồn', 'STT nguồn', 'Tên món', 'Tên ảnh', 'Trạng thái', 'Đường dẫn'],
    ...manifest.map((item) => [item.group, item.sourceMenu, item.number, item.title, item.filename, item.status === 'generated' ? 'Đã tạo' : 'Chưa tạo', item.image]),
  ].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n');
  console.log(JSON.stringify({ saved: entry.image, completed: manifest.filter((item) => item.status === 'generated').length, total: manifest.length }));
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
