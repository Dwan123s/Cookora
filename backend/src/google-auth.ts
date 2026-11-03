import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Response } from 'express';
import { OAuth2Client, CodeChallengeMethod, type TokenPayload } from 'google-auth-library';
import { z } from 'zod';
import { Database } from './db';
import { Sessions, cookieOptions, sessionCookie, hash, type AuthRequest } from './security';
import { appOrigin, production, required } from './config';
import { ok, parse } from './http';

export class GoogleLoginError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}
export const googleFlowCookie = production ? '__Host-cookora_google' : 'cookora_google';
const flowLifetime = 10 * 60 * 1000;
const flowSchema = z.object({
  state: z.string().length(43),
  nonce: z.string().length(43),
  verifier: z.string().length(43),
  returnTo: z.string().max(2048),
  expires: z.number(),
});
type Flow = z.infer<typeof flowSchema>;

export function safeReturnTo(value: unknown): string {
  if (typeof value !== 'string' || value.length > 2048 || !value.startsWith('/') || value.startsWith('//'))
    return '/thuc-don';
  try {
    const target = new URL(value, appOrigin);
    const path = decodeURIComponent(target.pathname);
    if (
      target.origin !== new URL(appOrigin).origin ||
      path.startsWith('/api') ||
      path.startsWith('/dang-nhap')
    )
      return '/thuc-don';
    return target.pathname + target.search + target.hash;
  } catch {
    return '/thuc-don';
  }
}
function equal(a: string, b: string) {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
function signature(body: string) {
  return createHmac('sha256', required('CSRF_SECRET')).update(`google:${body}`).digest('base64url');
}
export function sealGoogleFlow(flow: Flow): string {
  const body = Buffer.from(JSON.stringify(flow)).toString('base64url');
  return `${body}.${signature(body)}`;
}
export function readGoogleFlow(cookie: unknown, state: unknown, now = Date.now()): Flow {
  if (typeof cookie !== 'string' || cookie.length > 4096 || typeof state !== 'string')
    throw new GoogleLoginError('invalid_state');
  const [body, mac, extra] = cookie.split('.');
  if (!body || !mac || extra !== undefined || !equal(mac, signature(body)))
    throw new GoogleLoginError('invalid_state');
  try {
    const flow = flowSchema.parse(JSON.parse(Buffer.from(body, 'base64url').toString('utf8')));
    if (!equal(flow.state, state) || flow.expires <= now || flow.expires > now + flowLifetime)
      throw new Error('Expired or mismatched flow');
    return flow;
  } catch {
    throw new GoogleLoginError('invalid_state');
  }
}
function configuration() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret || clientId === 'CHANGE_ME' || clientSecret === 'CHANGE_ME') return null;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim() || `${appOrigin}/api/v1/auth/google/callback`;
  try {
    const url = new URL(redirectUri);
    const origin = new URL(appOrigin);
    if (
      url.origin !== origin.origin ||
      url.pathname !== '/api/v1/auth/google/callback' ||
      url.search ||
      url.hash ||
      (url.protocol !== 'https:' && (production || !['localhost', '127.0.0.1'].includes(url.hostname)))
    )
      return null;
  } catch {
    return null;
  }
  return { clientId, clientSecret, redirectUri };
}

export function googleProfile(payload: (TokenPayload & { nonce?: string }) | undefined, nonce: string) {
  if (
    !payload ||
    !payload.sub ||
    payload.sub.length > 255 ||
    payload.nonce !== nonce ||
    payload.email_verified !== true ||
    !payload.email ||
    !z.email().max(254).safeParse(payload.email).success
  )
    throw new GoogleLoginError('invalid_identity');
  const email = payload.email.toLowerCase().trim();
  return {
    subject: payload.sub,
    email,
    displayName: (payload.name?.trim() || email.split('@')[0]).slice(0, 100),
    authoritative: email.endsWith('@gmail.com') || Boolean(payload.hd),
  };
}
type GoogleProfile = ReturnType<typeof googleProfile>;

