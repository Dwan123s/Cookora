import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import argon2 from 'argon2';
import type { Request, Response, NextFunction } from 'express';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';
import {
  GoogleAuth,
  GoogleAuthController,
  googleFlowCookie,
  readGoogleFlow,
  safeReturnTo,
  sealGoogleFlow,
  googleProfile,
} from '../src/google-auth';
import { AuthController } from '../src/auth';
import { Database } from '../src/db';
import { Sessions, checkCsrf, cookieOptions, sessionCookie, type AuthRequest } from '../src/security';
import { appOrigin } from '../src/config';
import { ApiErrors } from '../src/http';

test('Google login: protocol validation, account ownership and HTTP session flow', async (t) => {
  const saved = { ...process.env };
  Object.assign(process.env, {
    GOOGLE_CLIENT_ID: 'test-client.apps.googleusercontent.com',
    GOOGLE_CLIENT_SECRET: 'test-secret-not-a-real-credential',
    GOOGLE_REDIRECT_URI: `${appOrigin}/api/v1/auth/google/callback`,
    CSRF_SECRET: 'google-login-tests-only-32-byte-secret',
  });
  t.after(() => {
    process.env = saved;
  });
  await t.test(
    'passwordless Google accounts never authenticate against the timing fallback hash',
    async (ct) => {
      ct.mock.method(argon2, 'verify', async () => true);
      const auth = new AuthController(
        {
          user: {
            findFirst: async () => ({
              id: 'google-only',
              email: 'user@gmail.com',
              passwordHash: null,
              role: 'USER',
            }),
          },
        } as unknown as Database,
        {
          create: async () => {
            throw new Error('Must not create a password session');
          },
        } as unknown as Sessions,
      );
      await assert.rejects(
        () =>
          auth.login({ cookies: {} } as AuthRequest, {} as Response, {
            email: 'user@gmail.com',
            password: 'some-password',
          }),
        /Email hoặc mật khẩu chưa đúng/,
      );
    },
  );
  const flow = {
    state: 's'.repeat(43),
    nonce: 'n'.repeat(43),
    verifier: 'v'.repeat(43),
    returnTo: '/yeu-thich',
    expires: Date.now() + 60000,
  };
  const payload = {
    iss: 'https://accounts.google.com',
    aud: process.env.GOOGLE_CLIENT_ID!,
    sub: 'google-subject-123',
    email: 'test@gmail.com',
    email_verified: true,
    nonce: flow.nonce,
    name: 'Test Cook',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 300,
  };

  await t.test('rejects tampered, expired and mismatched state cookies and open redirects', () => {
    const cookie = sealGoogleFlow(flow);
    assert.equal(readGoogleFlow(cookie, flow.state).returnTo, '/yeu-thich');
    for (const [value, state] of [
      [undefined, flow.state],
      [cookie, 'wrong'],
      [cookie + 'tampered', flow.state],
      [cookie, ['array']],
    ])
      assert.throws(() => readGoogleFlow(value, state), /invalid_state/);
    assert.throws(() => readGoogleFlow(cookie, flow.state, flow.expires), /invalid_state/);
    for (const path of [
      'https://evil.invalid',
      '//evil.invalid',
      '/\\evil.invalid',
      '/api/v1/auth/google/callback',
      '/dang-nhap',
      '/%ZZ',
    ])
      assert.equal(safeReturnTo(path), '/thuc-don');
    assert.equal(safeReturnTo('/kham-pha?q=rau#mon'), '/kham-pha?q=rau#mon');
  });
  await t.test('rejects unverified emails and nonce mismatch; distinguishes authoritative email', () => {
    assert.throws(() => googleProfile({ ...payload, email_verified: false }, flow.nonce), /invalid_identity/);
    assert.throws(() => googleProfile(payload, 'wrong-nonce'), /invalid_identity/);
    assert.equal(googleProfile(payload, flow.nonce).authoritative, true);
    assert.equal(googleProfile({ ...payload, email: 'user@example.com' }, flow.nonce).authoritative, false);
    assert.equal(
      googleProfile({ ...payload, email: 'user@example.com', hd: 'example.com' }, flow.nonce).authoritative,
      true,
    );
  });
  await t.test(
    'official verifier rejects wrong signature, audience, issuer, expiry and nonce',
    async (ct) => {
      const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
      const other = generateKeyPairSync('rsa', { modulusLength: 2048 });
      let claims = { ...payload };
      let key = privateKey;
      ct.mock.method(
        OAuth2Client.prototype,
        'getToken',
        async (options: { code: string; codeVerifier: string }) => {
          assert.equal(options.codeVerifier, flow.verifier);
          const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test-key' })).toString('base64url');
          const body = Buffer.from(JSON.stringify(claims)).toString('base64url');
          const data = `${header}.${body}`;
          return {
            tokens: {
              id_token: `${data}.${sign('RSA-SHA256', Buffer.from(data), key).toString('base64url')}`,
            },
          };
        },
      );
      ct.mock.method(OAuth2Client.prototype, 'getFederatedSignonCertsAsync', async () => ({
        certs: { 'test-key': publicKey.export({ type: 'spki', format: 'pem' }) },
        format: 'PEM',
      }));
      const service = new GoogleAuth({} as Database);
      assert.equal((await service.exchange('test-code', flow)).subject, payload.sub);
      for (const change of [
        { aud: 'another-client' },
        { iss: 'https://evil.invalid' },
        { exp: Math.floor(Date.now() / 1000) - 600 },
        { nonce: 'wrong' },
        { email_verified: false },
      ]) {
        claims = { ...payload, ...change };
        await assert.rejects(() => service.exchange('test-code', flow), /invalid_identity/);
      }
      claims = { ...payload };
      key = other.privateKey;
      await assert.rejects(() => service.exchange('test-code', flow), /invalid_identity/);
    },
  );

  const users = new Map<string, any>();
  const identities = new Map<string, any>();
  let sequence = 0;
  const db: any = {
    googleIdentity: {
      findUnique: async ({ where }: any) => {
        const identity = identities.get(where.subject);
        return identity ? { ...identity, user: users.get(identity.userId) } : null;
      },
      create: async ({ data }: any) => {
        identities.set(data.subject, data);
        return data;
      },
    },
    user: {
      findUnique: async ({ where }: any) => {
        const user = [...users.values()].find((u) => u.email === where.email);
        return user
          ? { ...user, googleIdentity: [...identities.values()].find((i) => i.userId === user.id) || null }
          : null;
      },
      create: async ({ data }: any) => {
        const { googleIdentity, ...fields } = data;
        const user = { id: `user-${++sequence}`, role: 'USER', ...fields };
        users.set(user.id, user);
        identities.set(googleIdentity.create.subject, {
          subject: googleIdentity.create.subject,
          userId: user.id,
        });
        return user;
      },
    },
    session: { deleteMany: async () => ({ count: 1 }) },
  };
  db.$transaction = (fn: (tx: any) => unknown) => fn(db);
  const service = new GoogleAuth(db);
  await t.test(
    'creates passwordless users, preserves identity on email change and links only trusted email',
    async () => {
      const profile = googleProfile(payload, flow.nonce);
      const created = await service.resolveUser(profile);
      assert.equal(created.passwordHash, null);
      assert.equal(created.role, 'USER');
      assert.equal((await service.resolveUser({ ...profile, email: 'changed@gmail.com' })).id, created.id);
      assert.equal(users.size, 1);
      users.set('existing', {
        id: 'existing',
        role: 'USER',
        email: 'existing@gmail.com',
        passwordHash: 'keep-existing-hash',
      });
      const linked = await service.resolveUser({
        ...profile,
        subject: 'second-sub',
        email: 'existing@gmail.com',
      });
      assert.equal(linked.id, 'existing');
      assert.equal(linked.passwordHash, 'keep-existing-hash');
      await assert.rejects(
        () => service.resolveUser({ ...profile, subject: 'third-sub', email: 'existing@gmail.com' }),
        /email_conflict/,
      );
      users.set('external', { id: 'external', role: 'USER', email: 'external@example.com' });
      await assert.rejects(
        () =>
          service.resolveUser({
            ...profile,
            subject: 'external-sub',
            email: 'external@example.com',
            authoritative: false,
          }),
        /email_conflict/,
      );
      assert.equal(identities.has('external-sub'), false);
    },
  );

  await t.test(
    'HTTP: CSRF required, consent cancellation, callback session and credential-free redirect',
    async (ct) => {
      let sessionsCreated = 0;
      class GoogleTestModule {}
      Module({
        controllers: [GoogleAuthController, AuthController],
        providers: [
          GoogleAuth,
          { provide: Database, useValue: db },
          {
            provide: Sessions,
            useValue: {
              create: async (_id: string, res: Response) => {
                sessionsCreated++;
                res.cookie(sessionCookie, 'test-session', cookieOptions);
                return 'csrf';
              },
            },
          },
        ],
      })(GoogleTestModule);
      const app = await NestFactory.create(GoogleTestModule, { logger: false });
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
      ct.after(() => app.close());
      const base = await app.getUrl();
      assert.equal((await (await fetch(`${base}/api/v1/auth/google/status`)).json()).data.enabled, true);
      const rejected = await fetch(`${base}/api/v1/auth/google/start`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      });
      assert.equal(rejected.status, 403);
      const csrfRes = await fetch(`${base}/api/v1/auth/csrf`);
      const csrfToken = (await csrfRes.json()).data.csrfToken;
      const cookie = csrfRes.headers
        .getSetCookie()
        .map((c) => c.split(';')[0])
        .join('; ');
      const start = await fetch(`${base}/api/v1/auth/google/start`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: appOrigin, cookie, 'x-csrf-token': csrfToken },
        body: JSON.stringify({ returnTo: '/yeu-thich' }),
      });
      assert.equal(start.status, 201);
      const authUrl = new URL((await start.json()).data.authorizationUrl);
      assert.equal(authUrl.origin, 'https://accounts.google.com');
      assert.equal(authUrl.searchParams.get('code_challenge_method'), 'S256');
      assert.equal(authUrl.searchParams.get('redirect_uri'), process.env.GOOGLE_REDIRECT_URI);
      assert.equal(authUrl.searchParams.get('scope'), 'openid email profile');
      assert.equal(authUrl.searchParams.has('client_secret'), false);
      const flowCookie = start.headers.getSetCookie().find((c) => c.startsWith(googleFlowCookie + '='))!;
      assert.match(flowCookie, /HttpOnly/);
      assert.match(flowCookie, /SameSite=Lax/);
      const headers = { cookie: flowCookie.split(';')[0] };
      const state = authUrl.searchParams.get('state')!;
      const invalid = await fetch(`${base}/api/v1/auth/google/callback?code=code&state=wrong`, {
        headers,
        redirect: 'manual',
      });
      assert.match(invalid.headers.get('location')!, /google_error=invalid_state/);
      const cancelled = await fetch(
        `${base}/api/v1/auth/google/callback?error=access_denied&state=${state}`,
        { headers, redirect: 'manual' },
      );
      assert.match(cancelled.headers.get('location')!, /google_error=cancelled/);
      assert.equal(sessionsCreated, 0);
      ct.mock.method(app.get(GoogleAuth), 'exchange', async () => googleProfile(payload, flow.nonce));
      const success = await fetch(`${base}/api/v1/auth/google/callback?code=test-code&state=${state}`, {
        headers,
        redirect: 'manual',
      });
      assert.equal(success.status, 302);
      assert.equal(success.headers.get('location'), `${appOrigin}/yeu-thich`);
      assert.equal(sessionsCreated, 1);
      assert.ok(success.headers.getSetCookie().some((c) => c.startsWith(sessionCookie + '=')));
      assert.ok(success.headers.getSetCookie().some((c) => c.startsWith(googleFlowCookie + '=;')));
      delete process.env.GOOGLE_CLIENT_SECRET;
      assert.equal((await (await fetch(`${base}/api/v1/auth/google/status`)).json()).data.enabled, false);
    },
  );
});
