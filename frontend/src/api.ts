import type { Envelope } from '@cookora/contracts';
let csrf = '';
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export function setCsrf(value: string) {
  csrf = value;
}
async function csrfToken() {
  if (!csrf) {
    const res = await fetch('/api/v1/auth/csrf', { credentials: 'same-origin' });
    if (!res.ok) throw new ApiError(res.status, 'OFFLINE', 'Chưa kết nối được máy chủ.');
    csrf = (await res.json()).data.csrfToken;
  }
  return csrf;
}
export async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
  retried = false,
): Promise<Envelope<T>> {
  const method = options.method || 'GET';
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') headers['X-CSRF-Token'] = await csrfToken();
  let res: Response;
  try {
    res = await fetch(`/api/v1${path}`, {
      method,
      credentials: 'same-origin',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw new ApiError(0, 'OFFLINE', 'Chưa kết nối được máy chủ. Kiểm tra API và SQL Server rồi thử lại.');
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 403 && json?.error?.code === 'CSRF_FAILED' && !retried) {
      csrf = '';
      return request<T>(path, options, true);
    }
    throw new ApiError(
      res.status,
      json?.error?.code || 'ERROR',
      json?.error?.message || 'Không xử lý được yêu cầu. Vui lòng thử lại.',
    );
  }
  return json as Envelope<T>;
}
