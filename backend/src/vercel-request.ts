import type { Request } from 'express';

// Vercel adds rewrite capture parameters to URL/query. They are routing metadata,
// not application input; strict API schemas must see only the caller's real query.
export function normalizeVercelRequest(req: Request) {
  const url = new URL(req.url || '/', 'http://vercel.internal');
  url.searchParams.delete('__cookora_route');
  req.url = url.pathname + url.search;
  if (req.query && typeof req.query === 'object') delete req.query.__cookora_route;
}
