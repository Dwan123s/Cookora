import type { Request, Response } from 'express';
import { createApp } from './main';
import { normalizeVercelRequest } from './vercel-request';

// One boot/pool per warm Function instance; no listening socket inside Vercel.
let initialized: ReturnType<typeof createApp> | undefined;
export default async function handler(req: Request, res: Response) {
  normalizeVercelRequest(req);
  if (!initialized)
    initialized = createApp().then(async (app) => {
      await app.init();
      return app;
    });
  try {
    const app = await initialized;
    app.getHttpAdapter().getInstance()(req, res);
  } catch {
    initialized = undefined;
    console.error(JSON.stringify({ event: 'VERCEL_API_BOOT_FAILED' }));
    if (!res.headersSent)
      res
        .status(503)
        .json({ error: { code: 'API_UNAVAILABLE', message: 'Máy chủ chưa sẵn sàng. Vui lòng thử lại.' } });
  }
}
