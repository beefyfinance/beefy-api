import Koa from 'koa';

export function setNoCacheHeaders(ctx: Koa.Context) {
  ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  ctx.set('Pragma', 'no-cache');
  ctx.set('Expires', '0');
}
