import { Prisma } from '@prisma/client';

const connectionCodes = new Set([
  'P1000',
  'P1001',
  'P1002',
  'P1003',
  'P1008',
  'P1010',
  'P1011',
  'P1017',
  'P2024',
  'P2037',
  'ESOCKET',
  'ELOGIN',
  'ETIMEOUT',
  'ECONNCLOSED',
  'ENOTOPEN',
  'EINSTLOOKUP',
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'ETIMEDOUT',
]);

// Only expose fixed diagnostic codes; Prisma messages can contain SQL and credentials.
export function databaseErrorCode(error: unknown): string | undefined {
  const code =
    error instanceof Prisma.PrismaClientKnownRequestError
      ? error.code
      : error instanceof Prisma.PrismaClientInitializationError
        ? error.errorCode
        : undefined;
  return code && (/^P\d{4}$/.test(code) || connectionCodes.has(code)) ? code : undefined;
}

export function databaseFailure(error: unknown) {
  const code = databaseErrorCode(error);
  if (code === 'P2021' || code === 'P2022')
    return {
      code: 'DATABASE_SCHEMA_OUTDATED',
      message: 'Cấu trúc database chưa được cập nhật. Vui lòng chạy migration trước khi sử dụng.',
    };
  if ((code && connectionCodes.has(code)) || error instanceof Prisma.PrismaClientInitializationError)
    return {
      code: 'DATABASE_UNAVAILABLE',
      message: 'Không thể kết nối database. Vui lòng kiểm tra dịch vụ database và cấu hình kết nối.',
    };
  return undefined;
}
