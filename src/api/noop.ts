import type { Context, Next } from 'koa';

async function noop(ctx: Context, next: Next) {
  ctx.status = 200;
}

export default noop;
