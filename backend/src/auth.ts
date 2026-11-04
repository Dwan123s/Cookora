import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { z } from 'zod';
import argon2 from 'argon2';
import { Database } from './db';
import { Sessions, AuthGuard, cookieOptions, sessionCookie, issueCsrf, type AuthRequest } from './security';
import { ok, parse } from './http';
import { production } from './config';
const credentials = z
  .object({
    email: z
      .string()
      .min(1, 'Vui lòng nhập tài khoản hoặc email')
      .max(254)
      .transform((v) => v.toLowerCase().trim()),
    password: z.string().min(6, 'Mật khẩu cần ít nhất 6 ký tự').max(128),
  })
  .strict();
const userDto = (u: { id: string; email: string; displayName: string; role: string }) => ({
  id: u.id,
  email: u.email,
  displayName: u.displayName,
  role: u.role,
});
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(Database) private readonly db: Database,
    @Inject(Sessions) private readonly sessions: Sessions,
  ) {}
  @Get('csrf') csrf(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) {
    res.setHeader('Cache-Control', 'no-store');
    return ok(req, { csrfToken: issueCsrf(res) });
  }
  @Post('register') async register(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() body: unknown,
  ) {
    const input = parse(credentials.extend({
      email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
      displayName: z.string().trim().min(2).max(100),
    }), body);
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    let user;
    try {
      user = await this.db.user.create({
        data: { email: input.email, displayName: input.displayName, passwordHash },
      });
    } catch (e: any) {
      if (e.code === 'P2002')
        throw new ConflictException({
          code: 'EMAIL_UNAVAILABLE',
          message: 'Không thể đăng ký email này. Hãy thử đăng nhập.',
        });
      throw e;
    }
    const csrfToken = await this.sessions.create(user.id, res);
    return ok(req, { user: userDto(user), csrfToken });
  }
  @Post('login') async login(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() body: unknown,
  ) {
    const input = parse(credentials, body),
      user = await this.db.user.findFirst({
        where: {
          OR: [
            { email: input.email },
            { email: `${input.email}@gmail.com` },
          ],
        },
      });
    const fallbackHash =
      '$argon2id$v=19$m=65536,t=3,p=4$MTIzNDU2Nzg5MGFiY2RlZg$cXrEQfoe4T4YgJvVQH7HoqfSXBqkfbnBAgPKzJ4JF6M';
    const valid = await argon2.verify(user?.passwordHash || fallbackHash, input.password).catch(() => false);
    if (!user || !user.passwordHash || !valid)
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Email hoặc mật khẩu chưa đúng.',
      });
    if (production && user.role !== 'USER')
      throw new ForbiddenException({
        code: 'MFA_NOT_CONFIGURED',
        message: 'Tài khoản quản trị cần hoàn tất MFA trước khi dùng production.',
      });
    if (req.cookies?.[sessionCookie])
      await this.db.session.deleteMany({
        where: { tokenHash: (await import('./security')).hash(req.cookies[sessionCookie]) },
      });
    const csrfToken = await this.sessions.create(user.id, res);
    return ok(req, { user: userDto(user), csrfToken });
  }
  @Get('me') @UseGuards(AuthGuard) me(@Req() req: AuthRequest) {
    return ok(req, req.user);
  }
  @Post('logout') @UseGuards(AuthGuard) async logout(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.db.session.deleteMany({ where: { tokenHash: req.sessionHash } });
    res.clearCookie(sessionCookie, cookieOptions);
    return ok(req, { loggedOut: true, csrfToken: issueCsrf(res) });
  }
}
