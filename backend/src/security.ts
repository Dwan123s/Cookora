import {
  Inject,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import { Database } from './db';
import { appOrigin, production, required } from './config';
import type { User } from '@cookora/contracts';
export type AuthRequest = Request & { user?: User; sessionHash?: string };
export const sessionCookie = production ? '__Host-cookora_session' : 'cookora_session';
export const csrfCookie = production ? '__Host-cookora_csrf' : 'cookora_csrf';
export const cookieOptions = { httpOnly: true, secure: production, sameSite: 'lax' as const, path: '/' };
export const hash = (s: string) => createHash('sha256').update(s).digest('hex');
function equal(a: string, b: string) {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
function signature(s: string) {
  return createHmac('sha256', required('CSRF_SECRET')).update(s).digest('hex');
}
export function issueCsrf(res: Response) {
  const body = `${Date.now()}.${randomBytes(24).toString('hex')}`;
  const token = `${body}.${signature(body)}`;
  res.cookie(csrfCookie, token, { ...cookieOptions, maxAge: 86400000 });
  return token;
}
export function checkCsrf(req: Request) {
  const origin = req.get('origin');
  const allowed = production ? [appOrigin] : [appOrigin, 'http://127.0.0.1:5173'];
  if (!origin || !allowed.includes(origin))
    throw new ForbiddenException({ code: 'CSRF_ORIGIN', message: 'Nguồn yêu cầu không hợp lệ.' });
  const token = req.get('x-csrf-token') || '',
    cookie = req.cookies?.[csrfCookie] || '';
  const parts = token.split('.'),
    body = parts.slice(0, 2).join('.');
  if (
    parts.length !== 3 ||
    !equal(token, cookie) ||
    !equal(parts[2], signature(body)) ||
    Date.now() - Number(parts[0]) > 86400000 ||
    Number(parts[0]) > Date.now()
  )
    throw new ForbiddenException({
      code: 'CSRF_FAILED',
      message: 'Phiên bảo vệ đã hết hạn. Vui lòng tải lại trang.',
    });
}
@Injectable()
export class Sessions {
  constructor(@Inject(Database) private readonly db: Database) {}
  async identify(req: AuthRequest): Promise<User> {
    const token = req.cookies?.[sessionCookie];
    if (!token || typeof token !== 'string' || token.length > 200)
      throw new UnauthorizedException({ code: 'AUTH_REQUIRED', message: 'Bạn cần đăng nhập để tiếp tục.' });
    const session = await this.db.session.findUnique({
      where: { tokenHash: hash(token) },
      include: { user: true },
    });
    if (!session || session.expiresAt <= new Date())
      throw new UnauthorizedException({ code: 'SESSION_EXPIRED', message: 'Phiên đăng nhập đã hết hạn.' });
    req.sessionHash = session.tokenHash;
    const { id, email, displayName, role } = session.user;
    return (req.user = { id, email, displayName, role: role as User['role'] });
  }
  async create(userId: string, res: Response) {
    const token = randomBytes(32).toString('base64url');
    await this.db.session.create({
      data: { userId, tokenHash: hash(token), expiresAt: new Date(Date.now() + 7 * 86400000) },
    });
    res.cookie(sessionCookie, token, { ...cookieOptions, maxAge: 7 * 86400000 });
    return issueCsrf(res);
  }
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(Sessions) private readonly sessions: Sessions) {}
  async canActivate(ctx: ExecutionContext) {
    await this.sessions.identify(ctx.switchToHttp().getRequest<AuthRequest>());
    return true;
  }
}
@Injectable()
export class EditorGuard implements CanActivate {
  constructor(@Inject(Sessions) private readonly sessions: Sessions) {}
  async canActivate(ctx: ExecutionContext) {
    const user = await this.sessions.identify(ctx.switchToHttp().getRequest<AuthRequest>());
    if (!['EDITOR', 'ADMIN'].includes(user.role))
      throw new ForbiddenException('Bạn không có quyền biên tập.');
    return true;
  }
}