@Injectable()
export class GoogleAuth {
  constructor(@Inject(Database) private readonly db: Database) {}
  enabled() {
    return Boolean(configuration());
  }
  private client() {
    const config = configuration();
    if (!config) throw new GoogleLoginError('not_configured');
    return new OAuth2Client({ ...config, transporterOptions: { timeout: 10000, retry: false } });
  }
  start(res: Response, returnTo: unknown) {
    const flow: Flow = {
      state: randomBytes(32).toString('base64url'),
      nonce: randomBytes(32).toString('base64url'),
      verifier: randomBytes(32).toString('base64url'),
      returnTo: safeReturnTo(returnTo),
      expires: Date.now() + flowLifetime,
    };
    const authorizationUrl = this.client().generateAuthUrl({
      scope: ['openid', 'email', 'profile'],
      response_type: 'code',
      state: flow.state,
      nonce: flow.nonce,
      prompt: 'select_account',
      code_challenge: createHash('sha256').update(flow.verifier).digest('base64url'),
      code_challenge_method: CodeChallengeMethod.S256,
    });
    res.cookie(googleFlowCookie, sealGoogleFlow(flow), { ...cookieOptions, maxAge: flowLifetime });
    return authorizationUrl;
  }
  async exchange(code: string, flow: Flow) {
    const client = this.client();
    try {
      const { tokens } = await client.getToken({ code, codeVerifier: flow.verifier });
      if (!tokens.id_token) throw new Error('Missing ID token');
      // The official library checks Google's signature, issuer, audience and expiry.
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: configuration()!.clientId,
      });
      return googleProfile(ticket.getPayload(), flow.nonce);
    } catch {
      throw new GoogleLoginError('invalid_identity');
    }
  }
  async resolveUser(profile: GoogleProfile) {
    try {
      return await this.db.$transaction(async (tx) => {
        const identity = await tx.googleIdentity.findUnique({
          where: { subject: profile.subject },
          include: { user: true },
        });
        if (identity) return identity.user;
        const existing = await tx.user.findUnique({
          where: { email: profile.email },
          include: { googleIdentity: true },
        });
        if (existing) {
          if (existing.googleIdentity || !profile.authoritative) throw new GoogleLoginError('email_conflict');
          // Only Google's authoritative Gmail/Workspace email may link an existing account.
          await tx.googleIdentity.create({ data: { subject: profile.subject, userId: existing.id } });
          return existing;
        }
        return tx.user.create({
          data: {
            email: profile.email,
            displayName: profile.displayName,
            passwordHash: null,
            googleIdentity: { create: { subject: profile.subject } },
          },
        });
      });
    } catch (error) {
      // Two tabs can complete concurrently. Recover only the exact Google identity.
      if ((error as { code?: string }).code === 'P2002') {
        const identity = await this.db.googleIdentity.findUnique({
          where: { subject: profile.subject },
          include: { user: true },
        });
        if (identity) return identity.user;
        throw new GoogleLoginError('email_conflict');
      }
      throw error;
    }
  }
}

@Controller('auth/google')
export class GoogleAuthController {
  constructor(
    @Inject(GoogleAuth) private readonly google: GoogleAuth,
    @Inject(Sessions) private readonly sessions: Sessions,
    @Inject(Database) private readonly db: Database,
  ) {}
  @Get('status') status(@Req() req: AuthRequest) {
    return ok(req, { enabled: this.google.enabled() });
  }
  @Post('start') start(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() body: unknown,
  ) {
    const input = parse(z.object({ returnTo: z.string().max(2048).optional() }).strict(), body);
    if (!this.google.enabled())
      throw new ServiceUnavailableException({
        code: 'GOOGLE_NOT_CONFIGURED',
        message: 'Đăng nhập Google chưa được cấu hình. Vui lòng dùng email và mật khẩu.',
      });
    return ok(req, { authorizationUrl: this.google.start(res, input.returnTo) });
  }
  @Get('callback') async callback(@Req() req: AuthRequest, @Res() res: Response) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    const cookie = req.cookies?.[googleFlowCookie];
    res.clearCookie(googleFlowCookie, cookieOptions);
    try {
      const flow = readGoogleFlow(cookie, req.query.state);
      if (req.query.error)
        throw new GoogleLoginError(req.query.error === 'access_denied' ? 'cancelled' : 'invalid_identity');
      if (typeof req.query.code !== 'string' || !req.query.code || req.query.code.length > 4096)
        throw new GoogleLoginError('invalid_identity');
      const profile = await this.google.exchange(req.query.code, flow);
      const user = await this.google.resolveUser(profile);
      if (production && user.role !== 'USER') throw new GoogleLoginError('mfa_required');
      if (typeof req.cookies?.[sessionCookie] === 'string')
        await this.db.session.deleteMany({ where: { tokenHash: hash(req.cookies[sessionCookie]) } });
      await this.sessions.create(user.id, res);
      return res.redirect(new URL(safeReturnTo(flow.returnTo), appOrigin).href);
    } catch (error) {
      const target = new URL('/dang-nhap', appOrigin);
      target.searchParams.set(
        'google_error',
        error instanceof GoogleLoginError ? error.code : 'temporarily_unavailable',
      );
      return res.redirect(target.href);
    }
  }
}
