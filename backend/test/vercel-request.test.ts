import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Request } from 'express';
import { normalizeVercelRequest } from '../src/vercel-request';

test('Vercel rewrite metadata is removed while route and user query remain intact', () => {
  const req = {
    url: '/api/v1/recipes?__cookora_route=v1%2Frecipes&q=ph%E1%BB%9F&page=2',
    query: { __cookora_route: 'v1/recipes', q: 'phở', page: '2' },
  } as unknown as Request;
  normalizeVercelRequest(req);
  assert.equal(new URL(req.url, 'http://test').pathname, '/api/v1/recipes');
  assert.equal(new URL(req.url, 'http://test').searchParams.get('q'), 'phở');
  assert.deepEqual(req.query, { q: 'phở', page: '2' });
  assert.ok(!req.url.includes('__cookora_route'));
});

test('Vercel query normalization preserves callbacks and query-free API requests', () => {
  const callback = {
    url: '/api/v1/auth/google/callback?state=fixture-state&code=fixture-code&__cookora_route=v1%2Fauth%2Fgoogle%2Fcallback',
    query: { state: 'fixture-state', code: 'fixture-code', __cookora_route: 'v1/auth/google/callback' },
  } as unknown as Request;
  normalizeVercelRequest(callback);
  assert.equal(callback.query.state, 'fixture-state');
  assert.equal(callback.query.code, 'fixture-code');
  const ready = { url: '/api/v1/health/ready', query: {} } as unknown as Request;
  normalizeVercelRequest(ready);
  assert.equal(ready.url, '/api/v1/health/ready');
});
