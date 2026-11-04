import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { config } from 'dotenv';
import sql from 'mssql';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
config({ path: path.join(root, '.env'), quiet: true });
assert.equal(process.env.DATABASE_PROVIDER || 'sqlserver', 'sqlserver', 'This repair targets local SQL Server.');
assert.match(process.env.DB_HOST || 'localhost', /^(localhost|127\.0\.0\.1|\.|::1)(\\[^\\]+)?$/i);
const { repairs } = JSON.parse(await fs.readFile(path.join(root, 'database/patches/recipe-image-repairs.json'), 'utf8'));
assert.equal(new Set(repairs.map((row) => row.slug)).size, repairs.length);
for (const row of repairs) {
  assert.ok(row.image.startsWith('/recipes/'));
  const imagePath = path.resolve(root, 'frontend/public', `.${row.image}`);
  assert.ok(imagePath.startsWith(path.join(root, 'frontend/public/recipes') + path.sep));
  const bytes = await fs.readFile(imagePath);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), row.sha256, row.slug);
  await sharp(bytes).resize(1, 1).toBuffer();
  assert.ok(row.imageCredit.length <= 200);
}
const pool = await sql.connect({
  server: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_NAME || 'Cookora', user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  options: { encrypt: process.env.DB_ENCRYPT !== 'false', trustServerCertificate: process.env.DB_TRUST_CERT === 'true' },
  requestTimeout: 60000,
});
const snapshot = async (connection) => (await connection.request().query(
  'SELECT * FROM dbo.Recipe; SELECT * FROM dbo.RecipeLine; SELECT * FROM dbo.RecipeStep;',
)).recordsets;
const fingerprint = (rows, stripMedia = false) => createHash('sha256').update(JSON.stringify(rows.map((row) => {
  const copy = { ...row };
  if (stripMedia) { delete copy.image; delete copy.imageCredit; }
  return copy;
}).sort((a, b) => a.id.localeCompare(b.id)))).digest('hex');
const tx = new sql.Transaction(pool);
let started = false;
try {
  await tx.begin(); started = true;
  const before = await snapshot(tx);
  const bySlug = new Map(before[0].map((row) => [row.slug, row]));
  const pending = repairs.filter((patch) => {
    const current = bySlug.get(patch.slug);
    assert.ok(current, `Recipe missing: ${patch.slug}`);
    if (current.image === patch.image && current.imageCredit === patch.imageCredit) return false;
    assert.equal(current.image, patch.beforeImage, `Image changed since audit: ${patch.slug}`);
    assert.equal(current.imageCredit, patch.beforeImageCredit, `Credit changed since audit: ${patch.slug}`);
    return true;
  });
  if (!process.argv.includes('--apply')) {
    console.log(JSON.stringify({ mode: 'preview', recipes: before[0].length, pending: pending.length, alreadyApplied: repairs.length - pending.length }));
    await tx.rollback(); started = false;
  } else {
    const stamp = new Date().toISOString().replaceAll(/[:.]/g, '-');
    await fs.mkdir(path.join(root, '.review'), { recursive: true });
    const backup = path.join(root, '.review', `recipe-images-before-${stamp}.json`);
    await fs.writeFile(backup, JSON.stringify(before[0].map(({ id, slug, image, imageCredit }) => ({ id, slug, image, imageCredit })), null, 2));
    for (const patch of pending) {
      const result = await new sql.Request(tx)
        .input('slug', sql.VarChar(180), patch.slug)
        .input('image', sql.NVarChar(1000), patch.image)
        .input('credit', sql.NVarChar(200), patch.imageCredit)
        .input('beforeImage', sql.NVarChar(1000), patch.beforeImage)
        .input('beforeCredit', sql.NVarChar(200), patch.beforeImageCredit)
        .query('UPDATE dbo.Recipe SET image=@image, imageCredit=@credit WHERE slug=@slug AND image=@beforeImage AND imageCredit=@beforeCredit');
      assert.equal(result.rowsAffected[0], 1, patch.slug);
    }
    const after = await snapshot(tx);
    assert.equal(before[0].length, after[0].length);
    assert.equal(fingerprint(before[0], true), fingerprint(after[0], true), 'Non-image recipe fields changed');
    for (const index of [1, 2]) assert.equal(fingerprint(before[index]), fingerprint(after[index]), 'Recipe ingredients/steps changed');
    for (const patch of repairs) {
      const row = after[0].find((row) => row.slug === patch.slug);
      assert.equal(row.image, patch.image); assert.equal(row.imageCredit, patch.imageCredit);
    }
    await tx.commit(); started = false;
    const report = { checkedAt: new Date().toISOString(), updated: pending.length, recipes: after[0].length,
      remainingEmptyImages: after[0].filter((row) => !row.image.trim()).length,
      nonImageFieldsPreserved: true, ingredientRowsPreserved: after[1].length,
      stepRowsPreserved: after[2].length, backup: path.relative(root, backup) };
    await fs.writeFile(path.join(root, '.review/recipe-image-repair-applied.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  }
} catch (error) {
  if (started) await tx.rollback();
  throw error;
} finally { await pool.close(); }
