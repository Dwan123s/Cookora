import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response, NextFunction } from 'express';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';

// One HTTPS origin keeps relative API calls, CSRF and session cookies working on Render Free.
export function mountFrontend(app: NestExpressApplication, directory: string) {
  const index = join(directory, 'index.html');
  if (!existsSync(index)) throw new Error('Frontend build is missing. Run npm run build first.');
  app.useStaticAssets(directory, {
    index: false,
    redirect: false,
    dotfiles: 'deny',
    setHeaders(res, path) {
      res.setHeader(
        'Cache-Control',
        path.includes('/assets/') || path.includes('\\assets\\')
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=300',
      );
    },
  });
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (
      !['GET', 'HEAD'].includes(req.method) ||
      req.path === '/api' ||
      req.path.startsWith('/api/') ||
      req.path.split('/').some((part) => part.startsWith('.')) ||
      extname(req.path) ||
      !req.accepts('html')
    )
      return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(index);
  });
}
