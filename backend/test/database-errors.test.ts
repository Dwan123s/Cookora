import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Prisma } from '@prisma/client';
import { ServiceUnavailableException, type ArgumentsHost } from '@nestjs/common';
import { ApiErrors } from '../src/http';
import { AiChefService } from '../src/ai';
import type { Catalog } from '../src/catalog';

const privateMessage = 'private SQL text password=do-not-expose';
const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError(privateMessage, { code, clientVersion: 'test' });

function respond(error: unknown) {
  let status: number | undefined;
  let body: any;
  const response = {
    status(value: number) {
      status = value;
      return this;
    },
    json(value: unknown) {
      body = value;
    },
  };
  new ApiErrors().catch(error, {
    switchToHttp: () => ({
      getRequest: () => ({ headers: { 'x-request-id': 'database-error-test' } }),
      getResponse: () => response,
    }),
  } as ArgumentsHost);
  return { status, body };
}

test('SQL connectivity and schema errors return actionable, sanitized 503 responses', (ctx) => {
  const logs: string[] = [];
  ctx.mock.method(console, 'error', (line: string) => logs.push(line));
  for (const code of ['ESOCKET', 'ELOGIN', 'ETIMEOUT', 'P1001', 'P2024', 'P2021', 'P2022']) {
    const { status, body } = respond(prismaError(code));
    assert.equal(status, 503);
    assert.equal(
      body.error.code,
      ['P2021', 'P2022'].includes(code) ? 'DATABASE_SCHEMA_OUTDATED' : 'DATABASE_UNAVAILABLE',
    );
    assert.equal(body.meta.requestId, 'database-error-test');
    assert.equal(JSON.parse(logs.at(-1)!).databaseCode, code);
    assert.ok(!JSON.stringify(body).includes(privateMessage));
  }
  const initialization = respond(new Prisma.PrismaClientInitializationError(privateMessage, 'test', 'P1001'));
  assert.equal(initialization.status, 503);
  const readiness = respond(
    new ServiceUnavailableException(
      {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database chưa sẵn sàng.',
      },
      { cause: prismaError('ESOCKET') },
    ),
  );
  assert.equal(readiness.status, 503);
  assert.equal(JSON.parse(logs.at(-1)!).databaseCode, 'ESOCKET');
  assert.ok(!JSON.stringify(logs).includes(privateMessage));
});

test('unrelated database and application errors retain their status without leaking details', (ctx) => {
  const logs: string[] = [];
  ctx.mock.method(console, 'error', (line: string) => logs.push(line));
  for (const error of [prismaError('P2002'), new Error(privateMessage)]) {
    const result = respond(error);
    assert.equal(result.status, 500);
    assert.equal(result.body.error.code, 'INTERNAL_ERROR');
    assert.ok(!JSON.stringify(result).includes(privateMessage));
  }
  const result = respond(
    new ServiceUnavailableException({ code: 'AI_SERVICE_ERROR', message: 'AI unavailable' }),
  );
  assert.equal(result.body.error.code, 'AI_SERVICE_ERROR');
  assert.ok(!JSON.stringify(logs).includes(privateMessage));
});

test('AI catalog failures reach the database handler without calling the model', async (ctx) => {
  const savedKey = process.env.VERTEX_API_KEY;
  process.env.VERTEX_API_KEY = 'test-only-key';
  ctx.after(() => {
    if (savedKey === undefined) delete process.env.VERTEX_API_KEY;
    else process.env.VERTEX_API_KEY = savedKey;
  });
  let calls = 0;
  ctx.mock.method(globalThis, 'fetch', async () => {
    calls++;
    throw new Error('Unexpected model call');
  });
  const logs: string[] = [];
  ctx.mock.method(console, 'error', (line: string) => logs.push(line));
  for (const method of ['all', 'ingredients'] as const) {
    const failure = prismaError('ESOCKET');
    const catalog = {
      all: async () => [],
      ingredients: async () => [],
      [method]: async () => {
        throw failure;
      },
    } as unknown as Catalog;
    await assert.rejects(new AiChefService(catalog).suggestRecipes('trứng'), (error) => {
      assert.equal(error, failure);
      assert.equal(respond(error).body.error.code, 'DATABASE_UNAVAILABLE');
      return true;
    });
  }
  assert.equal(calls, 0);
  assert.ok(logs.every((line) => !line.includes('AI_SERVICE_ERROR')));
});
