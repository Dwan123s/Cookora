import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Response } from 'express';
import { Database } from '../src/db';
import { GoogleAuth } from '../src/google-auth';
import { Sessions, sessionCookie, type AuthRequest } from '../src/security';
import { production } from '../src/config';

test('Google identity and session use SQL; test changes roll back', async () => {
  assert.equal(production, false, 'This test is only for a local development database');
  const db = new Database();
  const rollback = new Error('ROLL_BACK_TEST_ONLY');
  const suffix = randomUUID();
  try {
    await assert.rejects(
      () =>
        db.$transaction(
          async (tx) => {
            // Run service operations in this outer transaction so all test rows roll back.
            const google = new GoogleAuth({
              $transaction: (fn: (client: typeof tx) => unknown) => fn(tx),
              googleIdentity: tx.googleIdentity,
            } as unknown as Database);
            const profile = {
              subject: `test-${suffix}`,
              email: `google-${suffix}@example.invalid`,
              displayName: 'OAuth test',
              authoritative: false,
            };
            const created = await google.resolveUser(profile);
            assert.equal(created.passwordHash, null);
            assert.equal(created.role, 'USER');
            assert.equal((await google.resolveUser(profile)).id, created.id);
            const cookies = new Map<string, string>();
            const res = {
              cookie: (name: string, value: string) => cookies.set(name, value),
            } as unknown as Response;
            const sessions = new Sessions(tx as Database);
            await sessions.create(created.id, res);
            const req = { cookies: { [sessionCookie]: cookies.get(sessionCookie) } } as AuthRequest;
            const current = await sessions.identify(req);
            assert.equal(current.id, created.id);
            assert.equal('passwordHash' in current, false);
            assert.ok(req.sessionHash);
            assert.notEqual(req.sessionHash, cookies.get(sessionCookie));
            const existing = await tx.user.create({
              data: {
                email: `existing-${suffix}@gmail.com`,
                displayName: 'Existing user',
                passwordHash: 'preserved-password-hash',
              },
            });
            const linked = await google.resolveUser({
              ...profile,
              subject: `linked-${suffix}`,
              email: existing.email,
              authoritative: true,
            });
            assert.equal(linked.id, existing.id);
            assert.equal(linked.passwordHash, existing.passwordHash);
            const external = await tx.user.create({
              data: {
                email: `external-${suffix}@example.invalid`,
                displayName: 'External user',
                passwordHash: 'keep-password',
              },
            });
            await assert.rejects(
              () => google.resolveUser({ ...profile, subject: `external-${suffix}`, email: external.email }),
              /email_conflict/,
            );
            throw rollback;
          },
          { timeout: 20000 },
        ),
      (error) => error === rollback,
    );
    assert.equal(await db.googleIdentity.count({ where: { subject: { contains: suffix } } }), 0);
    assert.equal(await db.user.count({ where: { email: { contains: suffix } } }), 0);
  } finally {
    await db.$disconnect();
  }
});
