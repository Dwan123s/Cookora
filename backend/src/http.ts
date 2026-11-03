import { ArgumentsHost, Catch, ExceptionFilter, HttpException, BadRequestException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodError, type ZodType } from 'zod';
import { randomUUID } from 'node:crypto';
import { databaseErrorCode, databaseFailure } from './database-errors';
export function parse<T>(schema: ZodType<T>, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (e) {
    if (e instanceof ZodError)
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        message: 'Vui lòng kiểm tra thông tin đã nhập.',
        details: e.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
    throw e;
  }
}
export function ok<T>(req: Request, data: T, extra: Record<string, unknown> = {}) {
  return { data, meta: { requestId: String(req.headers['x-request-id'] || randomUUID()), ...extra } };
}
@Catch()
export class ApiErrors implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp(),
      res = ctx.getResponse<Response>(),
      req = ctx.getRequest<Request>();
    const databaseError = error instanceof HttpException ? error.cause : error;
    const failure = databaseFailure(databaseError);
    const status = error instanceof HttpException ? error.getStatus() : failure ? 503 : 500;
    const body = error instanceof HttpException ? error.getResponse() : null;
    const details: Record<string, unknown> =
      typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : failure || {};
    if (status >= 500)
      console.error(
        JSON.stringify({
          level: 'error',
          requestId: req.headers['x-request-id'],
          type: error instanceof Error ? error.constructor.name : 'Unknown',
          code: details.code || 'INTERNAL_ERROR',
          databaseCode: databaseErrorCode(databaseError),
        }),
      );
    res.status(status).json({
      error: {
        code: details.code || (status === 500 ? 'INTERNAL_ERROR' : `HTTP_${status}`),
        message:
          details.message ||
          (status === 500 ? 'Máy chủ chưa xử lý được yêu cầu. Vui lòng thử lại.' : String(body)),
        ...(details.details ? { details: details.details } : {}),
      },
      meta: { requestId: req.headers['x-request-id'] },
    });
  }
}
