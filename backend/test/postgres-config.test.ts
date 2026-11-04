import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { postgresPool, postgresUrl } from '../src/postgres-config';
import { databaseFailure } from '../src/database-errors';

test('cloud PostgreSQL rejects malformed, missing and unencrypted URLs without exposing credentials', () => {
  for (const value of [
    undefined,
    'not a url',
    'sqlserver://example',
    'postgres://user:private-password@host/db',
    'postgres://user:private-password@host/db?sslmode=disable',
    'postgres://user:private-password@host/db?sslmode=no-verify',
  ]) {
    assert.throws(
      () => postgresUrl(value, true),
      (error: Error) => !error.message.includes('private-password'),
    );
  }
  assert.throws(() => postgresUrl('postgres://user:secret@remote/db?sslmode=disable', false));
  assert.equal(postgresPool('postgresql://test:test@127.0.0.1:15432/test?sslmode=disable', false).ssl, false);
});

test('Neon runtime enforces certificate validation even when URL SSL options would replace pg settings', () => {
  const options = postgresPool(
    'postgresql://user:private-password@fixture-pooler.neon.tech/db?sslmode=require&ssl=false&sslrootcert=ignored&uselibpqcompat=true',
    true,
  );
  assert.deepEqual(options.ssl, { rejectUnauthorized: true });
  const url = new URL(options.connectionString);
  for (const key of ['sslmode', 'ssl', 'sslrootcert', 'uselibpqcompat'])
    assert.equal(url.searchParams.has(key), false);
  assert.equal(options.max, 3);
  assert.equal(options.enableChannelBinding, true);
});

test('PostgreSQL and existing SQL Server schemas retain identical application model contracts', () => {
  const clean = (path: string) =>
    readFileSync(resolve(__dirname, path), 'utf8')
      .replace(/generator client\s*\{[^}]*\}/g, '')
      .replace(/datasource db\s*\{[^}]*\}/g, '')
      .replace(/@db\.\w+(?:\([^)]*\))?/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  assert.equal(clean('../prisma-postgres/schema.prisma'), clean('../prisma/schema.prisma'));
});

test('separately generated PostgreSQL Prisma errors retain sanitized outage/schema responses', () => {
  const { Prisma } = require('../generated/postgres');
  for (const code of ['P1001', 'P2021', 'P2022']) {
    const error = new Prisma.PrismaClientKnownRequestError('private-query-and-password', {
      code,
      clientVersion: 'test',
    });
    const failure = databaseFailure(error);
    assert.equal(failure?.code, code === 'P1001' ? 'DATABASE_UNAVAILABLE' : 'DATABASE_SCHEMA_OUTDATED');
    assert.ok(!JSON.stringify(failure).includes('private-query-and-password'));
  }
});
