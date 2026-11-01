import 'reflect-metadata';
import './config';
import { NestFactory } from '@nestjs/core';
import { Module, Controller, Get, Inject, Req, ServiceUnavailableException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { Database } from './db';
import { Catalog, CatalogController } from './catalog';
import { AuthController } from './auth';
import { PlannerController } from './planner';
import { EditorController } from './editor';
import { AiController, AiChefService } from './ai';
import { AuthGuard, EditorGuard, Sessions, checkCsrf } from './security';
import { ApiErrors, ok } from './http';
import { demoEnabled, production, required, sqlConfig } from './config';
@Controller('health')
class HealthController {
  constructor(@Inject(Database) private readonly db: Database) {}
  @Get('live') live(@Req() req: Request) {
    return ok(req, { status: 'ok', service: 'cookora-api', demo: demoEnabled });
  }
  @Get('ready') async ready(@Req() req: Request) {
    try {
      await this.db.$queryRaw`SELECT 1 AS ok`;
      return ok(req, { status: 'ready', database: 'SQL Server' });
    } catch {
      throw new ServiceUnavailableException({
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database chưa sẵn sàng.',
      });
    }
  }
}
@Module({
  controllers: [HealthController, AuthController, CatalogController, PlannerController, EditorController, AiController],
  providers: [Database, Catalog, Sessions, AuthGuard, EditorGuard, AiChefService],
})
class AppModule {}
async function bootstrap() {
  if (required('CSRF_SECRET').length < 32) throw new Error('CSRF_SECRET too short');
  if (production && sqlConfig().options.trustServerCertificate)
    throw new Error('Production requires verified SQL TLS certificate');
  const app = await NestFactory.create(AppModule, { bodyParser: true, logger: ['error', 'warn', 'log'] });
  app.enableShutdownHooks();
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.use(cookieParser());
  const buckets = new Map<string, { start: number; count: number }>();
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of buckets) if (now - value.start > 60000) buckets.delete(key);
  }, 60000);
  cleanup.unref();
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.headers['x-request-id'] = randomUUID();
    res.setHeader('X-Request-Id', req.headers['x-request-id']);
    res.setHeader('Cache-Control', 'no-store');
    const auth = /\/auth\/(login|register)/.test(req.path),
      key = `${req.ip}:${auth ? 'auth' : 'general'}`,
      now = Date.now();
    const bucket = buckets.get(key);
    const current = bucket && now - bucket.start < 60000 ? bucket : { start: now, count: 0 };
    current.count++;
    buckets.set(key, current);
    if (current.count > (auth ? 15 : 300)) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({
        error: { code: 'RATE_LIMITED', message: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau một phút.' },
      });
    }
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      try {
        checkCsrf(req);
      } catch {
        return res.status(403).json({
          error: {
            code: 'CSRF_FAILED',
            message: 'Phiên bảo vệ hoặc nguồn yêu cầu không hợp lệ. Vui lòng tải lại trang.',
          },
          meta: { requestId: req.headers['x-request-id'] },
        });
      }
    }
    next();
  });
  app.useGlobalFilters(new ApiErrors());
  const swagger = new DocumentBuilder()
    .setTitle('Cookora API')
    .setDescription('Local MVP · SQL Server · draft recipe fixtures are development only.')
    .setVersion('0.1.0')
    .addCookieAuth('cookora_session')
    .build();
  if (!production) SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swagger));
  await app.listen(Number(process.env.PORT || 3000), process.env.BIND_HOST || '127.0.0.1');
  console.log('Cookora API: http://localhost:3000/api/v1/health/ready');
}
bootstrap().catch(() => {
  console.error('API startup failed; verify database/environment configuration.');
  process.exitCode = 1;
});
