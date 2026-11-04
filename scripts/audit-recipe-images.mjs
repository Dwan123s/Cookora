import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = process.argv[2] || 'http://127.0.0.1:5173';
assert.match(new URL(origin).hostname, /^(127\.0\.0\.1|localhost)$/);
const request = async (route) => {
  const response = await fetch(`${origin}/api/v1${route}`, { signal: AbortSignal.timeout(70000) });
  assert.equal(response.status, 200, route);
  return response.json();
};
const first = await request('/recipes?pageSize=50&page=1');
const records = [...first.data];
for (let page = 2; page <= first.meta.pagination.totalPages; page++) {
  records.push(...(await request(`/recipes?pageSize=50&page=${page}`)).data);
}
assert.equal(records.length, first.meta.pagination.total);
assert.equal(new Set(records.map((row) => row.id)).size, records.length);
const cache = new Map();
async function checkImage(image) {
  if (!image?.trim()) return { ok: false, problem: 'EMPTY_IMAGE' };
  try {
    const url = new URL(image, origin);
    assert.ok(['http:', 'https:'].includes(url.protocol));
    const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
    if (!response.ok) return { ok: false, problem: `HTTP_${response.status}` };
    const type = response.headers.get('content-type') || '';
    if (!type.startsWith('image/')) return { ok: false, problem: `NOT_IMAGE: ${type}` };
    const bytes = Buffer.from(await response.arrayBuffer());
    const meta = await sharp(bytes).metadata();
    await sharp(bytes).resize(1, 1).toBuffer();
    return { ok: true, width: meta.width, height: meta.height, bytes: bytes.length };
  } catch (error) { return { ok: false, problem: error.message }; }
}
const results = [];
for (let offset = 0; offset < records.length; offset += 6) {
  await Promise.all(records.slice(offset, offset + 6).map(async ({ id, slug, title, image }) => {
    if (!cache.has(image)) cache.set(image, checkImage(image));
    results.push({ id, slug, title, image, ...await cache.get(image) });
  }));
}
results.sort((a, b) => a.slug.localeCompare(b.slug));
const report = { checkedAt: new Date().toISOString(), origin, recipes: records.length,
  uniqueImages: cache.size, passed: results.filter((r) => r.ok).length,
  failed: results.filter((r) => !r.ok), results };
await fs.mkdir(path.join(root, 'docs/recipe-images'), { recursive: true });
await fs.writeFile(path.join(root, 'docs/recipe-images/live-image-audit.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ recipes: report.recipes, uniqueImages: report.uniqueImages, passed: report.passed, failed: report.failed }, null, 2));
if (report.failed.length) process.exitCode = 1;
