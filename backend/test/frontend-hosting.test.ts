import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mountFrontend } from '../src/frontend-hosting';

@Controller('health')
class Health {
  @Get('live') live() {
    return { status: 'ok' };
  }
}
@Module({ controllers: [Health] })
class Fixture {}

test('single-origin hosting serves SPA routes without swallowing API or missing assets', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'cookora-hosting-'));
  writeFileSync(join(dir, 'index.html'), '<!doctype html><title>Cookora fixture</title>');
  mkdirSync(join(dir, 'assets'));
  writeFileSync(join(dir, 'assets', 'app-test.js'), 'export const fixture = true;');
  writeFileSync(join(dir, '.env'), 'PRIVATE_FILE');
  const app = await NestFactory.create<NestExpressApplication>(Fixture, { logger: false });
  try {
    app.setGlobalPrefix('api/v1');
    mountFrontend(app, dir);
    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();
    for (const path of ['/', '/co-gi-nau-nay', '/dang-nhap', '/cong-thuc/pho-bo']) {
      const res = await fetch(base + path);
      assert.equal(res.status, 200);
      assert.match(res.headers.get('content-type') || '', /text\/html/);
      assert.equal(res.headers.get('cache-control'), 'no-cache');
    }
    assert.deepEqual(await (await fetch(base + '/api/v1/health/live')).json(), { status: 'ok' });
    for (const path of ['/api', '/api/v1/unknown', '/assets/missing.js', '/recipes/missing.webp', '/.env']) {
      const res = await fetch(base + path);
      assert.equal(res.status, 404);
      assert.doesNotMatch(await res.text(), /Cookora fixture|PRIVATE_FILE/);
    }
    const asset = await fetch(base + '/assets/app-test.js');
    assert.equal(asset.status, 200);
    assert.match(asset.headers.get('cache-control') || '', /immutable/);
    assert.equal((await fetch(base + '/dang-nhap', { method: 'POST' })).status, 404);
  } finally {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
