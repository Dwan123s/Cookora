const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'frontend', 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.tsx'));

const replacements = [
  // Red/Orange buttons & highlights -> Sage Green
  { from: /#C85233/g, to: '#47735B' },
  { from: /#c85233/g, to: '#47735B' },
  { from: /#b6472b/g, to: '#47735B' },
  { from: /#b04529/g, to: '#3B634F' },
  { from: /#D17A50/g, to: '#47735B' },
  { from: /#c26d44/g, to: '#3B634F' },

  // Dark black-green -> Sage Green & Deep Organic
  { from: /#233527/g, to: '#47735B' },
  { from: /#2e4634/g, to: '#3B634F' },
  { from: /#2b4430/g, to: '#3B634F' },
  { from: /#2b4b36/g, to: '#47735B' },

  // Light green / soft green -> #E8F1E9
  { from: /#f0f4f0/g, to: '#E8F1E9' },
  { from: /#f2f6f3/g, to: '#E8F1E9' },
  { from: /#e2ece4/g, to: '#DFE5DD' },

  // Background
  { from: /#FAF8F5/g, to: '#FAF9F6' },
];

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const r of replacements) {
    if (r.from.test(content)) {
      content = content.replace(r.from, r.to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated colors in: ${file}`);
  }
}

// Also check frontend/src/shared.tsx
const sharedPath = path.join(__dirname, '..', 'frontend', 'src', 'shared.tsx');
if (fs.existsSync(sharedPath)) {
  let content = fs.readFileSync(sharedPath, 'utf8');
  let changed = false;
  for (const r of replacements) {
    if (r.from.test(content)) {
      content = content.replace(r.from, r.to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(sharedPath, content);
    console.log('Updated colors in: shared.tsx');
  }
}

console.log('Sage Green palette unified across all pages!');
