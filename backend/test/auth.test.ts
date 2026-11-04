import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import argon2 from 'argon2';
import type { Request, Response, NextFunction } from 'express';

test('production password registration and authenticated HTTP session flow', async (t) => {
  const saved = { ...process.env };
  Object.assign(process.env, {
    NODE_ENV: 'production',
    APP_ORIGIN: 'https://cookora.example',
    CSRF_SECRET: 'password-registration-tests-only-32-byte-secret',
  });
  t.after(() => {
    process.env = saved;
  });
  // Load after setting NODE_ENV so this catches production-only registration blocks.
  const { AuthController } = await import('../src/auth');
  const { Database } = await import('../src/db');
  const { Sessions, AuthGuard, checkCsrf, hash, sessionCookie } = await import('../src/security');
  const { production, appOrigin } = await import('../src/config');
  const { ApiErrors } = await import('../src/http');
  assert.equal(production, true);

  type User = {
    id: string;
    email: string;
    displayName: string;
    passwordHash: string;
    role: string;
  };
  const users: User[] = [];
  const sessions = new Map<string, { userId: string; tokenHash: string; expiresAt: Date }>();
  const db = {
    user: {
      create: async ({ data }: { data: Omit<User, 'id' | 'role'> }) => {
        if (users.some((user) => user.email === data.email)) throw { code: 'P2002' };
        const user = { ...data, id: randomUUID(), role: 'USER' };
        users.push(user);
        return user;
      },
      findFirst: async ({ where }: { where: { OR: { email: string }[] } }) =>
        users.find((user) => where.OR.some(({ email }) => user.email === email)) || null,
    },
    session: {
      create: async ({ data }: { data: { userId: string; tokenHash: string; expiresAt: Date } }) => {
        sessions.set(data.tokenHash, data);
        return data;
      },
      findUnique: async ({ where }: { where: { tokenHash: string } }) => {
        const session = sessions.get(where.tokenHash);
        return session ? { ...session, user: users.find((user) => user.id === session.userId)! } : null;
      },
      deleteMany: async ({ where }: { where: { tokenHash: string } }) => {
        sessions.delete(where.tokenHash);
      },
    },
  };
  class PasswordAuthTestModule {}
  Module({
    controllers: [AuthController],
    providers: [{ provide: Database, useValue: db }, Sessions, AuthGuard],
  })(PasswordAuthTestModule);
  const app = await NestFactory.create(PasswordAuthTestModule, { logger: false });
  t.after(() => app.close());
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'POST') {
      try {
        checkCsrf(req);
      } catch {
        res.status(403).end();
        return;
      }
    }
    next();
  });
  app.useGlobalFilters(new ApiErrors());
  await app.listen(0, '127.0.0.1');
  const base = `${await app.getUrl()}/api/v1/auth`;
  const jar = new Map<string, string>();
  let csrf = '';
  async function call(path: string, body?: unknown, withCsrf = true) {
    const res = await fetch(`${base}/${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        Origin: appOrigin,
        Cookie: [...jar].map(([name, value]) => `${name}=${value}`).join('; '),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(withCsrf ? { 'X-CSRF-Token': csrf } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    for (const cookie of res.headers.getSetCookie()) {
      const [name, value] = cookie.split(';')[0].split('=');
      jar.set(name, value);
    }
    const json = await res.json().catch(() => null);
    if (json?.data?.csrfToken) csrf = json.data.csrfToken;
    return { res, json };
  }
  const input = {
    email: ' New.Cook@Example.com ',
    displayName: '  Đầu bếp mới  ',
    password: 'Cookora-test-123!',
  };
  await call('csrf');
  await t.test('registration still requires CSRF protection', async () => {
    assert.equal((await call('register', input, false)).res.status, 403);
    assert.equal(users.length, 0);
  });
  await t.test(
    'valid registration normalizes inputs, hashes the password and signs in immediately',
    async () => {
      const { res, json } = await call('register', input);
      assert.equal(res.status, 201);
      assert.deepEqual(json.data.user, {
        id: users[0].id,
        email: 'new.cook@example.com',
        displayName: 'Đầu bếp mới',
        role: 'USER',
      });
      assert.match(users[0].passwordHash, /^\$argon2id\$/);
      assert.equal(await argon2.verify(users[0].passwordHash, input.password), true);
      assert.equal(JSON.stringify(json).includes('password'), false);
      assert.ok(json.data.csrfToken);
      const cookie = res.headers.getSetCookie().find((value) => value.startsWith(`${sessionCookie}=`))!;
      for (const flag of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/']) assert.ok(cookie.includes(flag));
      assert.ok(sessions.has(hash(jar.get(sessionCookie)!)));
      assert.deepEqual((await call('me')).json.data, json.data.user);
    },
  );
  await t.test('duplicate emails return a conflict without replacing the account or session', async () => {
    const { res, json } = await call('register', { ...input, email: 'NEW.COOK@example.com' });
    assert.equal(res.status, 409);
    assert.equal(json.error.code, 'EMAIL_UNAVAILABLE');
    assert.equal(users.length, 1);
    assert.equal(sessions.size, 1);
  });
  await t.test('invalid registration fields and privilege overrides are rejected', async () => {
    for (const invalid of [
      { email: 'not-an-email' },
      { password: 'short' },
      { displayName: ' ' },
      { role: 'ADMIN' },
    ]) {
      const { res, json } = await call('register', { ...input, ...invalid });
      assert.equal(res.status, 400);
      assert.equal(json.error.code, 'VALIDATION_FAILED');
    }
    assert.equal(users.length, 1);
  });
  await t.test('the new account can log out and sign in with its password', async () => {
    assert.equal((await call('logout', {})).res.status, 201);
    assert.equal((await call('me')).res.status, 401);
    assert.equal(
      (await call('login', { email: 'new.cook@example.com', password: 'wrong-password' })).res.status,
      401,
    );
    assert.equal(
      (await call('login', { email: 'new.cook@example.com', password: input.password })).res.status,
      201,
    );
    assert.equal((await call('me')).json.data.id, users[0].id);
  });
});
